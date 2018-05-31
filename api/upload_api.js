var express = require('express'),
    url = require('url'),
    https = require('https'),
    http = require('http'),
    exec = require('child_process').exec,
    fs = require('fs'),
    formidable = require('formidable'),
    resource = require('./../resource'),
    TencentYun = require('../scripts/Tencentyun/Tencentyun'),
    api_extends = require('./api_extends');
var async = require('async');
var router = express.Router();

// 上传文件最大限制 500M
var UPLOADLIMIT = 500 * 1024 * 1024;

/**
 * @alias 上传文件
 */
router.route('/').post(function (req, res, next) {
    var isUploadOnlineRes = req.query.online;
    if (isUploadOnlineRes) {
        // 上传线上资源
        saveHttpResources(res, req.body.resUrl, req.query.dir, next);
    } else {
        // 限制上传文件大小 500M
        if (req.headers['content-length'] > UPLOADLIMIT) {
            var returnInfo = {
                error:   -1,
                message: '上传文件过大，请上传小于 500M 的文件'
            };
            res.send(returnInfo);
        } else {
            var form = new formidable.IncomingForm();
            form.keepExtensions = true;
            form.multiples=true;//设置为多文件上传
            var dir = 'ENORTH/CMS/' + api_extends.date_yyyymmdd() + '/' + req.query.dir,
                imgFolder = __dirname + '/../public/attached/' + api_extends.date_yyyymmdd();

            if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);

            form.uploadDir = imgFolder;
            form.parse(req, function (err, fields, files) {
                if (err) throw err;
                if(files.file_name.length>1){
                    var count =0,fileList=[];
                    async.whilst(
                        function(){
                            return count < files.file_name.length;
                        },
                        function(callback){

                            var key = dir + '_' + new Date().getTime();
                            var image = files.file_name[count];
                            var path = image.path;
                            path = path.replace('/\\/g', '/');
                            key += '.' + path.split('.')[1];
                            var videoFirstPageKey = key.replace(key.split('.')[1], 'jpg');

                            TencentYun.uploadFile(key, path, res, videoFirstPageKey, function(err, data){
                                console.log(data);
                                fileList.push(data.url)
                                count++;
                                callback(null);
                            });

                        },
                        function(err){
                            res.send(JSON.stringify({
                                errCode: "0",
                                fileList: fileList
                            }))
                            console.log('err'+err)
                        }
                    );
                }else {
                    var key = dir + '_' + new Date().getTime();
                    var image = files.file_name;
                    var path = image.path;
                    path = path.replace('/\\/g', '/');
                    key += '.' + path.split('.')[1];
                    var videoFirstPageKey = key.replace(key.split('.')[1], 'jpg');

                    TencentYun.uploadFile(key, path, res, videoFirstPageKey, (err, returnInfo) => {
                        res.status(200).send(returnInfo);
                    });
                }
            });
        }
    }
});

/**
 * @alias 上传线上视频资源
 */
router.route('/http_resource').post(function (req, res, next) {
    var videoUrl = decodeURIComponent(req.body.videoUrl);
    var ext = '.' + url.parse(videoUrl).path.split('.')[1];

    var dir = 'ENORTH/CMS/' + api_extends.date_yyyymmdd() + '/' + req.query.dir,
        imgFolder = __dirname + '/../public/attached/' + api_extends.date_yyyymmdd();

    if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);

    console.log("*******************************");
    console.log('准备上传线上资源');
    console.log("*******************************");

    var key = dir + '_' + new Date().getTime();
    key += ext;
    var videoFirstPageKey = key.replace(key.split('.')[1], 'jpg');
    var videoFirstPage = imgFolder + '/' + getRandomSalt() + '.jpg';

    exec("ffprobe -v quiet -print_format json -show_format -show_streams " + videoUrl, function (err, stdout) {
        if (err) {
            res.send(err);
        } else {
            var videoInfo = JSON.parse(stdout);
            var streams = videoInfo.streams[0];
            // var display_aspect_ratio = streams.display_aspect_ratio;
            // var width = Math.floor(height * parseInt(display_aspect_ratio.split(":")[0]) / parseInt(display_aspect_ratio.split(":")[1]));
            var height = streams.height;
            var width = streams.width;

            exec("ffmpeg -ss 00:00:01 -i " + videoUrl + " -y -f image2 -t 0.001 -s " + width + "x" + height + " " + videoFirstPage + "", function () {
                TencentYun.uploadTencentyun(videoFirstPage, videoFirstPageKey, 4258, function (err, data) {
                    if (err) {
                        res.send(err);
                    } else {
                        var returnInfo = {
                            error:         0,
                            url:           videoUrl,
                            videoFirstUrl: data.downloadUrl
                        };
                        res.send(returnInfo);
                    }
                });
            });
        }
    });

});

