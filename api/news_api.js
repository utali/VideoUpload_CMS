var express = require('express'),
	https = require('https'),
	router = express.Router(),
	fs = require('fs'),
	api_extends = require('./api_extends'),
	resource = require('./../resource'),
	debug = false;
var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT;
var cacheObject = {};



/**
 * @alias 添加新闻
 */
router.route('/add').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		title: data.title,//标题 字符 必录项
		abs: data.abs,//摘要 字符 必录项
		relSource: data.relSource,//稿源 字符 非必录
		imgs: data.imgs,//缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"] 必录项
		isRound: data.isRound,//设置轮显新闻（默认不勾选） 字符 必录 0--不是 1--是
		roundImgs: data.roundImgs,//轮显图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"] 非必录
		isStick: data.isStick,//设置置顶新闻（默认不勾选） 字符 必录 0--不是 1--是
		stickOrder: data.stickOrder,//置顶序号 数值 非必录
		isComment: data.isComment,//是否允许评论（默认勾选） 字符 必录 0--不是 1--是
		isEmoticon: data.isEmoticon,//是否允许表情（默认勾选） 字符 必录 0--不是 1--是
		isAdvert: data.isAdvert,//是否允许广告（默认勾选） 字符 必录 0--不是 1--是
		content: data.content,//正文 字符 必录
		channelId: data.channelId,//所属频道ID 字符 必录
		author: data.author,//作者 字符 非必录
		sureSave: data.sureSave//二次确认保存 字符 非必录 1--确认
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news',
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
			            resultCode: 0,
			            resultMsg:{
					        _id: '11111111111111111111111' //新闻的ID
					        title: '娱乐',//新闻标题
					        updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
					        creatorName: '超级管理员',//创建者名称
					        imgs: ["/images/2015-08-19/1439967941906.jpg","/images/2015-08-19/1439968385322.jpg","/images/2015-08-19/1439968761790.jpg"]//图片地址数组
			                roundImgs: ["/images/2015-08-19/1439967941906.jpg","/images/2015-08-19/1439968385322.jpg","/images/2015-08-19/1439968761790.jpg"]//轮播图地址数组
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
 * @alias 修改新闻信息
 */
router.route('/modify/:PNewsId').put(function (req, res, next) {
	var data = req.body,
        PNewsId = req.params.PNewsId,//新闻物理ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
        title: data.title,//标题 字符 必录项
        abs: data.abs,//摘要 字符 必录项
        relSource: data.relSource,//稿源 字符 非必录
        imgs: data.imgs,//缩略图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"] 必录项
        isRound: data.isRound,//设置轮显新闻（默认不勾选） 字符 必录 0--不是 1--是
        roundImgs: data.roundImgs,//轮显图 数组，形式为：["http://pic.4g.enorth.com.cn/007/000/364/00700036489_cd4a86a2.jpg"] 非必录
        isStick: data.isStick,//设置置顶新闻（默认不勾选） 字符 必录 0--不是 1--是
        stickOrder: data.stickOrder,//置顶序号 数值 非必录
        isComment: data.isComment,//是否允许评论（默认勾选） 字符 必录 0--不是 1--是
        isEmoticon: data.isEmoticon,//是否允许表情（默认勾选） 字符 必录 0--不是 1--是
        isAdvert: data.isAdvert,//是否允许广告（默认勾选） 字符 必录 0--不是 1--是
        content: data.content,//正文 字符 必录
        channelId: data.channelId,//所属频道ID 字符 必录
        author: data.author,//作者 字符 非必录
        newsId: data.newsId,//新闻逻辑ID 字符 隐藏 必录
        sureSave: data.sureSave//二次确认保存 字符 非必录 1--确认
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/' + PNewsId,
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
			            resultCode: 0,
			            resultMsg:{
					        PNewsId: '11111111111111111111111', //新闻物理ID
					        newsId: '',//新闻逻辑ID
					        title: '娱乐', //新闻标题
					        updated_at: '2015-07-02T09:20:40.000Z',//最后更新时间
					        creatorName: '超级管理员',//创建者名称
					        imgs: ["/images/2015-08-19/1439967941906.jpg","/images/2015-08-19/1439968385322.jpg","/images/2015-08-19/1439968761790.jpg"]//图片地址
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
 * @alias 签发新闻
 */
router.route('/issue').put(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		PNewsIds: data.PNewsIds//新闻物理ID 数组 形式为data.PNewsIds:['','','']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/issue',
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
					sysattObject = JSON.parse(chunks).resultMsg;
					delete cacheObject[sysattObject.domain];
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            resultCode: 0,
			            resultMsg:{
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
 * @alias 退签新闻
 */
router.route('/unissue').put(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		PNewsIds: data.PNewsIds//新闻物理ID 数组 形式为data.PNewsIds:['','','']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/unissue',
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
					sysattObject = JSON.parse(chunks).resultMsg;
					delete cacheObject[sysattObject.domain];
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            resultCode: 0,
			            resultMsg:{
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
 * @alias 推荐新闻
 */
router.route('/recommend').put(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		PNewsIds: data.PNewsIds//新闻物理ID 数组 形式为data.PNewsIds:['','','']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/recommend',
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
					sysattObject = JSON.parse(chunks).resultMsg;
					delete cacheObject[sysattObject.domain];
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            resultCode: 0,
			            resultMsg:{
			                PNewsId: '11111111111111111111111', //新闻物理ID
			                newsId: '',//新闻逻辑ID
					        title: '娱乐', //新闻标题
					        issueStatus: '1',//签发状态 0--未签发 1--已签发
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
 * @alias 移除出内容源
 */
router.route('/remove/newssource').put(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		PNewsIds: data.PNewsIds//新闻物理ID 数组 形式为data.PNewsIds:['','','']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/remove/newssource',
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
					sysattObject = JSON.parse(chunks).resultMsg;
					delete cacheObject[sysattObject.domain];
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            resultCode: 0,
			            resultMsg:{
			                PNewsId: '11111111111111111111111', //新闻物理ID
			                newsId: '',//新闻逻辑ID
					        title: '娱乐', //新闻标题
					        issueStatus: '1',//签发状态 0--未签发 1--已签发
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
 * @alias 移除新闻
 */
router.route('/remove').put(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		PNewsIds: data.PNewsIds//新闻物理ID 数组 形式为data.PNewsIds:['','','']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/remove',
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
			            resultCode: 0,
			            resultMsg:{
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
 * @alias 回收站恢复新闻
 */
router.route('/unremove/:PNewsId').delete(function (req, res, next) {
    var data = req.body,
        PNewsId = req.params.PNewsId,//新闻ID
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({});

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/news/unremove/' + PNewsId,
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
			            resultCode: 0,
			            resultMsg:{
					        PNewsId: '11111111111111111111111', //新闻物理ID
			                newsId: '',//新闻逻辑ID
					        title: '娱乐', //新闻标题
					        issueStatus: '1',//签发状态 0--未签发 1--已签发
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
 * @alias 置顶新闻排序
 */
router.route('/order/stick').delete(function (req, res, next) {
    var data = req.body,
         sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({
        PNewsIds:['','','']//置顶新闻PNewsId数组，按照先后顺序排序，从1开始
    });

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/news/order/stick',
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
			            resultCode: 0,
			            resultMsg:{
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
 * @alias 获取新闻列表，按置顶序号和时间从大到小排序
 */
router.route('/:title/:abs/:issueStatus/:isRound/:isStick/:isComment/:isEmoticon/:isAdvert/:isRecommend/:isNewsSource/:prop/:startDateLine/:endDateLine/:newsId/:channelId/:lastPNewsId/:pageSize/batch').get(function (req, res, next) {
	var title = req.params.title == 'a' ? '' : encodeURI(req.params.title),//新闻标题 支持模糊查询
		abs = req.params.abs == 'a' ? '' : encodeURI(req.params.abs),//摘要 支持模糊查询
		issueStatus = req.params.issueStatus == 'a' ? '' : req.params.issueStatus,//签发状态 0--未签发 1--已签发
        isRound = req.params.isRound == 'a' ? '' : req.params.isRound,//是否轮播图 0--不是 1--是
        isStick = req.params.isStick == 'a' ? '' : req.params.isStick,//是否置顶 0--不是 1--是
        isComment = req.params.isComment == 'a' ? '' : req.params.isComment,//是否评论 0--不是 1--是
        isEmoticon = req.params.isEmoticon == 'a' ? '' : req.params.isEmoticon,//是否表情 0--不是 1--是
        isAdvert = req.params.isAdvert == 'a' ? '' : req.params.isAdvert,//是否广告 0--不是 1--是
		isRecommend = req.params.isRecommend == 'a' ? '' : req.params.isRecommend,//是否推荐 0--不是 1--是
		isNewsSource = req.params.isNewsSource == 'a' ? '' : req.params.isNewsSource,//是否新闻源 0--不是新闻源 1或空--是新闻源
		prop = req.params.prop == 'a' ? '' : req.params.prop,//新闻类型 news--普通新闻  topic--主题新闻  link--链接新闻 image--图库新闻 vote--投票新闻
		startDateLine = req.params.startDateLine == 'a' ? '' : encodeURI(req.params.startDateLine),//开始签发日期
		endDateLine = req.params.endDateLine == 'a' ? '' : encodeURI(req.params.endDateLine),//结束签发日期
		newsId = req.params.newsId == 'a' ? '' : req.params.newsId,//新闻逻辑ID
		channelId = req.params.channelId == 'a' ? '' : req.params.channelId,//频道ID
		lastPNewsId = req.params.lastPNewsId,//上一组新闻中最后一个新闻的物理ID，置入0表示从头开始
		pageSize = req.params.pageSize,//一次获取的新闻数量
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/' + title + ',' + abs + ',' + issueStatus + ',' + isRound + ',' + isStick + ',' + isComment + ',' +
        isEmoticon + ',' + isAdvert + ',' + isRecommend + ',' + isNewsSource + ',' + prop + ',' + startDateLine + ',' + endDateLine + ','  + newsId + ',' + channelId + ',' + lastPNewsId + ',' + pageSize + '/batch',
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
			            resultCode: 0,
			            resultMsg:{
			                uid: uid, //用户ID
			                count: 10,//所有有效的工作组集合数量
							newsList://返回数据集合
							[
								{
									"_id":"55caa7ffb9046ad902000010",//新闻id
									"channelName": '娱乐',//频道名称
									"abs":"10日的主要内容有：国际泳联世锦赛上，中国队获得女子四乘一百米混合泳接力冠军……",//新闻摘要
									"dateline":"2015-08-12T09:57:19.000Z",//发布时间
									"imgs":["http://pic.4g.enorth.com.cn/007/000/359/00700035970_dfaef554.jpg"],//列表图
									"listtype":"img",//列表类型
									"prop":"video",//新闻类型
									"title":"8月10日《都市报道》视频回放",//新闻标题
									"channelId":"55c997b76d14386506000002",//频道id
									"issueStatus":"1",//签发状态 0--未签发 1--已签发
									"recommend": "0",//是否推荐 0--不推荐 1--推荐
									"creatorId":"5596159630cabc1896cc0809",//创建者ID
									"creatorName":"超级管理员sup",//创建者姓名
									"updated_at":"2015-08-12T09:57:19.000Z"//更新日期
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
 * @alias 获取新闻信息
 */
router.route('/:PNewsId').get(function (req, res, next) {
	var PNewsId = req.params.PNewsId,//新闻id
		sign = req.headers['sign'];//登录凭据;//工作组ID

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/news/' + PNewsId,
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
						resultCode: 0,
			            resultMsg:
			            {
					        "_id":"55caa7ffb9046ad902000010",//新闻id
							"abs":"10日的主要内容有：国际泳联世锦赛上，中国队获得女子四乘一百米混合泳接力冠军……",//新闻摘要
							"dateline":"2015-08-12T09:57:19.000Z",//发布时间
							"imgs":["http://pic.4g.enorth.com.cn/007/000/359/00700035970_dfaef554.jpg"],//列表图
							"listtype":"img",//列表类型
							"prop":"video",//新闻类型
							"title":"8月10日《都市报道》视频回放",//新闻标题
							"channelId":"55c997b76d14386506000002",//频道id
							"issueStatus":"1",//签发状态 0--未签发 1--已签发
							"recommend": "0",//是否推荐 0--不推荐 1--推荐
							"creatorId":"5596159630cabc1896cc0809",//创建者ID
							"creatorName":"超级管理员sup",//创建者姓名
							"updated_at":"2015-08-12T09:57:19.000Z"//更新日期
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
