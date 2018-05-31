var http = require('http');
var https = require('https');
var urlM = require('url');
var fs = require('fs');
var crypto = require('crypto');
var formstream = require('formstream');
var auth = require('./auth');
var conf = require('./conf');

var VIDEO_PARAMS_ERROR = -1;
var VIDEO_NETWORK_ERROR = -2;

function buildRequest(options, callback) {
	var net = http;
	if (options['protocol'] == "https:") {
		net = https;
	}
	var req = net.request(options,
		function (res) {
			var body = "";
			res.on('data', function (data) { body += data; })
			   .on('end', function () {
				try {
					var ret = JSON.parse(body.toString());
				} catch (err) {
				}
				if (ret) {
					var result = {
						'httpcode':res.statusCode,
						'code':ret.code, 
						'message':ret.message || '', 
						'data':{}
					}

					if (0 == ret.code && ret.hasOwnProperty('data')) {
						result.data = ret.data;
					}

					callback(result);

				} else {
					callback({'httpcode':res.statusCode, 'code':VIDEO_NETWORK_ERROR, 'message':'response '+body.toString()+' is not json', 'data':{}});
				}
			});
		}).on('error', function(e){
			callback({'httpcode':0, 'code':VIDEO_NETWORK_ERROR, 'message':String(e.message), 'data':{}});
		});
	req.setTimeout(conf.recvTimeout, function(){
		req.end();
		callback({'httpcode':0, 'code':VIDEO_NETWORK_ERROR, 'message':'recv timeout', 'data':{}});
	});
	return req;
}

/**
 * 上传本地视频
 * @param  {string}   filePath     视频本地路径，必须
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   dstpath      视频存储的路径和名称，必须
 * @param  {string}   bizattr      视频的属性，可选
 * @param  {string}   title        视频的标题，可选
 * @param  {string}   desc         视频的描述，可选
 * @param  {string}   magiccontext 业务附加信息,用于透传回调用者的业务后台，可选
 * @param  {Function} callback     用户上传完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function upload(filePath, bucket, dstpath, bizattr, title, desc, magiccontext, callback) {

	if (typeof bizattr === 'function') {
		callback = bizattr;
		bizattr = null;
	} else if (typeof title === 'function') {
		callback = title;
		title = null;
	} else if (typeof desc === 'function') {
		callback = desc;
		desc = null;
	} else if (typeof magiccontext === 'function') {
		callback = magiccontext;
		magiccontext = null;
	} else {
		callback = callback || function(ret){ console.log(ret); };
	}

	var isExists = fs.existsSync(filePath);
	if (isExists && typeof callback === 'function') {
		bucket = bucket.strip();
		dstpath = encodeURIComponent(dstpath.strip()).replace('%2F','/');
		var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
		var sign  = auth.signMore(bucket, expired);
		var url = generateResUrl(bucket, dstpath);
		var urlInfo = urlM.parse(url);

		var sha = crypto.createHash('sha1');

		var fsRS = fs.createReadStream(filePath);
		fsRS.on('data', function(d) { sha.update(d); });

		fsRS.on('end', function() {
				var form = formstream()
					.field('op', 'upload')
					.field('sha', sha.digest('hex'));

				var stats = fs.statSync(filePath);
				var fileSizeInBytes = stats["size"];
				form.file('filecontent', filePath, fileSizeInBytes);
				if (bizattr != null) {
					form.field('biz_attr', bizattr.toString());
				}
				if (title != null) {
					form.field('video_title', title.toString());
				}
				if (desc != null) {
					form.field('video_desc', desc.toString());
				}
				if (magiccontext != null) {
					form.field('magiccontext', magiccontext.toString());
				}

				var headers = form.headers();
				headers['Authorization'] = sign;
				headers['User-Agent'] = conf.USER_AGENT();

				var options = {
					protocol: urlInfo.protocol,
					hostname: urlInfo.hostname,
					port: urlInfo.port,
					path: urlInfo.path,
					method: 'POST',
					headers: headers
				};

				var req = buildRequest(options, callback);
				req && form.pipe(req);
		});

	} else {
		// error, file not exists
		callback({'httpcode':0, 'code':VIDEO_PARAMS_ERROR, 'message':'file '+filePath+' not exists or params error', 'data':{}});
	}
}

/**
 * 分片上传本地视频
 * @param  {string}   filePath     视频本地路径，必须
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   dstpath      视频存储的路径和名称，必须
 * @param  {string}   bizattr      目录/视频属性，业务端维护，可选
 * @param  {string}   title        视频的标题，可选
 * @param  {string}   desc         视频的描述，可选
 * @param  {string}   magiccontext 业务附加信息,用于透传回调用者的业务后台，可选
 * @param  {int}      slice_size   指定分片大小，小于3M，可选
 * @param  {string}   session      指定续传session，可选
 * @param  {Function} callback     用户上传完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function upload_slice(filePath, bucket, dstpath, bizattr, title, desc, magiccontext, slice_size, session, callback) {

	bucket = bucket.strip();
	dstpath = encodeURIComponent(dstpath.strip()).replace('%2F','/');
	if (typeof bizattr === 'function') {
		callback = bizattr;
		bizattr = null;
	} else if (typeof title === 'function') {
		callback = title;
		title = null;
	} else if (typeof desc === 'function') {
		callback = desc;
		desc = null;
	} else if (typeof magiccontext === 'function') {
		callback = magiccontext;
		magiccontext = null;
	} else if (typeof slice_size === 'function') {
		callback = slice_size;
		slice_size = null;
	} else if (typeof session === 'function') {
		callback = session;
		session = null;
	} else {
		callback = callback || function(ret){ console.log(ret); };
	}

	upload_prepare(filePath, bucket, dstpath, bizattr, title, desc, magiccontext, slice_size, session, function (rsp){
		if (rsp['httpcode'] != 200 || rsp['code'] != 0) {
			return callback(rsp);
		}
		/*秒传命中*/
		if (rsp.hasOwnProperty('data') && rsp['data'].hasOwnProperty('url')) {  
			return callback(rsp);
		}
		var offset = 0;
		var data = rsp['data'];
		if (data.hasOwnProperty('slice_size')) {
			slice_size = data['slice_size'];
		}
		if (data.hasOwnProperty('offset')) {
			offset = data['offset'];
		}
		if (data.hasOwnProperty('session')) {
			session = data['session'];
		}
		var stats = fs.statSync(filePath);
		var size = stats["size"];
		var retry = 0;
		var func_upload = function (cb) {
			if (size > offset) {
				var length = (offset+slice_size>size ? size-offset : slice_size);
				upload_data(bucket,dstpath,filePath,offset,length,session, function (ret){
						if (ret['httpcode'] != 200 || ret['code'] != 0) {
							if (retry < 3) {
								retry ++;
								return func_upload();
							}
							return callback(ret); 
						}
						if (ret.hasOwnProperty('data') && ret['data'].hasOwnProperty('url')) {
							return callback(ret);
						}
						offset += slice_size;
						retry = 0;
						func_upload();
					});
			}
		}
		func_upload();
	});
}

