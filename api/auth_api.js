var express = require('express'),
	bodyParser = require('body-parser'),
	https = require('https'),
	router = express.Router(),
	fs = require('fs'),
	resource = require('./../resource'),
	api_extends = require('./api_extends'),
	debug = false;
var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT;
var cacheObject = {};

// ================  人员信息  ===============================

/**
 * @alias 添加人员
 */
router.route('/saveUser').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		loginName: data.loginName,//登录用户名 必录项
		loginPassword: data.loginPassword,//登录密码 必录项
		nickName: data.nickName,//人员昵称 必录项
		//inviteCode: data.inviteCode,//邀请码(由接口生成邀请码，10位，字母数字组合，前台只显示，只读项)
		//isUse: data.isUse,//是否已使用（可以通过邮箱验证，或者邀请码验证，前台只显示，只读项。编码为：isUse 0--未使用 1--已使用 ）
		mobileNO: data.mobileNO,//邮箱 必录项
		comment: data.comment,//人员描述，如 “客服” 必录项
		kind: data.kind,//人员类型 必录项 1--超级管理员 2--管理员 3--用户 编码为：userKind，调用code_api.js中的post接口 /:definition/batch获取编码值
		workgroupIds: data.workgroupIds//形式如：['5590ff56fda754ad04000003','5590fff6fda754ad04000004','55938adc48b1467509000028']//人员工作组id数组 非必录项
	});

	//api_extends.sendInterface()

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user',
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
					        _id: '11111111111111111111111' //保存人员的ID
					        updated_at:: '2015-07-02T09:20:40.000Z'//修改时间
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
 * @alias 添加被邀请人员
 */
router.route('/invite').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		//loginName: data.loginName,//登录用户名 必录项
		comment: data.comment,//人员描述，非必录项
		kind: data.kind,//人员类型 必录项，1--超级管理员 2--管理员 3--用户 编码为：userKind，调用code_api.js中的post接口 /:definition/batch获取编码值
		mail: data.mail,//邮箱 非必录项
		workgroupIds: data.workgroupIds//形式如：['5590ff56fda754ad04000003','5590fff6fda754ad04000004','55938adc48b1467509000028']//人员工作组id数组 非必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/activation',
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
					        _id:"559b6b8ffb3be91906000001",//新增用户ID
					        invitCode:"ZbDXGYiDYF",//邀请码 10位 0-9a-zA-Z组合
					        updated_at:"2015-07-07T14:02:55.000Z",//更新时间
					        creatorName:"超级管理员sup"//创建者姓名
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
 * @alias 修改人员
 */
