/**
 * Created by liqiaoqiao on 2018/5/31.
 */
var express = require('express'),
    url = require('url'),
    https = require('https'),
    http = require('http'),
    exec = require('child_process').exec,
    fs = require('fs'),
    cache = require('memory-cache'),
    formidable = require('formidable'),
    resource = require('./../resource'),
    api_extends = require('./api_extends');
var async = require('async');
var router = express.Router();

/**
 * @alias 新建相册
 */
router.route('/set/pictures').put(function (req, res, next) {
    var name = encodeURI(req.body.name);
    var pictures = cache.get('pictures');
    if (pictures !== null) {
        var index = pictures.findIndex(function (item) {
            return item.text === name;
        });
        if (index > -1 ) {
            res.status(200).send({
                errCode: '1002',
                message: '该相册已经存在！'
            });
            return;
        }
        cache.put('pictures', pictures.push({img: [], text: name}));
        res.status(200).send({
            errCode: '0',
            message: cache.get('pictures')
        });
    } else {
        cache.put('pictures', [{img: ['../images/yeoman.png'], text: name}]);
        res.status(200).send({
            errCode: '0',
            message: cache.get('pictures')
        });
    }
});
/**
 * @alias 获取相册
 */
router.route('/get/pictures').get(function (req, res, next) {
    res.status(200).send({
        errCode: '0',
        message: cache.get('pictures')||[]
    });
});
/**
 * @alias 删除相册
 */
router.route('/delete/pictures').put(function (req, res, next) {
    var index = req.body;
    var result = cache.get('pictures');
    // var index = result.findIndex(function (item) {
    //     return item.text === name;
    // });
    if (index > -1) {
        result.splice(index, 1);
        cache.get('pictures', result);
        res.status(200).send({
            errCode: '0',
            message: result
        });
    } else {
        res.status(200).send({
            errCode: '1001',
            message: '数据出现错误!'
        });
    }
});

module.exports = router;
