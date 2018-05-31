var express = require('express'),
    bodyParser = require('body-parser'),
    https = require('https'),
    router = express.Router(),
    fs = require('fs'),
    api_extends = require('./api_extends'),
    resource = require('./../resource'),
    debug = false;
var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT;
var cacheObject = {};

/**
 * @添加相关新闻
 */
router.route('/add').post(function (req, res, next) {
    var data = req.body,
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({
        PNewsId: data.PNewsId,//新闻物理ID 字符 必录项
        newsId: data.newsId,//新闻逻辑ID 字符 必录项
        relatedType: data.relatedType,//相关新闻类型 字符 必录项 编码为：relatedType 1--单挑相关新闻 2--多条相关新闻 3--单条图文
        relatedNewsContent: data.relatedNewsContent//相关新闻内容 json 必录
        //单条相关新闻：[
        //             {
        //              PNewsId: '',//相关新闻物理ID 字符 必录
        //              title:'',//相关新闻标题 字符 必录 为空串时表示标题没变化
        //              abs:'',//相关新闻摘要 字符 必录 为空串时表示摘要没变化
        //            }
        //            ]

        //多条相关新闻：[
        //              {
        //                  PNewsId: '',//相关新闻物理ID 字符 必录
        //                  title:'',//相关新闻标题 字符 必录 为空串时表示标题没变化        //
        //              },
        //              {
        //                  PNewsId: '',//相关新闻物理ID 字符 必录
        //                  title:'',//相关新闻标题 字符 必录 为空串时表示标题没变化        //
        //              }
        //            ]

        //单条图片：{
        //              newsId: '',//相关新闻图片对应的新闻逻辑ID 字符
        //              link:'',//相关新闻图片链接 字符 和PNewsId二选一
        //              image:[''],//相关新闻图片 数组 图片集合 必录
        //         }
    });

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/relatedNews',
        method: 'POST',
        key: fs.readFileSync('./certs/develop/cms_key.pem'),
        cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
        requestCert: true,
        rejectUnauthorized: false,
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": Buffer.byteLength(post_data),
            sign: sign + Date.parse(new Date()) / 1000
        }
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
                    res.status(200).send(JSON.parse(chunks));
                    //返回数据结构：
                    /**{
			            errCode: 0,
			            message:{
					        _id: '11111111111111111111111' //相关新闻的ID
					        PNewsId: data.PNewsId,//新闻物理ID 字符 必录项
                            newsId: data.newsId,//新闻逻辑ID 字符 必录项
                            relatedType: data.relatedType,//相关新闻类型 字符 必录项 编码为：relatedType 1--单挑相关新闻 2--多条相关新闻 3--单条图文
                            relatedNewsContent：{}
			            }
			        }*/
                } catch (err) {
                    console.log('err=' + err);
                }
            });
        } else {
            next();
        }
    });
    interfaceReq.write(post_data);
    interfaceReq.end();
});

/**
 * @修改相关新闻信息
 */
router.route('/modify').put(function (req, res, next) {
    var data = req.body,
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({
        PNewsId: data.PNewsId,//相关新闻的物理ID 字符 必录项
        newsId: data.newsId,//相关新闻的逻辑ID 字符 必录项
        relatedType: data.relatedType,//相关新闻类型 字符 必录项 编码为：relatedType 1--单挑相关新闻 2--多条相关新闻 3--单条图文
        relatedNewsContent: data.relatedNewsContent//相关新闻内容 json 必录
        //单条相关新闻：[
        //              {
        //                  PNewsId: '',//相关新闻物理ID 字符 必录
        //                  title:'',//相关新闻标题 字符 必录 为空串时表示标题没变化
        //                  abs:'',//相关新闻摘要 字符 必录 为空串时表示摘要没变化
        //              }
        //            ]

        //多条相关新闻：[
        //              {
        //                  PNewsId: '',//相关新闻物理ID 字符 必录
        //                  title:'',//相关新闻标题 字符 必录 为空串时表示标题没变化
        //              }
        //            ]

        //单条图片：{
        //              PNewsId: '',//相关新闻图片对应的新闻物理ID 字符
        //              link:'',//相关新闻图片链接 字符 和PNewsId二选一
        //              image:[''],//相关新闻图片 数组 图片集合 必录
        //         }
    });

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/relatedNews',
        method: 'PUT',
        key: fs.readFileSync('./certs/develop/cms_key.pem'),
        cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
        requestCert: true,
        rejectUnauthorized: false,
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": Buffer.byteLength(post_data),
            sign: sign + Date.parse(new Date()) / 1000
        }
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
                    res.status(200).send(JSON.parse(chunks));
                    //返回数据结构：
                    /**{
			            errCode: 0,
			            message:{
					        _id: '11111111111111111111111' //相关新闻的ID
					        PNewsId: data.PNewsId,//新闻物理ID 字符 必录项
                            newsId: data.newsId,//新闻逻辑ID 字符 必录项
                            relatedType: data.relatedType,//相关新闻类型 字符 必录项 编码为：relatedType 1--单挑相关新闻 2--多条相关新闻 3--单条图文
                            relatedNewsContent：{}
			            }
			        }*/
                } catch (err) {
                    console.log('err=' + err);
                }
            });
        } else {
            next();
        }
    });
    interfaceReq.write(post_data);
    interfaceReq.end();
});

