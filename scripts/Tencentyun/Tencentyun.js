/**
 * Created by marj on 16/7/8.
 */
var tencentyun = require('tencentyun'),
	qcloud_video = require('qcloud_video'),
	resource = require('../../resource'),
	api_extends = require('../../api/api_extends'),
	exec = require('child_process').exec,
	fs = require('fs'),
	iconv = require('iconv-lite');

function Tencentyun() {
}

var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT,
	uploadType = {image: 4258, video: 7059},
	image_bucket = 'tjmntv',
	video_bucket = 'enorth123',
	projectId = '10007044',
	userid = 0,
	secretId = 'AKIDYNX96iPjsJAo1f67L7FSC4DJe8h2j0FL',
	secretKey = 'nPViNSHaKaEReH1vipjE8kvMQgRh405z';

tencentyun.conf.setAppInfo(projectId, secretId, secretKey);
qcloud_video.conf.setAppInfo(projectId, secretId, secretKey);

Tencentyun.prototype.uploadFile = function (key, path, res, videoFirstPageKey, next) {
	if (/\.(swf|flv|mp4)(\?|$)/i.test(key)) {
		uploadTencentyun(path, key, uploadType.video, function (err, data) {
			if (err) {
				//res.send(err);
				next(err, null);
			} else {
				var downloadUrl = data.access_url,
					videoFirstPage = path.replace(path.split('.')[path.split('.').length - 1], 'jpg');
				exec("ffprobe -v quiet -print_format json -show_format -show_streams " + downloadUrl, function (err, stdout) {
					if (err) {
						//res.send(err);
                        next(err, null);
					} else {
						var videoInfo = JSON.parse(stdout);
						var streams = videoInfo.streams[0];
						// var display_aspect_ratio = streams.display_aspect_ratio;
						// var width = Math.floor(height * parseInt(display_aspect_ratio.split(":")[0]) / parseInt(display_aspect_ratio.split(":")[1]));
						var height = streams.height;
						var width = streams.width;
						exec("ffmpeg -ss 00:00:01 -i " + downloadUrl + " -y -f image2 -t 0.001 -s " + width + "x" + height + " " + videoFirstPage + "", function () {
							uploadTencentyun(videoFirstPage, videoFirstPageKey, uploadType.image, function (err, data) {
								if (err) {
									//res.send(err);
                                    next(err, null);
								} else {
									var returnInfo = {
										error: 0,
										url: downloadUrl,
										videoFirstUrl: data.downloadUrl //+ '?imageView2/1/w/960/h/740'
									};
									//res.send(returnInfo);
                                    next(null, returnInfo);
								}
							});
						});
					}
				});
			}
		});
	} else {
		uploadTencentyun(path, key, uploadType.image, function (err, data) {
			if (err) {
				//res.send(err);
                next(err, null);
			} else {
				var returnInfo = {
					error: 0,
					url: data.downloadUrl
				};
				//res.send(returnInfo);
                next(null, returnInfo);
			}
		});
	}
};

Tencentyun.prototype.uploadTencentyun = uploadTencentyun;
function uploadTencentyun(path, key, uploadType, callback) {
	if (uploadType == 7059) {
		//qcloud_video.video.upload(path, video_bucket, key, null, null, null, null, function (ret) {
		qcloud_video.video.upload_slice(path, video_bucket, key, null, null, null, null, 2 * 1024 * 1024, '', function (ret) {
			try {
				if (ret.code == 0 && ret.httpcode == 200) {
					var data = ret.data;
					callback(null, data);
				} else {
					var returnInfo = {
						error: ret.code,
						message: ret.message
					};
					callback(returnInfo, null);
				}
			} catch (err) {
				var returnInfo = {
					error: -20000,
					message: '上传异常'
				};
				callback(returnInfo, null);
			}
		});
	} else {
		tencentyun.imagev2.upload(path, image_bucket, key, function (ret) {
			try {
				if (ret.code == 0 && ret.httpcode == 200) {
					var data = ret.data;
					callback(null, data);
				} else {
					var returnInfo = {
						error: ret.code,
						message: ret.message
					};
					callback(returnInfo, null);
				}
			} catch (err) {
				var returnInfo = {
					error: -20000,
					message: '上传异常'
				};
				callback(returnInfo, null);
			}
		}, 0, null);
	}
};


module.exports = new Tencentyun();