function upload_prepare(filePath, bucket, dstpath, bizattr, title, desc, magiccontext, slice_size, session, callback) {
	var isExists = fs.existsSync(filePath);
	if (isExists && typeof callback === 'function') {
		var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
		var sign  = auth.signMore(bucket, expired);
		var url = generateResUrl(bucket, dstpath);
		var urlInfo = urlM.parse(url);

		var sha = crypto.createHash('sha1');
		var fsRS = fs.createReadStream(filePath);
		fsRS.on('data', function(d) { sha.update(d); });

		fsRS.on('end', function() {
				var form = formstream()
					.field('op', 'upload_slice')
					.field('sha', sha.digest('hex'));

				var stats = fs.statSync(filePath);
				var fileSizeInBytes = stats["size"];
				form.field('filesize', fileSizeInBytes.toString());

				if (bizattr != null) {
					form.field('biz_attr', bizattr.toString());
				}
				if (title != null) {
					form.field('video_title', title.toString());
				}
				if (desc != null) {
					form.field('video_desc', desc.toString());
				}
				if (magiccontext != null) {
					form.field('magiccontext', magiccontext.toString());
				}
				if (slice_size) {
					form.field('slice_size', slice_size.toString());
				}
				if (session) {
					form.field('session', session.toString());
				}

				var headers = form.headers();
				headers['Authorization'] = sign;
				headers['User-Agent'] = conf.USER_AGENT();

				var options = {
					protocol: urlInfo.protocol,
					hostname: urlInfo.hostname,
	  				port: urlInfo.port,
	  				path: urlInfo.path,
	  				method: 'POST',
	  				headers: headers
				};

				var req = buildRequest(options, callback);
				req && form.pipe(req);
		});
	} else {
		// error, file not exists
		callback({'httpcode':0, 'code':VIDEO_PARAMS_ERROR, 'message':'file '+filePath+' not exists or params error', 'data':{}});
	}
}
function upload_data(bucket, dstpath, filePath, offset, length, session, callback) {
	var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
	var sign  = auth.signMore(bucket, expired);
	var url = generateResUrl(bucket, dstpath);
	var urlInfo = urlM.parse(url);
	var form = formstream()
		.field('op', 'upload_slice')
		.field('session', session.toString())
		.field('offset', offset.toString());
	var fstream = fs.createReadStream(filePath, {start:offset, end:offset+length-1});
	form.stream('filecontent', fstream, filePath, length);

	var headers = form.headers();
	headers['Authorization'] = sign;
	headers['User-Agent'] = conf.USER_AGENT();

	var options = {
		protocol: urlInfo.protocol,
		hostname: urlInfo.hostname,
		port: urlInfo.port,
		path: urlInfo.path,
		method: 'POST',
		headers: headers
	};

	var req = buildRequest(options, callback);
	req && form.pipe(req);
}


