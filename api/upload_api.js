var express = require('express'),
	bodyParser = require('body-parser'),
	https = require('https'),
	resource = require('./../resource'),
	fs = require('fs'),
	formidable = require('formidable'),
	router = express.Router(),
	qiniu = require('qiniu'),
	exec = require('child_process').exec,
	iconv = require('iconv-lite');

var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT,
	qiniu_domain = '7xldp5.com2.z0.glb.qiniucdn.com', dir;

/**
 * @alias 上传文件
 */
router.route('/').post(function (req, res, next) {

	var form = new formidable.IncomingForm();
	form.keepExtensions = true;
	dir = req.query.dir;
	form.uploadDir = __dirname + '/../public/attached/';
	form.parse(req, function (err, fields, files) {
		if (err) {
			throw err;
		}
		key = dir + '_' + new Date().getTime();
		var image = files.imgFile;
		var path = image.path;
		path = path.replace('/\\/g', '/');
		key += '.' + path.split('.')[1];
		videoFirstPageKey = key.replace(key.split('.')[1], 'jpg');
		var options = {
			host: interfaceHost,
			port: interfacePort,
			path: '/thirdpart/qiniu',
			method: 'GET',
			key: fs.readFileSync('./certs/develop/cms_key.pem'),
			cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
			requestCert: true,
			rejectUnauthorized: false,
			headers: {}
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
						data = JSON.parse(chunks);
						if (/\.(swf|flv|mp4)(\?|$)/i.test(key)) {
							videoFirstPage = path.replace(path.split('/')[path.split('/').length - 1], videoFirstPageKey);
							exec("ffmpeg -ss 00:00:01 -i " + path + " -y -f image2 -t 0.001 " + videoFirstPage + "", function () {
								uploadFile(path, key, data.resultMsg.qiniu_token, res, videoFirstPage);
							});
						} else {
							uploadFile(path, key, data.resultMsg.qiniu_token, res);
						}
						//console.log(generateDownload('7xldp5.com2.z0.glb.qiniucdn.com','image'));
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
});

function uploadFile(localFile, key, uptoken, res, videoFirstPage) {
	var extra = new qiniu.io.PutExtra();
	qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
		if (!err) {
			// 上传成功， 处理返回值
			console.log(ret.key, ret.hash);
			key = iconv.decode(ret.key, 'utf8');
			//删除本地文件
			fs.unlinkSync(localFile);
			console.log('key=' + key);
			downloadUrl = 'http://' + qiniu_domain + '/' + key;

			console.log('downloadUrl=' + downloadUrl);
			var returnInfo = {
				error: 0,
				url: downloadUrl
			};

			//视频缩略图处理
			if (videoFirstPage) {
				var videoFirstUrl;
				var extraFirst = new qiniu.io.PutExtra();
				qiniu.io.putFile(uptoken, videoFirstPageKey, videoFirstPage, extraFirst, function (err, ret) {
					if (!err) {
						// 上传成功， 处理返回值
						key = iconv.decode(ret.key, 'utf8');
						//删除本地文件
						fs.unlinkSync(videoFirstPage);
						console.log('key=' + key);
						videoFirstUrl = 'http://' + qiniu_domain + '/' + key;
						var returnInfo = {
							error: 0,
							url: downloadUrl,
							videoFirstUrl: videoFirstUrl
						};
					} else {
						// 上传失败， 处理返回代码
						var returnInfo = {
							error: err.code,
							message: err.error
						};
						// http://developer.qiniu.com/docs/v6/api/reference/codes.html
					}
					res.send(returnInfo);
				});
			} else {
				res.send(returnInfo);
				// ret.key & ret.hash
			}
		} else {
			// 上传失败， 处理返回代码
			var returnInfo = {
				error: err.code,
				message: err.error
			};
			res.send(returnInfo);
			// http://developer.qiniu.com/docs/v6/api/reference/codes.html
		}
	});
}

/**function generateDownload(domain, key) {
	var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
	var policy = new qiniu.rs.GetPolicy();
	return policy.makeRequest(baseUrl);
}*/

function PutExtra() {
	this.paras = {};
	this.mimeType = 'multipart/form-data';
	this.crc32 = null;
	this.checkCrc = 0;
}

/**
 * @alias 根据编码定义获取编码列表
 */
router.route('/vframe').post(function (req, res, next) {

	var get_data = req.body;
	items = get_data.items;
	console.log(items.length);

});


module.exports = router;
