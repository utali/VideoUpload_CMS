var express = require('express'),
	bodyParser = require('body-parser'),
	https = require('https'),
	router = express.Router(),
	fs = require('fs'),
	api_extends = require('./api_extends'),
	resource = require('../resource'),
	debug = false;
var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT;
var cacheObject = {};

/**
 * @alias 检验推送效验码
 */
router.route('/validcode/:userId/:pushValidCode').get(function (req, res, next) {
	var data = req.body,
		userId = req.params.userId,//用户ID
		pushValidCode = req.params.pushValidCode,//推送验证码
		sign = req.headers['sign'];

	var options = api_extends.options(interfaceHost, interfacePort, '/push/validcode/' + userId + ',' + pushValidCode, 'GET', null, sign);
	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS:' + interfaceRes.statusCode);
		console.log('HEADERS:' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = '';
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
 * @alias 获取单条推送列表
 */
router.route('/:pushTitle/:pushPersonId/:pushStatus/:startCreated/:endCreated/:pageNo/:pageSize/batch').get(function (req, res, next) {
	var pushTitle = req.params.pushTitle == 'a' ? '' : encodeURI(req.params.pushTitle),//推送标题
		pushPersonId = req.params.pushPersonId == 'a' ? '' : encodeURI(req.params.pushPersonId),//推送人ID
		pushStatus = req.params.pushStatus == 'a' ? '' : encodeURI(req.params.pushStatus),//推送状态
		startCreated = req.params.startCreated == 'a' ? '' : encodeURI(req.params.startCreated),//开始日期 已推送传的是推送时间,未推送传的是添加时间
		endCreated = req.params.endCreated == 'a' ? '' : encodeURI(req.params.endCreated),//结束日期 已推送传的是推送时间,未推送传的是添加时间
		pageNo = req.params.pageNo == 'a' ? '' : encodeURI(req.params.pageNo),//页号
		pageSize = req.params.pageSize == 'a' ? '' : encodeURI(req.params.pageSize),//页列表数量
		sign = req.headers['sign'];

    var options = api_extends.options(interfaceHost, interfacePort, '/push/' + pushTitle + ',' + pushPersonId + ',' + pushStatus + ',' + startCreated + ',' + endCreated + ',' + pageNo + ',' + pageSize + '/batch', 'GET', null, sign);
	var interfaceReq = https.request(options, function (interfaceRes) {
		console.log('STATUS:' + interfaceRes.statusCode);
		console.log('HEADERS:' + JSON.stringify(interfaceRes.headers));
		interfaceRes.setEncoding('utf8');
		if (interfaceRes.statusCode == 200) {
			var chunks = '';
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