/**
 * 查询视频
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         视频路径，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function statFile(bucket, path, callback) {
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip()).replace('%2F','/');
	stat(bucket, path, callback);
}
/**
 * 查询目录
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         目录路径，目录必须以'/'结尾，若忘记，sdk会自动补齐，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function statFolder(bucket, path, callback) {
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip() + '/').replace('%2F','/');
	stat(bucket, path, callback);
}
/**
 * 查询视频
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         目录/视频路径，目录必须以'/'结尾，视频不能以'/'结尾，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function stat(bucket, path, callback) {
	callback = callback || function(ret){console.log(ret)};

	if (typeof callback === 'function') {
		var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
		var sign  = auth.signMore(bucket, expired);
		var url = generateResUrl(bucket, path);
		var urlInfo = urlM.parse(url);

		var headers = {};
		headers['Authorization'] = sign;
		headers['User-Agent'] = conf.USER_AGENT();

		var options = {
			protocol: urlInfo.protocol,
			hostname: urlInfo.hostname,
	 		port: urlInfo.port,
	  		path: urlInfo.path+'?op=stat',
	  		method: 'GET',
	  		headers: headers
		};

		var req = buildRequest(options, callback);
		req && req.end();

	} else {
		// error
		callback({'httpcode':0, 'code':VIDEO_PARAMS_ERROR, 'message':'params error', 'data':{}});
	}
}

/**
 * 删除视频
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         视频路径，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function deleteFile(bucket, path, callback) {
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip()).replace('%2F','/');
	del(bucket, path, callback);
}
/**
 * 删除目录
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         目录路径，目录必须以'/'结尾，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function deleteFolder(bucket, path, callback) {
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip()+'/').replace('%2F','/');
	del(bucket, path, callback);
}
/**
 * 删除视频
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         目录/视频路径，目录必须以'/'结尾，视频不能以'/'结尾，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function del(bucket, path, callback) {

	callback = callback || function(ret){console.log(ret)};

	if (path == '' || path == '/' || typeof callback === 'function') {
		var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
		var sign  = auth.signOnce(bucket, '/'+conf.APPID+'/'+bucket+'/'+path);
		var url = generateResUrl(bucket, path);
		var urlInfo = urlM.parse(url);

		var data = '{"op":"delete"}';

		var headers = {};
		headers['Authorization'] = sign;
		headers['Content-Type'] = 'application/json';
		headers['User-Agent'] = conf.USER_AGENT();
		headers['Content-Length'] = data.length;


		var options = {
			protocol: urlInfo.protocol,
			hostname: urlInfo.hostname,
	  		port: urlInfo.port,
	  		path: urlInfo.path,
	  		method: 'POST',
	  		headers: headers
		};

		var req = buildRequest(options, callback);
		req && req.end(data);

	} else {
		// error
		callback({'httpcode':0, 'code':VIDEO_PARAMS_ERROR, 'message':'params error', 'data':{}});
	}
}

/**
 * 更新视频
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         视频路径，必须
 * @param  {string}   title        视频的标题，可选
 * @param  {string}   desc         视频的描述，可选
 * @param  {string}   bizattr      视频的属性，可选
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function updateFile(bucket, path, title, desc, bizattr, callback) {
	if (typeof title === 'function') {
		callback = title;
		title = null;
	} else if (typeof desc === 'function') {
		callback = desc;
		desc = null;
	} else if (typeof bizattr === 'function') {
		callback = bizattr;
		bizattr = null;
	}
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip()).replace('%2F','/');
	if (title && desc && bizattr){
		var flag = conf.eMaskAll;
	} else {
		if (title != null) { flag |= conf.eMaskTitle; }
		if (desc != null) { flag |= conf.eMaskDesc; }
		if (bizattr != null) { flag |= conf.eMaskBizAttr; }
	}

	update(bucket, path, title, desc, bizattr, flag, callback);
}
/**
 * 更新目录
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         目录路径，目录必须以'/'结尾，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function updateFolder(bucket, path, bizattr, callback) {
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip()+'/').replace('%2F','/');
	update(bucket, path, bizattr, callback);
}
/**
 * 更新视频
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         目录/视频路径，目录必须以'/'结尾，视频不能以'/'结尾，必须
 * @param  {string}   title        视频的标题，可选
 * @param  {string}   desc         视频的描述，可选
 * @param  {string}   bizattr      视频的属性，可选
 * @param  {int}      flag         更新内容flag，可选
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function update(bucket, path, title, desc, bizattr, flag, callback) {

	bizattr = bizattr || '';
	callback = callback || function(ret){console.log(ret)};

	if (typeof callback === 'function') {
		var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
		var sign  = auth.signOnce(bucket, '/'+conf.APPID+'/'+bucket+'/'+path);
		var url = generateResUrl(bucket, path);
		var urlInfo = urlM.parse(url);

		var jsonObj = {'op':'update'};
		if (bizattr != null) { jsonObj['biz_attr'] = bizattr.toString(); }
		if (title != null)   { jsonObj['video_title'] = title.toString(); }
		if (desc != null)    { jsonObj['video_desc'] = desc.toString(); }
		if (flag != null)    { jsonObj['flag'] = flag.toString(); }
		var data = JSON.stringify(jsonObj);

		var headers = {};
		headers['Authorization'] = sign;
		headers['Content-Type'] = 'application/json';
		headers['User-Agent'] = conf.USER_AGENT();
		headers['Content-Length'] = data.length;

		var options = {
			protocol: urlInfo.protocol,
			hostname: urlInfo.hostname,
	  		port: urlInfo.port,
	  		path: urlInfo.path,
	  		method: 'POST',
	  		headers: headers
		};

		var req = buildRequest(options, callback);
		req && req.end(data);

	} else {
		// error
		callback({'httpcode':0, 'code':VIDEO_PARAMS_ERROR, 'message':'params error', 'data':{}});
	}
}

/**
 * 目录列表
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         
				/			必须以'/'结尾
				/[DirName]/		必须以'/'结尾
 * @param  {int}      num          拉取的总数
 * @param  {string}   pattern      eListBoth, ListDirOnly, eListFileOnly 默认eListBoth
 * @param  {int}      order        默认正序(=0), 填1为反序，需要翻页时，正序时0代表下一页，1代表上一页。反续时1代表下一页，0代表上一页。
 * @param  {string}   context      透传字段,用于翻页,前端不需理解,需要往前/往后翻页则透传回来，从返回的结果中取得，详见文档
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function list(bucket, path, num, pattern, order, context, callback) {
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip()+'/').replace('%2F','/');
	listFiles(bucket, path, num, pattern, order, context, callback);
}
/**
 * 前缀搜索
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         
				/			必须以'/'结尾
				/[DirName]/		必须以'/'结尾
 * @param  {string}   prefix       列出含prefix此前缀的所有视频
 * @param  {int}      num          拉取的总数
 * @param  {string}   pattern      eListBoth, ListDirOnly, eListFileOnly 默认eListBoth
 * @param  {int}      order        默认正序(=0), 填1为反序，需要翻页时，正序时0代表下一页，1代表上一页。反续时1代表下一页，0代表上一页。
 * @param  {string}   context      透传字段,用于翻页,前端不需理解,需要往前/往后翻页则透传回来，从返回的结果中取得，详见文档
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function prefixSearch(bucket, path, prefix, num, pattern, order, context, callback) {
	bucket = bucket.strip();
	path = encodeURIComponent(path.strip()).replace('%2F','/');
	if (path == '') {
		path = prefix;
	} else {
		path += '/'+prefix;
	}

	listFiles(bucket, path, num, pattern, order, context, callback);
}
/**
 * 目录列表,前缀搜索
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         
				/			必须以'/'结尾
				/[DirName]/		必须以'/'结尾
				/[DirName]/[prefix] 	列出含prefix此前缀的所有视频,不能以'/'结尾
 * @param  {int}      num          拉取的总数
 * @param  {string}   pattern      eListBoth, ListDirOnly, eListFileOnly 默认eListBoth
 * @param  {int}      order        默认正序(=0), 填1为反序，需要翻页时，正序时0代表下一页，1代表上一页。反续时1代表下一页，0代表上一页。
 * @param  {string}   context      透传字段,用于翻页,前端不需理解,需要往前/往后翻页则透传回来
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function listFiles(bucket, path, num, pattern, order, context, callback) {
	if (typeof num === 'function') {
		callback = num;
		num = null;
	} else if (typeof pattern === 'function') {
		callback = pattern;
		pattern = null;
	} else if (typeof order === 'function') {
		callback = order;
		order = null;
	} else if (typeof context === 'function') {
		callback = context;
		context = null;
	}
	num = num || 20;
	pattern = pattern || 'eListBoth';
	order = order || 0;
	context = encodeURIComponent(context || '');
	callback = callback || function(ret){console.log(ret)};

	if (typeof callback === 'function') {
		var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
		var sign  = auth.signMore(bucket, expired);
		var url = generateResUrl(bucket, path);
		var urlInfo = urlM.parse(url);

		var headers = {};
		headers['Authorization'] = sign;
		headers['User-Agent'] = conf.USER_AGENT();

		var options = {
			protocol: urlInfo.protocol,
			hostname: urlInfo.hostname,
	 		port: urlInfo.port,
	  		path: urlInfo.path+'?op=list&num='+num+'&pattern='+pattern+'&order='+order+'&context='+context,
	  		method: 'GET',
	  		headers: headers
		};

		var req = buildRequest(options, callback);

		req && req.end();

	} else {
		// error
		callback({'httpcode':0, 'code':VIDEO_PARAMS_ERROR, 'message':'params error', 'data':{}});
	}
}

/**
 * 创建目录
 * @param  {string}   bucket       bucket目录名称，必须
 * @param  {string}   path         目录路径，必须以'/'结尾，必须
 * @param  {Function} callback     完毕后执行的回调函数，可选，默认输出日志 格式为 function (ret) {}
 *                                 入参为ret：{'httpcode':200,'code':0,'message':'ok','data':{...}}
 */
