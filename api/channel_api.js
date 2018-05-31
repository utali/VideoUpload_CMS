var express = require('express'),
	bodyParser = require('body-parser'),
	https = require('https'),
	router = express.Router(),
	fs = require('fs'),
	api_extends = require('./api_extends'),
	resource = require('./../resource'),
	debug = false;
var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT;
var cacheObject = {};

/**
 * @alias 添加频道
 */
router.route('/add').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		channelName: data.channelName,//频道（栏目）名称 必录项
		mnemonic: data.mnemonic,//助记符 非必录项
		comment: data.comment,//频道（栏目）描述 非必录项
		keyword: data.keyword,//频道（栏目）关键字 非必录项
		img: data.img,//频道缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"] 非必录项
		channelType: data.channelType,//频道类型 1--固定频道 2--自定义频道 selectOne 编码定义：channelType 必录
		parentChannelId: data.parentChannelId//父频道ID 非必录
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel',
		method: 'POST',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			"Content-Type": 'application/json',
			"Content-Length": Buffer.byteLength(post_data),
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            errCode: 0,
			            message:{
					        _id: '11111111111111111111111' //频道的ID
					        channelName: '娱乐',//频道名称
					        mnemonic: '',//助记符
					        comment: '',//描述
					        updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
					        creatorName: '超级管理员',//创建者名称
					        order: 17//序号
			            }
			        }*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});
	interfaceReq.write(post_data);
	interfaceReq.end();
});

/**
 * @alias 修改频道信息
 */
router.route('/modify/:channelId').put(function (req, res, next) {
	var data = req.body,
		channelId = req.params.channelId,//频道ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		channelName: data.channelName,//频道（栏目）名称 必录项
		mnemonic: data.mnemonic,//助记符 非必录项
		comment: data.comment,//频道（栏目）描述 非必录项
		keyword: data.keyword,//频道（栏目）关键字 非必录项
		img: data.img,//频道缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"] 非必录项
		channelType: data.channelType,//频道类型 1--固定频道 2--自定义频道
		parentChannelId: data.parentChannelId//父频道ID
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel/' + channelId,
		method: 'PUT',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			"Content-Type": 'application/json',
			"Content-Length": Buffer.byteLength(post_data),
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            errCode: 0,
			            message:{
					        channelId: '11111111111111111111111', //频道的ID
					        channelName: '娱乐', //频道名称
					        updated_at: '2015-07-02T09:20:40.000Z',//最后更新时间
					        creatorName: '超级管理员'//创建者名称
			            }
			        }*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});
	interfaceReq.write(post_data);
	interfaceReq.end();
});

/**
 * @alias 调整频道顺序接口
 */
router.route('/order/:channelType').put(function (req, res, next) {
	var data = req.body,
		channelType = req.params.channelType == 'a' ? '' : req.params.channelType,//频道类型
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		channelType: channelType,
		channelIds: data.channelIds//频道ID集合数组，按照最终顺序 必录项
		//格式： data.channelIds = ['11111111111111111111111','222222222222222222222222','333333333333333333333333']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel/order',
		method: 'PUT',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			"Content-Type": 'application/json',
			"Content-Length": Buffer.byteLength(post_data),
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					sysattObject = JSON.parse(chunks).message;
					delete cacheObject[sysattObject.domain];
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            errCode: 0,
			            message:{
			            }
			        }*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});
	interfaceReq.write(post_data);
	interfaceReq.end();
});

/**
 * @alias 移除频道
 */
router.route('/remove/:channelId').delete(function (req, res, next) {
	var data = req.body,
		channelId = req.params.channelId,//频道ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel/' + channelId,
		method: 'DELETE',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			"Content-Type": 'application/json',
			"Content-Length": Buffer.byteLength(post_data),
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            errCode: 0,
			            message:{
					        channelId: '11111111111111111111111', //频道的ID
					        channelName: '娱乐', //频道名称
					        updated_at: '2015-07-02T09:20:40.000Z',//最后更新时间
					        creatorName: '超级管理员'//创建者名称
			            }
			        }*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});
	interfaceReq.write(post_data);
	interfaceReq.end();
});

/**
 * @alias 获取频道列表，按照序号从小到大排序
 */
