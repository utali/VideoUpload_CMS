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
    var name = encodeURI(req.body);
    cache.put(''+name, []);
    res.status(200).send(JSON.stringify({
        errCode: '0',
        message: 'ok'
    }));
});

module.exports = router;
