var express = require('express'),
	bodyParser = require('body-parser'),
	https = require('https'),
	resource = require('./../resource'),
	fs = require('fs'),
	router = express.Router(),
	currentUser = '';

var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT;

/**
 * @alias 根据编码定义获取编码列表
 */
router.route('/:definition/batch').get(function (req, res, next) {

	var sign = req.headers['sign'],//登录凭据;
		definition = req.params.definition;//编码定义 必录项

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/code/' + definition + '/batch',
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
							codeList: //编码内容列表
							[
								{
									"code":"4", //编码值
									"name":"场景广告",//编码中文
									"codeOrder":4,//编码序号
									"comment":"场景广告",//编码描述
									"definition":"promotionType",//编码定义
									"parentDefinition",""//上一级编码定义
									"parentCode":""//上一级编码值

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

	//interfaceReq.write(post_data);
	interfaceReq.end();
});

/**
 * @alias 根据系统path编码列表
 */
router.route('/path/batch').get(function (req, res, next) {
	var sign = req.headers['sign'];//登录凭据;

	var options = {
		host: interfaceHost,
		port: interfacePort,
		path: '/code//path/batch',
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
							codeList: //编码内容列表
								{
									"1":"super", //超级管理员
									"2":"admin", //管理员
									"3":'user', //用户
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

	//interfaceReq.write(post_data);
	interfaceReq.end();
});


module.exports = router;