function createFolder(bucket, path, bizattr, callback) {

	if (typeof bizattr === 'function') {
		callback = bizattr;
		bizattr = null;
	}
	bizattr = bizattr || ''
	callback = callback || function(ret){console.log(ret)};

	if (typeof callback === 'function') {
		bucket = bucket.strip();
		path = encodeURIComponent(path.strip() + '/').replace('%2F','/');
		var expired = parseInt(Date.now() / 1000) + conf.EXPIRED_SECONDS;
		var sign  = auth.signMore(bucket, expired);
		var url = generateResUrl(bucket, path);
		var urlInfo = urlM.parse(url);

		var data = JSON.stringify({'op':'create','biz_attr':bizattr.toString()});

		var headers = {};
		headers['Authorization'] = sign;
		headers['Content-Type'] = 'application/json';
		headers['Content-Length'] = data.length;
		headers['User-Agent'] = conf.USER_AGENT();

		var options = {
			protocol: urlInfo.protocol,
			hostname: urlInfo.hostname,
	  		port: urlInfo.port,
	  		path: urlInfo.path,
	  		method: 'POST',
	  		headers: headers
		};

		var req = buildRequest(options, callback);
		req && req.end(data);
	} else {
		// error
		callback({'httpcode':0, 'code':VIDEO_PARAMS_ERROR, 'message':'params error', 'data':{}});
	}
}

function generateResUrl(bucket, path) {
	return conf.API_VIDEO_END_POINT+conf.APPID+'/'+bucket+'/'+(path=='/'?"":path);
}

String.prototype.strip = function(){
	return this.replace(/(^\/*)|(\/*$)/g, '');
}
String.prototype.lstrip = function(){
	return this.replace(/(^\/*)/g, '');
}
String.prototype.rstrip = function(){
	return this.replace(/(\/*$)/g, '');
}

exports.upload = upload;
exports.upload_slice = upload_slice;
exports.statFile = statFile;
exports.statFolder = statFolder;
exports.deleteFile = deleteFile;
exports.deleteFolder = deleteFolder;
exports.updateFile = updateFile;
exports.updateFolder = updateFolder;
exports.list = list;
exports.prefixSearch = prefixSearch;
exports.createFolder = createFolder;
