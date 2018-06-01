var express = require('express'),
    url = require('url'),
    https = require('https'),
    http = require('http'),
    exec = require('child_process').exec,
    fs = require('fs'),
    cache = require('memory-cache'),
    formidable = require('formidable'),
    COS = require('cos-nodejs-sdk-v5'),
    tencentyun = require('tencentyun'),
    multer = require('multer'),
    resource = require('./../resource'),
    TencentYun = require('../scripts/Tencentyun/Tencentyun'),
    api_extends = require('./api_extends');
var async = require('async');
var router = express.Router();

// 上传文件最大限制 500M
var UPLOADLIMIT = 500 * 1024 * 1024;

var cos = new COS({
   AppId: '1256844084',
    SecretId: 'AKIDOfkdKpZC6nHYdU7ZppZ3HGzSgfOsq5pK',
    SecretKey: 'MTO4WjjV3MSJwKVSAetufBSTFo9HBrJW',
});
var tengxun_cos = {
    Bucket: 'uta-1256844084',
    Region: 'ap-chengdu',
};
var image_bucket = 'uta',
    video_bucket = 'video',
    projectId = '1256844084',
    secretId = 'AKIDOfkdKpZC6nHYdU7ZppZ3HGzSgfOsq5pK',
    secretKey = 'MTO4WjjV3MSJwKVSAetufBSTFo9HBrJW';
tencentyun.conf.setAppInfo(projectId, secretId, secretKey);

var regExpI = ['jpg','jpeg','png','gif'],
    regExpV = ['mp4','avi','flv','swf'];
// 图片上传
router.route('/:type/:name').post(function(req, res, next){
    var type = req.params.type,
        name = req.params.name;
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.multiples = true;//设置为多文件上传
    //
    // var imgFolder = __dirname + '/../public/images/' + name + '/' + api_extends.date_yyyymmdd();
    //
    // if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);
    //
    // form.uploadDir = imgFolder;
    form.parse(req, function (err, fields, files) {
        if (err) throw err;
        var image = files.imgFile;
        // 文件路径
        var filePath = __dirname + '/../public/images/'  + api_extends.date_yyyymmdd();
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
        var temp = image.name.split('.');
        var fileType = temp[temp.length - 1];
        if ((type === 'img' && regExpI.indexOf(fileType) > -1) || (type==='video' && regExpV.indexOf(fileType)>-1)) {
            var lastName = '.' + fileType;
            // 构建图片名
            var fileName = Date.now() + lastName;
            // 图片重命名
            fs.writeFile(filePath+'/'+fileName, files, (err) => {
                if (err) {
                    res.end(JSON.stringify({status:'102',msg:'文件写入失败'}));
                }else{
                    var localFile = __dirname + '/../public/images/' + api_extends.date_yyyymmdd() + '/' + fileName;
                    var key = fileName;

                    // 腾讯云 文件上传
                    var params = {
                        Bucket: tengxun_cos.Bucket,                         /* 必须 */
                        Region: tengxun_cos.Region,                         /* 必须 */
                        Key: key,                                           /* 必须 */
                        FilePath: localFile,                                /* 必须 */
                    };
                    // cos.sliceUploadFile(params, function(err, data) {
                    //     if(err) {
                    //         fs.unlinkSync(localFile);
                    //         res.end(JSON.stringify({errCode:'1001',message:JSON.stringify(err)}));
                    //     } else {
                    //         // fs.unlinkSync(localFile);
                    //         // var imageSrc = 'https://uta-1256844084.coscd.myqcloud.com/' + data.Key;
                    //         var imageSrc = localFile;
                    //         var dialogScript;
                    //         fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
                    //             if (stat && stat.isFile()) {
                    //                 dialogScript = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
                    //                 if (dialogScript[0][type].length) {
                    //                     var index = dialogScript[0][type].findIndex(function (item) {
                    //                         return item.text === name;
                    //                     });
                    //                     if (index > -1) {
                    //                         dialogScript[0][type][index].src.push(imageSrc);
                    //                         fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify( dialogScript ), function (err) {
                    //                             if (err) res.end(JSON.stringify({errCode:'1002',message: err}));
                    //                             else res.end(JSON.stringify({errCode:'0',message: dialogScript[0][type] }));
                    //                         });
                    //                     }
                    //                 }
                    //             }
                    //         });
                    //
                    //     }
                    // });
                    tencentyun.imagev2.upload(localFile, image_bucket, fileName, function (ret) {
                        if (ret.code === '0') {
                            var fileid = ret.data.fileid;
                            var expired = parseInt(Date.now() / 1000) + 60;
                            tencentyun.auth.getAppSignV2(image_bucket, fileid, expired);
                            var dialogScript;
                            fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
                                if (stat && stat.isFile()) {
                                    dialogScript = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
                                    if (dialogScript[0][type].length) {
                                        var index = dialogScript[0][type].findIndex(function (item) {
                                            return item.text === name;
                                        });
                                        if (index > -1) {
                                            dialogScript[0][type][index].src.push(ret.url);
                                            fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify(dialogScript), function (err) {
                                                if (err) res.end(JSON.stringify({errCode: '1002', message: err}));
                                                else res.end(JSON.stringify({
                                                    errCode: '0',
                                                    message: dialogScript[0][type]
                                                }));
                                            });
                                        }
                                    }
                                }
                            })
                        } else {
                            res.end(JSON.stringify({errCode:ret.code,message: ret.message}));
                        }
                    }, 0, null)
                }
            });

        } else {
            res.end(JSON.stringify({errCode:'1002',message:'文件格式不正确！'}));
        }
    });

    // // 文件路径
    // var filePath = './' + req.file.path;
    // 文件类型
    // var temp = req.file.originalname.split('.');
    // var fileType = temp[temp.length - 1];
    // var lastName = '.' + fileType;
    // // 构建图片名
    // var fileName = Date.now() + lastName;
    // // 图片重命名
    // fs.rename(filePath, fileName, (err) => {
    //     if (err) {
    //         res.end(JSON.stringify({status:'102',msg:'文件写入失败'}));
    //     }else{
    //         var localFile = './' + fileName;
    //         var key = fileName;
    //
    //         // 腾讯云 文件上传
    //         var params = {
    //             Bucket: tengxun_cos.Bucket,                         /* 必须 */
    //             Region: tengxun_cos.Region,                         /* 必须 */
    //             Key: key,                                           /* 必须 */
    //             FilePath: localFile,                                /* 必须 */
    //         }
    //         cos.sliceUploadFile(params, function(err, data) {
    //             if(err) {
    //                 fs.unlinkSync(localFile);
    //                 res.end(JSON.stringify({status:'101',msg:'上传失败',error:JSON.stringify(err)}));
    //             } else {
    //                 fs.unlinkSync(localFile);
    //                 var imageSrc = 'http://devimage-1***********4.cossh.myqcloud.com/' + data.Key;
    //                 res.end(JSON.stringify({status:'100',msg:'上传成功',imageUrl:imageSrc}));
    //             }
    //         });
    //     }
    // });
})