/**
 * @alias 删除相关新闻
 */
router.route('/delete/:relatedNewsId').delete(function (req, res, next) {
    var data = req.body,
        relatedNewsId = req.params.relatedNewsId,//相关新闻ID
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({});

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/relatedNews/' + relatedNewsId,
        method: 'DELETE',
        key: fs.readFileSync('./certs/develop/cms_key.pem'),
        cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
        requestCert: true,
        rejectUnauthorized: false,
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": Buffer.byteLength(post_data),
            sign: sign + Date.parse(new Date()) / 1000
        }
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
                    res.status(200).send(JSON.parse(chunks));
                    //返回数据结构：
                    /**{
			            errCode: 0,
			            message:{
					        relatedNewsId: '11111111111111111111111' //相关新闻ID
			            }
			        }*/
                } catch (err) {
                    console.log('err=' + err);
                }
            });
        } else {
            next();
        }
    });
    interfaceReq.write(post_data);
    interfaceReq.end();
});

/**
 * @alias 根据新闻物理主键获取相关新闻列表，按照时间倒序排序
 */
router.route('/:PNewsId/:relatedType/:lastRelatedNewsId/:pageSize/batch').get(function (req, res, next) {
    var PNewsId = req.params.PNewsId,//新闻物理主键 字符 必录
        relatedType = req.params.relatedType,//相关新闻类型 字符 必录 不能传a
        lastRelatedNewsId = req.params.lastRelatedNewsId,//上一组新闻中最后一个相关新闻ID，置入0表示从头开始
        pageSize = req.params.pageSize,//一次获取的新闻数量
        sign = req.headers['sign'];//登录凭据

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/relatedNews/' + PNewsId + ',' + relatedType + ',' + lastRelatedNewsId + ',' + pageSize + '/batch',
        method: 'GET',
        key: fs.readFileSync('./certs/develop/cms_key.pem'),
        cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
        requestCert: true,
        rejectUnauthorized: false,
        headers: {
            sign: sign + Date.parse(new Date()) / 1000
        }
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
                    res.status(200).send(JSON.parse(chunks));
                    //返回数据结构：
                    /**{
			            errCode: 0,
			            message:{
			                uid: uid, //用户ID
			                count: 10,//所有有效的工作组集合数量
							relatedNewsList://返回数据集合
							[
								{
									_id: '11111111111111111111111' //新闻的ID
					                PNewsId: data.PNewsId,//新闻物理ID 字符 必录项
                                    newsId: data.newsId,//新闻逻辑ID 字符 必录项
                                    relatedType: data.relatedType,//相关新闻类型 字符 必录项 编码为：relatedType 1--单挑相关新闻 2--多条相关新闻 3--单条图文
                                    relatedNewsContent：{}
			                    },{
								...
			                    }
			                ]
			            }
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
 * @alias 获取新闻信息
 */
router.route('/:relatedNewsId').get(function (req, res, next) {
    var relatedNewsId = req.params.relatedNewsId,//新闻id
        sign = req.headers['sign'];//登录凭据;//工作组ID

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/relatedNews/' + relatedNewsId,
        method: 'GET',
        key: fs.readFileSync('./certs/develop/cms_key.pem'),
        cert: fs.readFileSync('./certs/develop/cms_cert.pem'),
        requestCert: true,
        rejectUnauthorized: false,
        headers: {
            sign: sign + Date.parse(new Date()) / 1000
        }
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
                    res.status(200).send(JSON.parse(chunks));
                    //返回数据结构：
                    /**{
						errCode: 0,
			            message:
			            {
					        "_id":"55caa7ffb9046ad902000010",//新闻id
							"abs":"10日的主要内容有：国际泳联世锦赛上，中国队获得女子四乘一百米混合泳接力冠军……",//新闻摘要
							"dateline":"2015-08-12T09:57:19.000Z",//发布时间
							"imgs":["http://pic.4g.enorth.com.cn/007/000/359/00700035970_dfaef554.jpg"],//列表图
							"listtype":"img",//列表类型
							"prop":"video",//新闻类型
							"title":"8月10日《都市报道》视频回放",//新闻标题
							"channelId":"55c997b76d14386506000002",//频道id
							"issueStatus":"1",//签发状态 0--未签发 1--已签发
							"recommend": "0",//是否推荐 0--不推荐 1--推荐
							"creatorId":"5596159630cabc1896cc0809",//创建者ID
							"creatorName":"超级管理员sup",//创建者姓名
							"updated_at":"2015-08-12T09:57:19.000Z"//更新日期
			            }
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
