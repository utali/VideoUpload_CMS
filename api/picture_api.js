/**
 * Created by liqiaoqiao on 2018/5/31.
 */
var express = require('express'),
    url = require('url'),
    https = require('https'),
    http = require('http'),
    fs = require('fs'),
    resource = require('./../resource'),
    api_extends = require('./api_extends');
var async = require('async');
var router = express.Router();

/**
 * @alias 新建相册
 */
router.route('/set/:type').put(function (req, res, next) {
    var name = req.body.name,
        type = req.params.type;
    var pictures;
    fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
        if (stat && stat.isFile()) {
            pictures = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
            if (pictures[0][type].length) {
                var index = pictures[0][type].findIndex(function (item) {
                    return item.text === name;
                });
                if (index > -1) {
                    res.end(JSON.stringify({errCode:'1002',message: '该'+type+'已经存在！'}));
                } else {
                    pictures[0][type].push({
                        text: name,
                        src: []
                    });
                    fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify( pictures ), function (err) {
                        if (err) res.end(JSON.stringify({errCode:'1002',message: err}));
                        else res.end(JSON.stringify({errCode:'0',message: pictures[0][type] }));
                    });
                }
            } else {
                pictures[0][type].push({
                    text: name,
                    src: []
                });
                fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify( pictures ), function (err) {
                    if (err) res.end(JSON.stringify({errCode:'1002',message: err}));
                    else res.end(JSON.stringify({errCode:'0',message: pictures[0][type] }));
                });
            }
        }
    });
});
/**
 * @alias 获取相册
 */
router.route('/get/:type').get(function (req, res, next) {
    var type = req.params.type;
    fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
        if (stat && stat.isFile()) {
            var pictures = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
            res.status(200).send({
                errCode: '0',
                message: pictures[0][type]
            });
        } else {
            res.status(200).send({
                errCode: '1002',
                message: '数据出错！'
            });
        }
    });
});
/**
 * @alias 删除相册
 */
router.route('/delete/:type').put(function (req, res, next) {
    var type = req.params.type;
    var index = req.body.index;
    var result;
    fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
        if (stat && stat.isFile()) {
            result = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
            if (index > -1) {
                result[0][type].splice(index, 1);
                fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify( result ), function (err) {
                    if (err) res.end(JSON.stringify({errCode:'1002',message: err}));
                    else res.end(JSON.stringify({errCode:'0',message: result[0][type] }));
                });
            }
        }
    });
});
/**
 * @alias 删除图片
 */
router.route('/delete/:type').post(function (req, res, next) {
    var type = req.params.type;
    var index = req.body.index,
        idx = req.body.idx;
    var result;
    fs.stat(__dirname + '/../public/dialogScript.txt', function (err, stat) {
        if (stat && stat.isFile()) {
            result = JSON.parse(fs.readFileSync(__dirname + '/../public/dialogScript.txt'));
            if (index > -1) {
                if (idx >-1) {
                    result[0][type][idx].src.splice(index, 1);
                    fs.writeFile(__dirname + '/../public/dialogScript.txt', JSON.stringify( result ), function (err) {
                        if (err) res.end(JSON.stringify({errCode:'1002',message: err}));
                        else res.end(JSON.stringify({errCode:'0',message: result[0][type] }));
                    });
                }
            }
        }
    });
});
module.exports = router;