router.route('/:channelName/:keyword/:channelType/:lastChannelId/:pageSize/batch').get(function (req, res, next) {
	var channelName = req.params.channelName == 'a' ? '' : encodeURI(req.params.channelName),//频道名称 支持模糊查询
		keyword = req.params.keyword == 'a' ? '' : encodeURI(req.params.keyword),//频道关键字 支持模糊查询
		channelType = req.params.channelType == 'a' ? '' : req.params.channelType,//频道类型，1--固定频道 2--自定义频道
		lastChannelId = req.params.lastChannelId,//上一组频道中最后一个频道的ID，置入0表示从头开始
		pageSize = req.params.pageSize,//一次获取的频道数量
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel/' + channelName + ',' + keyword + ',' + channelType + ',' + lastChannelId + ',' + pageSize + '/batch',
		method: 'GET',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            errCode: 0,
			            message:{
			                uid: uid, //用户ID
			                count: 10,//所有有效的工作组集合数量
							channelList://返回数据集合
							[
								{
									"_id":"55c997b76d14386506000002",//频道ID
									"channelName":"热点",//频道名称
									"mnemonic":"redian",//频道助记符
									"comment":"热点频道",//频道描述
									"keyword":"rd",//频道关键字
									channelType: '1',//频道类型
									img: ['',''],//频道缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"]
									parentChannelId: '',//父频道ID
									"creatorId":"5596159630cabc1896cc0809",//创建者id
									"creatorName":"超级管理员sup",//创建者名称
									"order":1,//序号
									"updated_at":"2015-08-11T14:35:35.000Z"//更新日期
			                    },{
								...
			                    }
			                ]
			            }
			        }*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});

	interfaceReq.end();
});

/**
 * @alias 根据父频道获取子频道列表，按照序号从小到大排序
 */
router.route('/:parentChannelId/:lastChannelId/:pageSize/batch').get(function (req, res, next) {
	var parentChannelId = req.params.parentChannelId == 'a' ? '' : req.params.parentChannelId,//父频道ID
		lastChannelId = req.params.lastChannelId,//上一组频道中最后一个频道的ID，置入0表示从头开始
		pageSize = req.params.pageSize,//一次获取的频道数量
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel/' + parentChannelId + ',' + lastChannelId + ',' + pageSize + '/batch',
		method: 'GET',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            errCode: 0,
			            message:{
			                uid: uid, //用户ID
			                count: 10,//所有有效的工作组集合数量
							channelList://返回数据集合
							[
								{
									"_id":"55c997b76d14386506000002",//频道ID
									"channelName":"热点",//频道名称
									"mnemonic":"redian",//频道助记符
									"comment":"热点频道",//频道描述
									"keyword":"rd",//频道关键字
									channelType: '1',//频道类型
									img: ['',''],//频道缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"]
									parentChannelId: '',//父频道ID
									"creatorId":"5596159630cabc1896cc0809",//创建者id
									"creatorName":"超级管理员sup",//创建者名称
									"order":1,//序号
									"updated_at":"2015-08-11T14:35:35.000Z"//更新日期
			                    },{
								...
			                    }
			                ]
			            }
			        }*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});

	interfaceReq.end();
});

/**
 * @alias 根据子频道获取父频道信息
 */
router.route('/child/:childChannelId').get(function (req, res, next) {
	var childChannelId = req.params.childChannelId == 'a' ? '' : req.params.childChannelId,//父频道ID
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel/child/' + childChannelId,
		method: 'GET',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            errCode: 0,
			            message:{
			                {
						        "_id":"55c997b76d14386506000002",//频道ID
						        "channelName":"热点",//频道名称
						        "mnemonic":"redian",//助记符
						        "comment":"热点频道",//频道描述
						        "keyword":"rd",//频道关键字
						        channelType: '1',//频道类型
						        img: ['',''],//频道缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"]
						        parentChannelId: '', //父频道ID
						        "creatorId":"5596159630cabc1896cc0809",//创建人ID
						        "creatorName":"超级管理员sup",//创建者姓名
						        "order":1,//序号
						        "updated_at":"2015-08-11T14:35:35.000Z"//更新日期
			                }
			            }
			        }*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});

	interfaceReq.end();
});


/**
 * @alias 获取频道信息
 */
router.route('/:channelId').get(function (req, res, next) {
	var channelId = req.params.channelId,//频道id
		sign = req.headers['sign'];//登录凭据;//工作组ID

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/channel/' + channelId,
		method: 'GET',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			sign: sign + Date.parse(new Date()) / 1000
		}
	};

	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS: ' + interfaceRes.statusCode);
		console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = "";
			interfaceRes.on('data', function (chunk) {
				chunks += chunk;
			});
			interfaceRes.on('end', function () {
				try {
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
						errCode: 0,
			            message:
			            {
					        "_id":"55c997b76d14386506000002",//频道ID
					        "channelName":"热点",//频道名称
					        "mnemonic":"redian",//助记符
					        "comment":"热点频道",//频道描述
					        "keyword":"rd",//频道关键字
					        channelType: '1',//频道类型
					        img: ['',''],//频道缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"]
					        parentChannelId: '', //父频道ID
					        "creatorId":"5596159630cabc1896cc0809",//创建人ID
					        "creatorName":"超级管理员sup",//创建者姓名
					        "order":1,//序号
					        "updated_at":"2015-08-11T14:35:35.000Z"//更新日期
			            }
					}*/
				} catch (err) {
					console.log('err=' + err);
				}
			});
		} else {
			next();
		}
	});
	interfaceReq.end();
});


module.exports = router;
