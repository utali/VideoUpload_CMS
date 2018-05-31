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
 * @添加组版新闻
 */
router.route('/add').post(function (req, res, next) {
    var data = req.body,
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({
        groupEditionList: data.groupEditionList
            /**[
            {
                PNewsId: data.PNewsId,//新闻物理ID 字符 必录项
                newsId: data.newsId,//新闻逻辑ID 字符 必录项
                editionTitle: data.editionTitle,//版面title 必录项
                groupEditionType: data.groupEditionType//版面类型 1--首页轮显 2--首页列表 必录项
            },
            {}
        ]*/
    });

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/groupEdition',
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
					        _id: '11111111111111111111111' //新闻的ID
					        PNewsId: data.PNewsId,//新闻物理ID
                            newsId: data.newsId,//新闻逻辑ID
                            editionTitle: data.editionTitle,//版面title
                            groupEditionType: data.groupEditionType//版面类型 1--首页轮显 2--首页列表
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
 * @修改组版新闻信息
 */
router.route('/modify/:groupEditionId').put(function (req, res, next) {
    var data = req.body,
        groupEditionId = req.params.groupEditionId,//组版新闻ID
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({
        PNewsId: data.PNewsId,//新闻物理ID 字符 必录项
        newsId: data.newsId,//新闻逻辑ID 字符 必录项
        editionTitle: data.editionTitle,//版面title 必录项
        groupEditionType: data.groupEditionType//版面类型 1--首页轮显 2--首页列表 必录项
    });

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/groupEdition/' + groupEditionId,
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
					        _id: '11111111111111111111111' //新闻的ID
					        PNewsId: data.PNewsId,//新闻物理ID
                            newsId: data.newsId,//新闻逻辑ID
                            editionTitle: data.editionTitle,//版面title
                            groupEditionType: data.groupEditionType//版面类型 1--首页轮显 2--首页列表
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
 * @组版新闻排序
 */
router.route('/order').put(function (req, res, next) {
    var data = req.body,
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({
        groupEditionType: data.groupEditionType,//组版类型 1--首页轮显 2--首页列表 必录
        groupEditionIds: data.groupEditionIds//组版新闻id数组 按显示的先后顺序排序 必录
        //形式为：data.groupEditionIds = ['','','','',''];

    });

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/groupEdition/order',
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
					        _id: '11111111111111111111111' //新闻的ID
					        PNewsId: data.PNewsId,//新闻物理ID
                            newsId: data.newsId,//新闻逻辑ID
                            editionTitle: data.editionTitle,//版面title
                            groupEditionType: data.groupEditionType//版面类型 1--首页轮显 2--首页列表
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
 * @alias 删除组版新闻
 */
router.route('/delete').put(function (req, res, next) {
    var data = req.body,
        sign = req.headers['sign'];//登录凭据;
    var post_data = JSON.stringify({
        groupEditionIds: data.groupEditionIds //相关新闻Id数组
    });

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/groupEdition/delete',
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
			            message:{}
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
 * @alias 根据组版新闻类型获取组版新闻，按照时间倒序排序
 */
router.route('/:groupEditionType/:lastGroupEditionId/:pageSize/batch').get(function (req, res, next) {
    var groupEditionType = req.params.groupEditionType,//组版新闻类型 1--首页轮显 2--首页列表
        lastGroupEditionId = req.params.lastGroupEditionId,//上一组组版新闻中最后一个新闻ID，置入0表示从头开始
        pageSize = req.params.pageSize,//一次获取的新闻数量
        sign = req.headers['sign'];//登录凭据

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/groupEdition/' + groupEditionType + ',' + lastGroupEditionId + ',' + pageSize + '/batch',
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
									_id: '11111111111111111111111' //组版新闻ID
					                PNewsId: data.PNewsId,//新闻物理ID
                                    newsId: data.newsId,//新闻逻辑ID
                                    editionTitle: data.editionTitle,//版面title
                                    groupEditionType: data.groupEditionType//版面类型 1--首页轮显 2--首页列表
                                    roundImgs:[''],//轮显图id
                                    dateLine: 签发日期
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
 * @alias 获取组版新闻信息
 */
router.route('/:groupEditionId').get(function (req, res, next) {
    var groupEditionId = req.params.groupEditionId,//组版新闻id
        sign = req.headers['sign'];//登录凭据;//工作组ID

    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: '/groupEdition/' + groupEditionId,
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
					        "_id":"55caa7ffb9046ad902000010",//组版新闻id
							PNewsId: data.PNewsId,//新闻物理ID
                            newsId: data.newsId,//新闻逻辑ID
                            editionTitle: data.editionTitle,//版面title 可修改
                            groupEditionType: data.groupEditionType//版面类型 1--首页轮显 2--首页列表
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