router.route('/modifyUser/:uid').put(function (req, res, next) {
	var data = req.body,
		uid = req.params.uid,//用户ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		loginName: data.loginName,//登录用户名 必录项
		loginPassword: data.loginPassword,//登录密码 非必录项
		nickName: data.nickName,//人员昵称 非必录项
		comment: data.comment,//人员描述 非必录项
		mobileNO: data.mobileNO,//手机号码 非必录项
		kind: data.kind,//人员类型 非必录项
		validSign: data.validSign,//有效标志 非必录项 1--有效 0--无效 编码：validSign
		workgroupIds: data.workgroupIds//形式如：['5590ff56fda754ad04000003','5590fff6fda754ad04000004','55938adc48b1467509000028']//人员工作组id数组 非必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/' + uid,
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
						resultCode:0,//成功
						resultMsg:
						{
							_id: '1111111111111111111111'，//修改人员的ID
							nickName: '黄花' //人员昵称
							updated_at: '2015-07-07T14:29:35.000Z'//更新日期
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
 * @alias 移除人员
 */
router.route('/removeUser/:uid').put(function (req, res, next) {
	var data = req.body,
		uid = req.params.uid,//用户ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/' + uid,
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
						resultCode:0,//成功
						resultMsg:
						{
							_id: '1111111111111111111111'//移除人员的ID
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
 * @alias 获取全部人员列表（普通用户）
 */
router.route('/getUser/:nickName/:comment/:page/:pagesize/batch').get(function (req, res, next) {
	if (debug) {
		var datUsers = JSON.parse(fs.readFileSync('datUsers.json', 'utf8'));
		res.status(200).send(
			{
				resultCode: 0,
				resultMsg: {
					count: 1,
					userList: datUsers
				}
			}
		);
		return;
	}
	var nickName = req.params.nickName == 'a' ? '' : encodeURI(req.params.nickName),//用户名称 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		comment = req.params.comment == 'a' ? '' : encodeURI(req.params.comment),//说明 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		page = req.params.page,//上一组人员中最后一个人员的ID，置入0表示从头开始
		pagesize = req.params.pagesize,//一次获取的人员数量
		sign = req.headers['sign'],//登录凭据
		userSign = 1;//用户标识 1--普通用户
	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/' + nickName + ',' + comment + ',' + userSign + ',' + page + ',' + pagesize + '/batch',
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
			                count: 10,//返回条数
							userList://返回数据集合
							[
								{
									_id: ‘121212121212121212’, //人员ID
									loginName: 'gssc', //人员登录用户名
									loginPassword: 'DETDG2258XFDR', //人员登录密码（加密后的）
									nickName:'黄花', //昵称
									kind: '2', 1--超级管理员 2--管理员 3--用户
									creatorName: '创建者姓名',//创建者姓名
									mail: 'gssc@126.com', //邮箱
					 comment: '客服人员', //人员描述
					 isUse: '1', //是否已经使用，即是否使用这个账户登录过，为以后邀请码做准备 1--已经使用 0--尚未使用
					 validSign: ‘1’ //有效标志 1--有效 0--无效
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
 * @alias 登录前检测sign是否有效
 */
router.route('/sign/check').get(function (req, res, next) {
	var sign = req.headers['sign'];//登录凭据;

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/sign/check',
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
			            resultCode: 0,//sign有效
			            resultMsg:
			            {
						    "uid": "5596159630cabc1896cc0809",//用户ID
						    "kind": "1"//用户类型
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
 * @alias 获取人员信息
 */
router.route('/gainUser/:uid').get(function (req, res, next) {
	var uid = req.params.uid//人员ID
	sign = req.headers['sign'];//登录凭据;

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/' + uid,
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
						    _id: ‘121212121212121212’, //人员ID
							loginName: 'gssc', //人员登录用户名
							loginPassword: 'DETDG2258XFDR', //人员登录密码（加密后的）
							nickName:'黄花', //昵称
							kind: '2', 1--超级管理员 2--管理员 3--用户
							creatorName: '创建者姓名',//创建者姓名
							mobileNO: '11111111111', //电话号码
					        comment: '客服人员', //人员描述
					 isUse: '1', //是否已经使用，即是否使用这个账户登录过，为以后邀请码做准备 1--已经使用 0--尚未使用
					 validSign: ‘1’ //有效标志 1--有效 0--无效
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

// ================  工作组信息  ===============================

/**
 * @alias 添加工作组
 */
router.route('/saveWorkgroup').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		workgroupName: data.workgroupName,//工作组名称 必录项
		icon: data.icon,//工作组标志 非必录项
		comment: data.comment,//工作组说明 必录项
		kind: data.kind,//工作组数据可见范围 必录项 人员类型 必录项，1--超级管理员 2--管理员 3--用户 编码定义为：userKind，调用code_api.js中的post接口 /:definition/batch获取编码值
		path: data.path//工作组的path 必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup',
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
					        _id: '11111111111111111111111' //保存工作组的ID
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
 * @alias 修改工作组
 */
router.route('/modifyWorkgroup/:workgroupId').put(function (req, res, next) {
	var data = req.body,
		workgroupId = req.params.workgroupId,//工作组ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		workgroupName: data.workgroupName,//工作组名称 必录项
		icon: data.icon,//工作组标志 非必录项
		comment: data.comment,//工作组说明 必录项
		validSign: data.validSign,//有效标志 非必录项 1--有效 0--无效 编码：validSign
		kind: data.kind,//工作组数据可见范围 必录项 人员类型 必录项，1--超级管理员 2--管理员 3--用户 编码定义为：userKind，调用code_api.js中的post接口 /:definition/batch获取编码值
		path: data.path,//path路径 必录项
		order: data.order//序号 非必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/' + workgroupId,
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
					        workgroupId: '11111111111111111111111', //修改工作组的ID
					        workgroupName: '工作组名称', //工作组名称
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
 * @alias 移除工作组
 */
router.route('/removeWorkgroup/:workgroupId').put(function (req, res, next) {
	var data = req.body,
		workgroupId = req.params.workgroupId,//工作组ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/' + workgroupId,
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
			            resultCode: 0,
			            resultMsg:{
			                workgroupId: '11111111111111111111111' //移除工作组的ID
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
 * @alias 根据用户ID获取下面的所有工作组和权限列表，按照工作组名称和权限名称排序
 */
router.route('/workgroup/:uid/:page/:pagesize/batch').get(function (req, res, next) {
	var uid = req.params.uid,//用户ID
	//selectsign = req.params.selectsign,//选择标志 1--工作组已经包含的人员 0--工作组不包含的人员
		page = req.params.page,//上一组人员中最后一个人员的ID，置入0表示从头开始
		pagesize = req.params.pagesize,//一次获取的人员数量
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/' + uid + ',' + page + ',' + pagesize + '/batch',
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
							workgroupList://返回数据集合
							[
								{
									 _id: '111111111111111111111111', //工作组ID
						            workgroupName: '工作组名称', //工作组名称
									icon: '工作组标志', //工作组标志
									path: 'super', //工作组path
									selected: '1',//选择标志 1--人员已经选择的工作组 0--人员尚未选择的工作组
									creatorId:"000000000000000000000000",//创建者ID
									creatorName:"超级管理员"////创建者姓名
									updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
									comment: '工作组说明', //工作组说明 必录项
									validSign: '1',//有效标志 1--有效 0--无效
									kind: '2'//工作组类型
									count: 10,//该工作组下的所有有效的权限集合数量
									operationList:
									[
										{
											_id: '111111111111111111111111', //工作组ID
						                    operationName: '权限名称',//权限名称
											icon: '权限标志',//权限标志
											path: 'setting',//权限path
											creatorId:"000000000000000000000000",//创建者ID
											creatorName:"超级管理员"////创建者姓名
											updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
											comment: ‘权限说明’,//权限说明
											selected: '1',//工作组选择标志 1--工作组已经包含的权限 0--工作组没有包含的权限
								            validSign: ‘1’, //有效标志 1--有效 0--无效
								            kind: '2'//权限类型
										},
										{},
										...
									]
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
 * @alias 根据权限获取对应的所有工作组列表
 */
router.route('/workgroup/:operationId/:operationKind/batch').get(function (req, res, next) {
	var operationId = req.params.operationId,//权限ID
		operationKind = req.params.operationKind,//权限类型
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/' + operationId + ',' + operationKind + '/batch',
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
							workgroupList://返回数据集合
							[
								{
					                "_id":"55ac8a09580265a0fc000004",//工作组ID
					                "workgroupName":"设备管理",//工作组名称
					                "comment":"设备管理工作组，凡与设备有关的操作项都可放置此工作组之下。\n本工作组只对管理员以上级别的用户可见。",//工作组描述
					                "kind":"2",//工作组类型
					                selected:'0'//该权限是否属于这个工作组 0--不属于 1--属于
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
 * @alias 根据用户ID获取下面的所有工作组，按照工作组名称排序
 */
router.route('/workgroup/only/:uid/:kind/:page/:pagesize/batch').get(function (req, res, next) {
	var uid = req.params.uid,//用户ID
		kind = req.params.kind,//用户类型
	//selectsign = req.params.selectsign,//选择标志 1--工作组已经包含的人员 0--工作组不包含的人员
		page = req.params.page,//上一组人员中最后一个人员的ID，置入0表示从头开始
		pagesize = req.params.pagesize,//一次获取的人员数量
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/only/' + uid + ',' + kind + ',' + page + ',' + pagesize + '/batch',
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
							workgroupList://返回数据集合
							[
								{
									 _id: '111111111111111111111111', //工作组ID
						            workgroupName: '工作组名称', //工作组名称
									icon: '工作组标志', //工作组标志
									path: 'super', //工作组path
									selected: '1',//选择标志 1--人员已经选择的工作组 0--人员尚未选择的工作组
									creatorId:"000000000000000000000000",//创建者ID
									creatorName:"超级管理员"////创建者姓名
									updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
									comment: '工作组说明', //工作组说明 必录项
									validSign: '1',//有效标志 1--有效 0--无效
									kind: '2'//工作组类型
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
 * @alias 获取全部工作组
 */
router.route('/getWorkgroup/:workgroupName/:comment/:page/:pagesize/batch').get(function (req, res, next) {
	var workgroupName = req.params.workgroupName == 'a' ? '' : encodeURI(req.params.workgroupName),//工作组名称名称 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		comment = req.params.comment == 'a' ? '' : encodeURI(req.params.comment),//说明 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		page = req.params.page,//上一组工作组的最后一个工作组ID，置入0表示从头开始
		pagesize = req.params.pagesize,//一次获取的工作组数量
		sign = req.headers['sign'];//登录凭据

	console.log('sign : ' + sign);
	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/' + workgroupName + ',' + comment + ',' + page + ',' + pagesize + '/batch',
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
			                count: 10, //所有工作组的数量
			                workgroupList: //本次获取到的工作组集合信息
			                [
			                    {
						            _id: '111111111111111111111111', //工作组ID
						            workgroupName: '工作组名称', //工作组名称
									icon: '工作组标志', //工作组标志
									path: 'super', //工作组path
									creatorId:"000000000000000000000000",//创建者ID
									creatorName:"超级管理员"////创建者姓名
									updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
									comment: '工作组说明', //工作组说明 必录项
									validSign: '1', //有效标志 1--有效 0--无效
									kind: '2'//工作组类型
			                    },
			                    ...
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
 * @alias 获取工作组信息
 */
router.route('/gainWorkgroup/:workgroupId').get(function (req, res, next) {
	var workgroupId = req.params.workgroupId,
		sign = req.headers['sign'];//登录凭据;//工作组ID

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/' + workgroupId,
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
					        _id: '111111111111111111111111', //工作组ID
					        workgroupName: '工作组名称', //工作组名称
					        icon: '工作组标志', //工作组标志
					        path: 'super', //工作组path
					        creatorId:"000000000000000000000000",//创建者ID
							creatorName:"超级管理员"////创建者姓名
							updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
							comment: '工作组说明', //工作组说明 必录项
							validSign: '1',//有效标志 1--有效 0--无效
							kind: '2'//工作组类型
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

// ================  权限信息  ===============================

/**
 * @alias 添加权限
 */
router.route('/saveOperation').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		operationName: data.operationName,//权限名称 必录项
		icon: data.icon,//权限标志 非必录项
		path: data.path,//权限path 必录项
		comment: data.comment,//工作组说明 必录项
		kind: data.kind//权限数据可见范围 必录项 人员类型 必录项，1--超级管理员 2--管理员 3--用户 编码定义为：userKind，调用code_api.js中的post接口 /:definition/batch获取编码值
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation',
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
					        _id: '11111111111111111111111' //保存权限的ID
					        updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
					        creatorName: '超级管理员',//创建者名称
					        order: 35//权限序号
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
 * @alias 修改权限
 */
router.route('/modifyOperation/:operationId').put(function (req, res, next) {
	var data = req.body,
		operationId = req.params.operationId,//权限ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		operationName: data.operationName,//权限名称 必录项
		icon: data.icon,//权限标志 非必录项
		path: data.path,//权限path 非必录项
		comment: data.comment,//工作组说明 必录项
		kind: data.kind,//权限数据可见范围 必录项 人员类型 必录项，1--超级管理员 2--管理员 3--用户 编码定义为：userKind，调用code_api.js中的post接口 /:definition/batch获取编码值
		validSign: data.validSign,//有效标志 非必录项 1--有效 0--无效 编码：validSign
		order: data.order//权限序号 非必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation/' + operationId,
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
					        operationId: '11111111111111111111111', //修改权限的ID
					        operationName: '权限名称' //权限名称
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
 * @alias 移除权限
 */
router.route('/removeOperation/:operationId').put(function (req, res, next) {
	var data = req.body,
		operationId = req.params.operationId,//权限ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation/' + operationId,
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
			            resultCode: 0,
			            resultMsg:{
			                operationId: '11111111111111111111111' //修改权限的ID
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
 * @alias 根据工作组获取权限列表（已经添加/未添加）
 */
router.route('/getOperation/:operationName/:comment/:workgroupId/:page/:pagesize/batch').get(function (req, res, next) {
	var operationName = req.params.operationName == 'a' ? '' : encodeURI(req.params.operationName),//权限名称 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		comment = req.params.comment == 'a' ? '' : encodeURI(req.params.comment),//说明 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		workgroupId = req.params.workgroupId,//工作组ID
		page = req.params.page,//上一组权限中最后一个权限ID，置入0表示从头开始
		pagesize = req.params.pagesize,//一次获取权限的数量
		sign = req.headers['sign'];//登录凭据;

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation/' + operationName + ',' + comment + ',' + workgroupId + ',' + page + ',' + pagesize + '/batch',
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
			                workgroupId: workgroupId, //工作组ID
			                count: 10, //所有有效的权限集合数量
			                operationList: //权限集合信息
			                [
			                    {
						            _id: '111111111111111111111111', //权限ID
						            operationName: '权限名称',//权限名称
									icon: '权限标志',//权限标志
									path: 'setting',//权限path
									creatorId:"000000000000000000000000",//创建者ID
									creatorName:"超级管理员"////创建者姓名
									updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
									comment: ‘权限说明’,//权限说明
									selected: '1',//工作组选择标志 1--工作组已经包含的权限 0--工作组没有包含的权限
						            validSign: '1', //有效标志 1--有效 0--无效
						            kind: '2'//权限类型
			                    },
			                    ...
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
 * @alias 获取全部权限
 */
router.route('/getOperation/:operationName/:comment/:page/:pagesize/batch').get(function (req, res, next) {
	var operationName = req.params.operationName == 'a' ? '' : encodeURI(req.params.operationName),//权限名称 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		comment = req.params.comment == 'a' ? '' : encodeURI(req.params.comment),//说明 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		page = req.params.page,//上一组权限中最后一个权限ID，置入0表示从头开始
		pagesize = req.params.pagesize,//一次获取权限的数量
		sign = req.headers['sign'];//登录凭据;

	console.log(operationName);
	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation/' + operationName + ',' + comment + ',' + page + ',' + pagesize + '/batch',
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
			                count: 10, //本次获取权限集合的数量
			                operationList: //权限集合信息
			                [
			                    {
						            _id: '111111111111111111111111', //工作组ID
						            operationName: '权限名称',//权限名称
									icon: '权限标志',//权限标志
									path: 'setting',//权限path
									creatorId:"000000000000000000000000",//创建者ID
									creatorName:"超级管理员"////创建者姓名
									updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
									comment: ‘权限说明’,//权限说明
						            validSign: '1', //有效标志 1--有效 0--无效
						            kind: '2'//权限类型
						        },
						        ...
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
 * @alias 获取权限信息
 */
router.route('/gainOperation/:operationId').get(function (req, res, next) {
	var operationId = req.params.operationId,//权限ID
		sign = req.headers['sign'];//登录凭据;


	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation/' + operationId,
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
					        _id: '111111111111111111111111', //工作组ID
					        operationName: '权限名称',//权限名称
							icon: '权限标志',//权限标志
							path: 'setting',//权限path
							creatorId:"000000000000000000000000",//创建者ID
					        creatorName:"超级管理员"////创建者姓名
					        updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
							comment: ‘权限说明’,//权限说明
					        validSign: '1' //有效标志 1--有效 0--无效
					        kind: '2'//权限类型
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

// ================  域信息  ===============================

/**
 * @alias 添加域
 */
router.route('/domain/save').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		domainName: data.domainName,//域名称 字符 必录项
		comment: data.comment,//域说明 字符 必录项
		parentDomainId: data.parentDomainId//父级域Id 必录
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/domain',
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
					        _id: '11111111111111111111111' //保存域的ID
					        domainName: '',//域名称
							comment: '',//域说明
							parentDomainId: ''//父级域Id
					        updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
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
 * @alias 修改域
 */
router.route('/domain/modify/:domainId').put(function (req, res, next) {
	var data = req.body,
		domainId = req.params.domainId,//域ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		domainName: data.domainName,//域名称 字符 非必录项
		comment: data.comment,//域说明 字符 非必录项
		workgroupIds: data.workgroupIds,//域拥有的工作组 数组 必录 形式为：['','','']
		parentDomainId: data.parentDomainId//父级域Id 非必录
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/domain/' + domainId,
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
					        domainId: '11111111111111111111111' //域的ID
					        domainName: '',//域名称
							comment: '',//域说明
							workgroupIds: ['','',''],//域拥有的工作组
							parentDomainId: ''//父级域Id
					        updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
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
 * @alias 移除域
 */
router.route('domain/remove/:domainId').put(function (req, res, next) {
	var data = req.body,
		domainId = req.params.domainId,//域ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/domain/' + domainId,
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
			            resultCode: 0,
			            resultMsg:{
			                domainId: '11111111111111111111111' //移除域的ID
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
 * @alias 根据父域id所有子域的集合
 */
router.route('/domain/:parentDomainId/batch').get(function (req, res, next) {
	var parentDomainId = req.params.parentDomainId,//父域ID，如果顶级域传空并获得两级域，其余都只会获得一级子域 顶级域传0
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/domain/' + parentDomainId + '/batch',
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
			                count: 10,//子域数量
							domainList://返回子域集合
							[
								{
									 _id: '111111111111111111111111', //域的ID
					                domainName: '',//域名称
									comment: '',//域说明
									workgroupIds: ['','',''],//域拥有的工作组
									parentDomainId: ''//父级域Id
					                updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
					                creatorName: '超级管理员'//创建者名称
			                    },{
								...
			                    }
			                ],
			                userList:[//域下用户信息
					            {
					                uid: '',//用户ID
					                nickName: '',//用户昵称
					                kind: '',//用户类型
					                comment: ''//用户说明
					            },
					            {}
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
 * @alias 获取域信息
 */
router.route('/domain/:domainId').get(function (req, res, next) {
	var domainId = req.params.domainId,//域Id
		sign = req.headers['sign'];//登录凭据;//工作组ID

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/domain/' + domainId,
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
					         _id: '111111111111111111111111', //域的ID
					         domainName: '',//域名称
							 comment: '',//域说明
							 workgroupIds: ['','',''],//域拥有的工作组
							 parentDomainId: ''//父级域Id
					         updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
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
	interfaceReq.end();
});

// ================  工作组和人员关系信息  ===============================

/**
 * @alias 添加工作组和人员关系
 */
router.route('/bind/workgroup/user').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		uid: data.uid,//用户ID 必录项
		workgroupIds: data.workgroupIds//要添加的用户ID数组，
		/** 形式为 data.workgroupIds=[
		 {
			workgroupId: '559267aa883d527304000001',
				operationIds: ['55926842883d527304000007','55926826883d527304000006','55926819883d527304000005']
		},
		 {
			workgroupId: '559267d1883d527304000002',
				operationIds: ['55926851883d527304000008']
		},
		 {
			workgroupId: '559267e5883d527304000003',
				operationIds: ['5592685c883d527304000009']
		},
		 {
			workgroupId: '559267f5883d527304000004',
				operationIds: ['55926868883d52730400000a']
		}
		 ] 必录项
		 */
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/user',
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
			            resultCode: 0,//绑定成功
			            resultMsg:{}
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

// ================  域和人员关系信息  ===============================

/**
 * @alias 添加域和人员关系
 */
router.route('/bind/domain/user').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		uid: data.uid,//用户ID 必录项
		domainId: data.domainId//域ID 必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/domain/user',
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
			            resultCode: 0,//绑定成功
			            resultMsg:{}
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
 * @alias 移除域和人员关系
 */
router.route('/unbind/domain/user').delete(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		uid: data.uid,//用户ID 必录项
		domainId: data.domainId//域ID 必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/domain/user',
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
			            resultCode: 0,//解除绑定成功
			            resultMsg:{}
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


// ================  工作组和权限关系信息  ===============================

/**
 * @alias 添加工作组和权限关系
 */
router.route('/bind/workgroup/operation').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		workgroupId: data.workgroupId,//工作组ID 必录项
		operationIds: data.operationIds//要添加的权限ID数组，形式为 data.operationIds=['111111111111111111111111','222222222222222222222222',...] 必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/operation',
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
			            resultCode: 0,//绑定成功
			            resultMsg:{}
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
 * @alias 将一个权限赋权给多个工作组
 */
router.route('/bind/operation/workgroup').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		operationId: data.operationId,//权限ID 必录项
		workgroupIds: data.workgroupIds//要归属的工作组ID数组，形式为 data.workgroupIds=['111111111111111111111111','222222222222222222222222',...] 必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/operation/',
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
			            resultCode: 0,//绑定成功
			            resultMsg:{}
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

// ================  登录及修改找回密码  ===============================

/**
 * @alias 登录
 */
router.route('/login').post(function (req, res, next) {
	var data = req.body;
	console.log("*********11111***********");
	var post_data = JSON.stringify({
		loginName: data.loginName,//登录用户名 必录项
		loginPassword: data.loginPassword//登录密码 必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/login',
		method: 'POST',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			"Content-Type": 'application/json',
			"Content-Length": Buffer.byteLength(post_data)
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
			            resultCode: 0,//登录成功
			            resultMsg:{
						    uid: '111111111111111111111111', //
						    nickName: '黄花', //用户昵称
							sessionId: '', //sessionId
							sign: '', //用户登录安全标识,
							kind: '1', 1--超级管理员 2--管理员 3--用户
							domain: 'tjmntv',//登录域
							isFormal: ''//域超级管理员信息是否经过正式修改 null--不是域超级管理员
																	  0--未修改 平台管理员可以修改域超级管理员信息
						                                              1--已经修改 平台管理员不能修改域超级管理员信息
							attTitle: '冲冲冲',//系统标题
							attBackground_color: '#000000'//系统背景
							workgroupList: //人员拥有的工作组列表
							[
								{
									id : "8000",
			                        name : "项目资料",
			                        icon : "file text outline",
			                        path : "projects",
									subMenus : //工作组拥有的权限列表
									[
                                        {
			                                id : "8000000",
			                                name : "系统介绍",
						                    icon : "",
			                                path : "intro",//路径
			                                kind: '1'//权限类型
			                            },
			                            {
			                                id : "8000001",
			                                name : "系统文档",
			                                icon : "",
			                                path : "docs"//路径
                                        }
                                    ]
								},
								{
								},
								...
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
	interfaceReq.write(post_data);
	interfaceReq.end();
});

/**
 * @alias 修改密码
 */
router.route('/modify/password/:uid').put(function (req, res, next) {
	var data = req.body,
		uid = req.params.uid,//用户ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		old_password: data.old_password,//旧密码 必录项
		new_password: data.new_password,//新密码 必录项
		re_new_password: data.re_new_password //确认新密码 必录项
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/modify/password/' + uid,
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
			            resultCode: 0,//密码修改成功
			            resultMsg:{
			                loginName: 'gssc' //用户登录用户名
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
 * @alias 找回密码
 */
router.route('/retrieve/password/:loginName').put(function (req, res, next) {
	var data = req.body,
		loginName = req.params.loginName;//用户登录名

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/retrieve/password/' + loginName,
		method: 'PUT',
		key: fs.readFileSync('./certs/develop/cms_key.pem'),
		cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
		requestCert: true,
		rejectUnauthorized: false,
		headers: {
			"Content-Type": 'application/json',
			"Content-Length": Buffer.byteLength(post_data)
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
			            resultCode: 0,//分配一个新的六位密码成功
			            resultMsg:{
			                mail: 'gssc@126.com' //接收新密码的邮箱，即用户注册的邮箱
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
 * @alias 找回密码
 */
router.route('/retrieve/password/:loginName').put(function (req, res, next) {
	var data = req.body,
		loginName = req.params.loginName,//用户登录名
		sign = req.headers['sign'];//登录凭据;

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/user/retrieve/password/' + loginName,
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
			            resultCode: 0,//分配一个新的六位密码成功
			            resultMsg:{
			                mail: 'gssc@126.com' //接收新密码的邮箱，即用户注册的邮箱
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

var generateBaseFolder = 'public/modules';

// ================  生成path目录  ===============================

router.route('/generate/workgroup').post(function (req, res, next) {
	var sign = req.headers['sign'];//登录凭据;
	console.log(sign);
	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/batch',
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
					//返回数据结构：
					/**{
			            resultCode: 0,
			            resultMsg:
			                {
			                    workgroupList:[
                                    {
                                        "id" : "1000",
                                        "name" : "权限管理",
                                        "icon" : "users",
                                        "path" : "super",
                                        "subMenus" : [
                                            {
                                                "id" : "1000001",
                                                "name" : "工作组",
					                            "icon" : "",
                                                "path" : "workgroup"
                                            },
                                            {
                                                "id" : "1000002",
                                                "name" : "当前用户",
                                                "icon" : "",
                                                "path" : "users"
                                            },
								            {
								                "id" : "1000003",
								                "name" : "权限定义",
								                "icon" : "",
								                "path" : "functions"
								            }
                                        ]
                                    },
                                    ...
                                ]
					        }
					    }
					 }*/
					result = JSON.parse(chunks);
					if (result.resultCode != 0) {
						res.status(200).send(result);
					} else {
						workgroupList = result.resultMsg.workgroupList;
						/**errPath = [];
						 workgroupList.forEach(function (workgroupData) {
							workgroupPath = generateBaseFolder + '/' + workgroupData.path;
							if (!fs.existsSync(workgroupPath)) {
								fs.mkdirSync(workgroupPath);
								if (!fs.existsSync(workgroupPath)) {
									errPath.push(workgroupData.path);
								} else {
									console.log(workgroupPath + 'PATH创建成功！');
								}
							}

							subMenus = workgroupData.subMenus;
							subMenus.forEach(function (menu) {
								menuPath = workgroupPath + '/' + menu.path;
								if (!fs.existsSync(menuPath)) {
									fs.mkdirSync(menuPath);
									ctrlFile = menuPath + '/ctrl.js';
									indexFile = menuPath + '/index.html';
									if (!fs.existsSync(ctrlFile)) {

										var ctrlContent = "'use strict';\n\n";
										ctrlContent += "define(['rapid', 'jquery', 'angular', 'moment', 'datepicker'],\n";
										ctrlContent += "function (rapid, $, angular, moment, datepicker) {\n";
										ctrlContent += "var modName = 'ctrl-" + workgroupData.path + "-" + menu.path + "';\n";
										ctrlContent += "rapid.register.controller(modName, function ($scope, $state, $rootScope, $http, dialogs, forms, principal) {\n";
										ctrlContent += "});\n";
										ctrlContent += "});";
										fs.writeFileSync(ctrlFile, ctrlContent);
									}
									if (!fs.existsSync(indexFile)) {
										fs.writeFileSync(indexFile, '');
									}
									if (!fs.existsSync(menuPath)) {
										errPath.push(menu.path);
									} else {
										console.log(menuPath + 'PATH创建成功！');
									}
								}
							});
						});
						 */
						api_extends.generate(workgroupList, generateBaseFolder, function (errPath) {
							if (errPath.length > 0) {
								res.status(200).send({resultCode: 0, resultMsg: '存在没有生成的path,包括:' + errPath + '！'});
							} else {
								res.status(200).send({resultCode: 0, resultMsg: '生成PATH目录成功！'});
							}
						});
					}
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


// ================  日志管理相关  ===============================

/**
 * @获取可见的日志列表
 * @日志可见原则为：超管可见所有日志；
 *                普管可见自己及下面用户的日志；
 *                一般用户可见自己的日志
 */
router.route('/syslog/:nickName/:loginName/:startDate/:endDate/:log_kind/:page/:pagesize/batch').get(function (req, res, next) {
	var nickName = req.params.nickName == 'a' ? '' : encodeURI(req.params.nickName),//用户名昵称 支持模糊查询，可以使用通配符* 没有这个条件参数可传值为：a
		loginName = req.params.loginName == 'a' ? '' : encodeURI(req.params.loginName),//登录用户名 精确查询 没有这个条件参数可传值为：a
		startDate = req.params.startDate == 'a' ? '' : req.params.startDate.replace(' ', '&nbsp;'),//查询起始日期  格式为：yyyy-mm-dd hh:mi:ss 没有这个条件参数可传值为：a
		endDate = req.params.endDate == 'a' ? '' : req.params.endDate.replace(' ', '&nbsp;'),//查询截止日期  格式为：yyyy-mm-dd hh:mi:ss 没有这个条件参数可传值为：a
		log_kind = req.params.log_kind == 'a' ? '' : req.params.log_kind,//日志类型 没有这个条件参数可传值为：a
	//具体日志类型包括：登录：user_login；微信资源导入：device_import 物理设备导入: device_activate 以下拉列表形式选择日志类型，下拉列表内容通过编码接口获取，编码定义为:log_kind
		page = req.params.page,//上一组日志数据最后一条日志ID
		pagesize = req.params.pagesize,//每组日志数据数量
		sign = req.headers['sign'];//登录凭据;

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/syslog/' + nickName + ',' + loginName + ',' + startDate + ',' + endDate + ',' + log_kind + ',' + page + ',' + pagesize + '/batch',
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
					        "count":1769,
					        "sessionList":[
					            {
					                _id: "55a4d554d655021507000001",//日志ID
					                uid: "5596159630cabc1896cc0809",//登录用户ID
					                loginName: "sup",//登录用户名称
					                nickName: "超级管理员sup",//登录用户昵称
					                created_at: "2015-07-14T17:24:36.000Z",//登录时间/导入时间
					                content: object//
					                登录： {
					                        ip: "::ffff:10.0.9.163"//登录用户客户端ip
								          }
					                微信资源导入：{
					                            successCount: 2,//成功导入设备数量
			                                    repeatCount: 2,//重复导入设备数量
								                repeatList: ['176660','176661'],//重复设备device_id
								                failedCount: 2,//异常失败导入设备数量
								                failedList: ['10131','10132']//异常失败设备device_id
								             }
					                物理设备导入：{
					                            successCount: 2,//成功导入设备数量
			                                    updateVersionFailedCount: 2,//因版本错误无法导入的设备数量
								                updateVersionFailedList: ['176660','176661'],//因版本错误无法导入的设备device_id
								                failedCount: 2,//异常失败导入设备数量
								                failedList: ['10131','10132']//异常失败设备device_id
								             }
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

// ================  系统属性信息接口  ===============================

/**
 * @alias 添加系统属性
 */
router.route('/sysatt').post(function (req, res, next) {
	var data = req.body,
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		domain: data.domain,//访问域名关键字 非必录项
		title: data.title,//系统自定义标题 必录项
		background_color: data.background_color,//系统自定义背景颜色 必录项
		comment: data.comment,//描述 非必录项
		loginName: data.loginName,//登录用户名
		nickName: data.nickName,//昵称
		loginPassword: data.loginPassword,//登录密码
		mobileNO: data.mobileNO,//手机号码
		userComment: data.userComment,//用户信息备注
		workgroupIds: [//工作组权限集合，固定式（后续改成模板），用户平台中为管理员赋予【当前用户】权限
			{
				workgroupId: "55c441c481a9798604000003",
				operationIds: [
					"55926826883d527304000006"
				]
			},
			{
				"workgroupId" : "559e1b1230cabc1896cc0847",
				"operationIds" : [
					"559e16f430cabc1896cc0835",
					"559e170d30cabc1896cc0836",
					"559e17b230cabc1896cc083c",
					"559e179230cabc1896cc083b",
					"559e177e30cabc1896cc083a",
					"559e176830cabc1896cc0839",
					"559e173c30cabc1896cc0838",
					"559e172730cabc1896cc0837"
				]
			},
			{
				"workgroupId" : "559e1b3c30cabc1896cc0848",
				"operationIds" : [
					"559e17e030cabc1896cc083d",
					"559e182530cabc1896cc083e"
				]
			},
			{
				"workgroupId" : "559353b748b1467509000005",
				"operationIds" : [
					"559e156530cabc1896cc082b",
					"559e15de30cabc1896cc0830",
					"559e151430cabc1896cc0829",
					"559e160e30cabc1896cc0832",
					"559e157f30cabc1896cc082c",
					"559e15f430cabc1896cc0831",
					"559e159530cabc1896cc082d",
					"559e154e30cabc1896cc082a",
					"559e15c630cabc1896cc082f"
				]
			},
			{
				"workgroupId" : "559e1adf30cabc1896cc0846",
				"operationIds" : [
					"559a1f2630cabc1896cc0819",
					"559a1f3a30cabc1896cc081a"
				]
			},
			{
				"workgroupId" : "559e1aa430cabc1896cc0845",
				"operationIds" : [
					"559e164830cabc1896cc0834",
					"559e163230cabc1896cc0833"
				]
			},
			{
				"workgroupId" : "559267e5883d527304000003",
				"operationIds" : [
					"5592685c883d527304000009"
				]
			},
			{
				"workgroupId" : "559e00d530cabc1896cc0822",
				"operationIds" : [
					"55b9d392b7c6328cf6000007",
					"559e008f30cabc1896cc0821"
				]
			},
			{
				"workgroupId" : "55a368aee6b3a7b30400000c",
				"operationIds" : [
					"55a3679be6b3a7b304000006",
					"55a367f2e6b3a7b304000007",
					"55a36826e6b3a7b304000008",
					"55a36844e6b3a7b304000009",
					"55a36860e6b3a7b30400000a",
					"55a36881e6b3a7b30400000b"
				]
			}
		]
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/sysattribute',
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
					        _id: '11111111111111111111111' //系统属性ID
					        updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
					        creatorName: '超级管理员',//创建者名称
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
 * @alias 修改系统属性
 */
router.route('/sysatt/:sysattId').put(function (req, res, next) {
	var data = req.body,
		sysattId = req.params.sysattId,//系统属性ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		domain: data.domain,//访问域名关键字 非必录项
		title: data.title,//系统自定义标题 必录项
		background_color: data.background_color,//系统自定义背景颜色 必录项
		comment: data.comment,//描述 非必录项
		uid: data.uid,//域超管id
		loginName: data.loginName,//登录用户名
		nickName: data.nickName,//昵称
		loginPassword: data.loginPassword,//登录密码
		mobileNO: data.mobileNO,//手机号码
		userComment: data.userComment//用户信息备注
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/sysattribute/' + sysattId,
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
					        sysattId: "55a5c6b17e50a41c03000002",//系统属性ID
					        domain: "tjmntv",//域名关键字
					        updated_at: "2015-07-15T11:20:46.000Z",//最后更新时间
					        creatorName: "超级管理员sup"//创建者名称
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
 * @alias 移除系统属性
 */
router.route('/removeSysatt/:sysattId').put(function (req, res, next) {
	var data = req.body,
		sysattId = req.params.sysattId,//系统属性ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/sysattribute/' + sysattId,
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
					sysattObject = JSON.parse(chunks).resultMsg;
					delete cacheObject[sysattObject.domain];
					res.status(200).send(JSON.parse(chunks));
					//返回数据结构：
					/**{
			            resultCode: 0,
			            resultMsg:{
			                sysattId: '11111111111111111111111' //移除系统属性的ID
			                domain: 'tmntv'//域名关键字
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
 * @alias 获取全部系统属性
 */
router.route('/sysatt/:domain/:comment/:page/:pagesize/batch').get(function (req, res, next) {
	var domain = req.params.domain == 'a' ? '' : encodeURI(req.params.domain),//域名称 支持模糊查询，可以使用通配符* 没有这个条件参数可传值为：a
		comment = req.params.comment == 'a' ? '' : encodeURI(req.params.comment),//说明 支持模糊查询，可以使用通配符* 没有这个条件参数可传值为：a
		page = req.params.page,//上一组系统属性的最后一个系统属性ID，置入0表示从头开始
		pagesize = req.params.pagesize,//一次获取的系统属性数量
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/sysattribute/' + domain + ',' + comment + ',' + page + ',' + pagesize + '/batch',
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
			                count: 10, //所有系统属性的数量
			                sysattList: //本次获取到的系统属性集合信息
			                [
			                    {
				                    _id:"55a5cb6a6883b92e03000001",//系统属性ID
				                    domain:"tjmntv",//访问域名关键字
				                    title:"乐摇商圈",//系统自定义标题
				                    background_color:"#000000",//系统自定义背景颜色
				                    comment:"系统头背景",//描述
				                    creatorId:"5596159630cabc1896cc0809",//创建者ID
				                    creatorName:"超级管理员sup",//创建者昵称
				                    created_at:"2015-07-15T10:54:34.000Z",//创建时间
				                    updated_at:"2015-07-15T10:54:34.000Z"//最后更新时间
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
 * @alias 获取系统属性信息
 */
router.route('/sysatt/:domain').get(function (req, res, next) {
	var domain = encodeURI(req.params.domain);//系统属性ID
	//sign = req.headers['sign'];//登录凭据;


	if (cache_process(domain)) {
		res.status(200).send(chunks);
	} else {
		var options = {
			host: interfaceHost,
			port: interfacePort,
			path: '/sysattribute/' + domain,
			method: 'GET',
			key: fs.readFileSync('./certs/develop/cms_key.pem'),
			cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
			requestCert: true,
			rejectUnauthorized: false
			//headers: {
			//	sign: sign + Date.parse(new Date()) / 1000
			//}
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
						/**cacheObject[sysattObject.domain] = {
							_id: sysattObject._id,
							domain: sysattObject.domain,
							title: sysattObject.title,
							background_color: sysattObject.background_color,
							comment: sysattObject.comment,
							creatorId: sysattObject.creatorId,
							creatorName: sysattObject.creatorName,
							created_at: sysattObject.created_at,
							updated_at: sysattObject.updated_at
						};*/

						res.status(200).send(JSON.parse(chunks));
						//返回数据结构：
						/**{
						resultCode: 0,
			            resultMsg:
			            {
					        _id: "55a5c6b17e50a41c03000002",//系统属性ID
					        domain: "tjmntv",//访问域名关键字
					        title: "乐摇商圈",//系统自定义标题
					        background_color: "#000000",//系统自定义背景颜色
					        comment: "乐摇皮肤",//描述
					        creatorId: "5596159630cabc1896cc0809",//创建者ID
					        creatorName: "超级管理员sup",//创建者昵称
					        created_at: "2015-07-15T10:34:25.000Z",//创建时间
					        updated_at: "2015-07-15T11:20:46.000Z",//最后更新时间
					        uid: '55c2c99ad64d366b7e000002',//域超管id
					        loginName: 'chognchong@163.com',//域超管的用户名
						    nickName: '虫虫',//昵称
						    loginPassword: 'sdrwer234234',//密码
						    mobileNO: '1212121212',//手机号码
						    userComment: 'asd',//备注
						    isFormal: ''//域超级管理员信息是否经过正式修改 0--未修改 平台管理员可以修改域超级管理员信息
						                                              1--已经修改 平台管理员不能修改域超级管理员信息
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
	}
});

// ================  工作组、权限顺序接口  ===============================

/**
 * @alias 按从小到大顺序获取工作组列表
 */
router.route('/order/workgroup/:workgroupName/:comment/:kind/batch').get(function (req, res, next) {
	var workgroupName = req.params.workgroupName == 'a' ? '' : encodeURI(req.params.workgroupName),//工作组名称名称 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		comment = req.params.comment == 'a' ? '' : encodeURI(req.params.comment),//说明 支持前后通配符*的模糊查询 没有这个条件参数可传值为：a
		kind = req.params.kind == 'a' ? '' : req.params.kind,//工作组类型 1--超管 2--普管 3--人员 没有这个条件参数可传值为：a
		sign = req.headers['sign'];//登录凭据

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/' + workgroupName + ',' + comment + ',' + kind + ',0,65535' + '/batch',
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
			                count: 10, //所有工作组的数量
			                workgroupList: //本次获取到的工作组集合信息
			                [
			                    {
						            _id: '111111111111111111111111', //工作组ID
						            workgroupName: '工作组名称', //工作组名称
									icon: '工作组标志', //工作组标志
									path: 'super', //工作组path
									creatorId:"000000000000000000000000",//创建者ID
									creatorName:"超级管理员"////创建者姓名
									updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
									comment: '工作组说明', //工作组说明 必录项
									validSign: '1', //有效标志 1--有效 0--无效
									kind: '2',//工作组类型
									order:1,
									operatlinList: [
										{
											_id: '559e15de30cabc1896cc0830',//权限ID
											operationName: '客服支持',//权限名称
											comment: '我的店铺-客服支持',//权限备注
											kind: '3',//权限类型
											updated_at: '2015-07-08T11:29:18.000Z',//权限更新日期
											creatorId: '000000000000000000000000',//权限创建者ID
											creatorName: '超级管理员',//创建者名称
											"order": 1//权限在工作组中的序号
										},
										{
											_id: '559e15de30cabc1896cc0830',//权限ID
											operationName: '客服支持',//权限名称
											comment: '我的店铺-客服支持',//权限备注
											kind: '3',//权限类型
											updated_at: '2015-07-08T11:29:18.000Z',//权限更新日期
											creatorId: '000000000000000000000000',//权限创建者ID
											creatorName: '超级管理员',//创建者名称
											"order": 2//权限在工作组中的序号
										}
									]
			                    },
			                    ...
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
 * @alias 调整工作组顺序接口
 */
router.route('/order/workgroup/:kind').put(function (req, res, next) {
	var data = req.body,
		kind = req.params.kind,//工作组类型
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		workgroupIds: data.workgroupIds//工作组ID集合数组 必录项
		//格式： data.workgroupIds = ['11111111111111111111111','222222222222222222222222','333333333333333333333333']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/workgroup/order/' + kind,
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
 * @alias 按从小到大的顺序获取工作组下的全部权限
 */
router.route('/order/operation/:workgroupId/batch').get(function (req, res, next) {
	var workgroupId = req.params.workgroupId == 'a' ? '' : req.params.workgroupId,//工作组 必录
		sign = req.headers['sign'];//登录凭据;

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation/' + workgroupId + '/batch',
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
			                count: 10, //本次获取权限集合的数量
			                operationList: //权限集合信息
			                [
			                    {
						            _id: '111111111111111111111111', //工作组ID
						            operationName: '权限名称',//权限名称
									icon: '权限标志',//权限标志
									path: 'setting',//权限path
									creatorId:"000000000000000000000000",//创建者ID
									creatorName:"超级管理员"////创建者姓名
									updated_at: '2015-07-02T09:20:40.000Z'//最后更新时间
									comment: ‘权限说明’,//权限说明
						            validSign: '1', //有效标志 1--有效 0--无效
						            kind: '2'//权限类型
						        },
						        ...
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
 * @alias 调整权限顺序接口
 */
router.route('/order/operation/:workgroupId').put(function (req, res, next) {
	var data = req.body,
		workgroupId = req.params.workgroupId,//工作组ID
		sign = req.headers['sign'];//登录凭据;
	var post_data = JSON.stringify({
		operationIds: data.operationIds//权限ID集合数组 必录项
		//格式： data.operationIds = ['11111111111111111111111','222222222222222222222222','333333333333333333333333']
	});

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/auth/operation/order/' + workgroupId,
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

function cache_process(domain) {
	var sysattObject = cacheObject[domain];
	if (sysattObject) {
		chunks = {
			resultCode: 0,
			resultMsg: sysattObject
		};
		return chunks;
	}
}


module.exports = router;
