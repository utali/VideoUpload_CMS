var express = require('express'),
    url = require('url'),
    https = require('https'),
    http = require('http'),
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
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
   AppId: '**',
    SecretId: '***',
    SecretKey: '***',
});
var tengxun_cos = {
    Bucket: 'uta-1256844084',
    Region: 'ap-chengdu',
};
var image_bucket = 'uta',
    video_bucket = 'video',
    projectId = '***',
    secretId = '****',
    secretKey = '***';
tencentyun.conf.setAppInfo(projectId, secretId, secretKey);

// 图片上传
router.route('/:type/:name').post(function(req, res, next){
    var type = req.params.type,
        name = req.params.name;
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.multiples = true;//设置为多文件上传
    form.maxFieldsSize = 10*1024*1024;

    form.parse(req, function (err, fields, file) {
        if (err) {
            res.end(JSON.stringify({errCode: '1001',message:err}));
        }
        var filePath = '';
        //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。
        if(file.imgFile){
            filePath = file.imgFile.path;
        } else {
            for(var key in file){
                if( file[key].path && filePath==='' ){
                    filePath = file[key].path;
                    break;
                }
            }
        }
        //文件移动的目录文件夹，不存在时创建目标文件夹
        var targetDir = path.join(__dirname, '../public/'+ type + '/'+api_extends.date_yyyymmdd());
        if (!fs.existsSync(targetDir)) {
            fs.mkdir(targetDir);
        }
        var fileExt = filePath.substring(filePath.lastIndexOf('.')).slice(1);
        //判断文件类型是否允许上传
        var regExp = ['jpg','jpeg','png','gif'];
        if (regExp.indexOf(fileExt.toLowerCase()) === -1) {
            res.end(JSON.stringify({errCode:-1, message:'此文件类型不允许上传'}));
        } else {
            //以当前时间戳对上传文件进行重命名
            var fileName = new Date().getTime() + '.'+fileExt;
            var targetFile = path.join(targetDir, fileName);
            //移动文件
            fs.rename(filePath, targetFile, function (err) {
                if (err) {
                    res.json({errCode:-1, message:'操作失败'});
                } else {
                    //上传成功，返回文件的相对路径
                    var fileUrl = '/public/'+ type + '/'+api_extends.date_yyyymmdd()+ '/' + fileName;
                    var dialogScript;
                    fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
                        if (stat && stat.isFile()) {
                            dialogScript = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
                            if (dialogScript[0][type].length) {
                                var index = dialogScript[0][type].findIndex(function (item) {
                                    return item.text === name;
                                });
                                if (index > -1) {
                                    dialogScript[0][type][index].src.push(fileUrl);
                                    fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify(dialogScript), function (err) {
                                        if (err) res.end(JSON.stringify({errCode: '1002', message: err}));
                                        else res.end(JSON.stringify({
                                            errCode: '0',
                                            message: dialogScript[0][type],
                                            item: fileUrl
                                        }));
                                    });
                                }
                            }
                        }
                    })
                    // var key = fileName;

                    // // 腾讯云 文件上传
                    // var params = {
                    //     Bucket: tengxun_cos.Bucket,                         /* 必须 */
                    //     Region: tengxun_cos.Region,                         /* 必须 */
                    //     Key: key,                                           /* 必须 */
                    //     FilePath: fileUrl,                                /* 必须 */
                    // };
                    // cos.sliceUploadFile(params, function(err, data) {
                    //     if(err) {
                    //         fs.unlinkSync(fileUrl);
                    //         res.end(JSON.stringify({errCode:'1001',message:JSON.stringify(err)}));
                    //     } else {
                    //         // fs.unlinkSync(localFile);
                    //         // var imageSrc = 'https://uta-1256844084.coscd.myqcloud.com/' + data.Key;
                    //         // var imageSrc = tencentyun.imagev2.generateResUrlV2(image_bucket, 0, key);
                    //         // var imageSrc = localFile;
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
                    // tencentyun.imagev2.upload(fileUrl, image_bucket, '', function (ret) {
                    //     if (ret.code === '0') {
                    //         var dialogScript;
                    //         fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
                    //             if (stat && stat.isFile()) {
                    //                 dialogScript = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
                    //                 if (dialogScript[0][type].length) {
                    //                     var index = dialogScript[0][type].findIndex(function (item) {
                    //                         return item.text === name;
                    //                     });
                    //                     if (index > -1) {
                    //                         dialogScript[0][type][index].src.push(ret.url);
                    //                         fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify(dialogScript), function (err) {
                    //                             if (err) res.end(JSON.stringify({errCode: '1002', message: err}));
                    //                             else res.end(JSON.stringify({
                    //                                 errCode: '0',
                    //                                 message: dialogScript[0][type]
                    //                             }));
                    //                         });
                    //                     }
                    //                 }
                    //             }
                    //         })
                    //     } else {
                    //         res.end(JSON.stringify({errCode:ret.code,message: ret.message}));
                    //     }
                    // }, 0, null);
                }
            });
        }
    });
});
//视频上传
router.route('/video').post(function(req, res, next){
    var type = 'video',
        text = '新增视频';
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.multiples = true;//设置为多文件上传
    form.maxFieldsSize = 1024*1024*1024;

    form.parse(req, function (err, fields, file) {
        if (err) {
            res.end(JSON.stringify({errCode: '1001',message: err.message}));
        }
        var filePath = '';
        //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。
        if(file.videoFile){
            filePath = file.videoFile.path;
        } else {
            for(var key in file){
                if( file[key].path && filePath==='' ){
                    filePath = file[key].path;
                    break;
                }
            }
        }
        //文件移动的目录文件夹，不存在时创建目标文件夹
        var targetDir = path.join(__dirname, '../public/'+ type + '/'+api_extends.date_yyyymmdd());
        if (!fs.existsSync(targetDir)) {
            fs.mkdir(targetDir);
        }
        var fileExt = filePath.substring(filePath.lastIndexOf('.')).slice(1);
        //判断文件类型是否允许上传
        var regExp = ['mp4','avi','flv','swf'];
        if (regExp.indexOf(fileExt.toLowerCase()) === -1) {
            res.end(JSON.stringify({errCode:-1, message:'此文件类型不允许上传'}));
        } else {
            //以当前时间戳对上传文件进行重命名
            var fileName = new Date().getTime() + '.'+fileExt;
            var targetFile = path.join(targetDir, fileName);
            //移动文件
            fs.rename(filePath, targetFile, function (err) {
                if (err) {
                    res.json({errCode:-1, message:'操作失败'});
                } else {
                    //上传成功，返回文件的相对路径
                    var fileUrl = '/public/'+ type + '/'+api_extends.date_yyyymmdd()+ '/' + fileName;
                    var dialogScript;
                    fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
                        if (stat && stat.isFile()) {
                            dialogScript = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
                            if (dialogScript[0][type].length) {
                                dialogScript[0][type].push({text: text,src: fileUrl});
                                fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify(dialogScript), function (err) {
                                    if (err) res.end(JSON.stringify({errCode: '1002', message: err}));
                                    else res.end(JSON.stringify({
                                        errCode: '0',
                                        message: dialogScript[0][type],
                                    }));
                                });
                            }
                        }
                    })
                }
            });
        }
    });
})

module.exports = router;