// /**
//  * 保存网络资源到本地
//  */
// function saveHttpResources(_res, _url, dir, next) {
//     var srcReg = /^(http|https):\/\//;
//     if (!srcReg.test(_url)) next('请求地址不合法', null);
//
//     var _http = /^https/.test(_url) ? https : http;
//
//     var extension = url.parse(_url).pathname.split('.').reverse()[0];
//     var interfaceReq = _http.get(_url, function (res) {
//         if (res.statusCode === 200) {
//             var chunks = [],
//                 length = 0;
//             res.on('data', function (chunk) {
//                 length += chunk.length;
//                 chunks.push(chunk);
//             });
//             res.on('end', function () {
//                 var buffer = new Buffer(length);
//
//                 for (var i = 0, pos = 0, size = chunks.length; i < size; i++) {
//                     chunks[i].copy(buffer, pos);
//                     pos += chunks[i].length;
//                 }
//
//                 var imgFolder = __dirname + '/../public/attached/' + api_extends.date_yyyymmdd();
//                 if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);
//
//                 var imageFileName = getRandomSalt() + '_' + new Date().getTime() + i + '.' + extension;
//                 var imageFile = imgFolder + '/' + imageFileName;
//
//                 fs.writeFileSync(imageFile, buffer);
//
//                 var key = dir + '_' + new Date().getTime();
//                 imageFile = imageFile.replace('/\\/g', '/');
//                 key += '.' + imageFile.split('.')[1] + 'jpg';
//
//                 TencentYun.uploadFile(key, imageFile, _res);
//             });
//         } else {
//             next('图片请求出错了!', null);
//         }
//     });
//     interfaceReq.on('error', function (e) {
//         next('图片请求出错了:' + e.message, null)
//     });
//     // 最长超时 5s
//     interfaceReq.setTimeout(5000, function () {
//         next('img request timeout', null);
//     });
// }
// /**
//  * @alias 上传图片
//  */
// router.route('/img/:name').post(function (req, res, next) {
//     var name = encodeURI(req.params.name);
//     // 限制上传文件大小 500M
//     if (req.headers['content-length'] > UPLOADLIMIT) {
//         var returnInfo = {
//             error: -1,
//             message: '上传文件过大，请上传小于 500M 的文件'
//         };
//         res.send(returnInfo);
//     } else {
//         var form = new formidable.IncomingForm();
//         form.keepExtensions = true;
//         form.multiples = true;//设置为多文件上传
//         var imgFolder = __dirname + '/../public/images/' + name + '/' + api_extends.date_yyyymmdd();
//
//         if (!fs.existsSync(imgFolder)) fs.mkdirSync(imgFolder);
//
//         form.uploadDir = imgFolder;
//         form.parse(req, function (err, fields, files) {
//             if (err) throw err;
//             var image = files.imgFile;
//             var path = image.path;
//             path = path.replace('/\\/g', '/');
//
//             res.status(200).send(path);
//         });
//     }
// });

module.exports = router;