/**
 * @alias 根据编码定义获取编码列表
 */
router.route('/vframe').post(function (req, res, next) {
    var get_data = req.body;
    var items = get_data.items;
});


/**
 * 生成随机盐
 */
function getRandomSalt() {
    var milliseconds = new Date().getTime();
    var timestamp = (milliseconds.toString()).substring(9, 13)
    var random = ("" + Math.random()).substring(2, 8);
    var random_number = timestamp + random;  // string will be unique because timestamp never repeat itself
    // var random_string = base64_encode(random_number).substring(2, 8); // you can set size here of return string
    var random_string = new Buffer((random_number).substring(2, 8)).toString('base64'); // you can set size here of return string
    var return_string = '';
    var Exp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
    if (random_string.match(Exp)) {                 //check here whether string is alphanumeric or not
        return_string = random_string;
    } else {
        return getRandomSalt();  // call recursivley again
    }
    return return_string;
}

/**
 * 保存网络资源到本地
 */
function saveHttpResources(_res, _url, dir, next) {
    var srcReg = /^(http|https):\/\//;
    if (!srcReg.test(_url)) next('请求地址不合法', null);

    var _http = /^https/.test(_url) ? https : http;

    var extension = url.parse(_url).pathname.split('.').reverse()[0];
    var interfaceReq = _http.get(_url, function (res) {
        if (res.statusCode === 200) {
            var chunks = [],
                length = 0;
            res.on('data', function (chunk) {
                length += chunk.length;
                chunks.push(chunk);
            });
            res.on('end', function () {
                var buffer = new Buffer(length);

                for (var i = 0, pos = 0, size = chunks.length; i < size; i++) {
                    chunks[i].copy(buffer, pos);
                    pos += chunks[i].length;
                }

                var imgFolder = __dirname + '/../public/attached/' + api_extends.date_yyyymmdd();
                if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);

                var imageFileName = getRandomSalt() + '_' + new Date().getTime() + i + '.' + extension;
                var imageFile = imgFolder + '/' + imageFileName;

                fs.writeFileSync(imageFile, buffer);

                var key = dir + '_' + new Date().getTime();
                imageFile = imageFile.replace('/\\/g', '/');
                key += '.' + imageFile.split('.')[1] + 'jpg';

                TencentYun.uploadFile(key, imageFile, _res);
            });
        } else {
            next('图片请求出错了!', null);
        }
    });
    interfaceReq.on('error', function (e) {
        next('图片请求出错了:' + e.message, null)
    });
    // 最长超时 5s
    interfaceReq.setTimeout(5000, function () {
        next('img request timeout', null);
    });
}
/**
 * @alias 上传图片
 */
router.route('/img').post(function (req, res, next) {
    // 限制上传文件大小 500M
    if (req.headers['content-length'] > UPLOADLIMIT) {
        var returnInfo = {
            error:   -1,
            message: '上传文件过大，请上传小于 500M 的文件'
        };
        res.send(returnInfo);
    } else {
        var form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.multiples=true;//设置为多文件上传
        var imgFolder = __dirname + '/../public/images/' + api_extends.date_yyyymmdd();

        if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);

        form.uploadDir = imgFolder;
        form.parse(req, function (err, fields, files) {
            if (err) throw err;
            var image = files.imgFile;
            var path = image.path;
            path = path.replace('/\\/g', '/');

            res.status(200).send(path);
        });
    }
});

module.exports = router;
