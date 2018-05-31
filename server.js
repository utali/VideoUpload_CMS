var
    express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    router = express.Router(),
    // auth_apiRouter = require('./api/auth_api'),
    fs = require('fs'),
    server = express();
var upload_apuRouter = require('./api/upload_api');

server.use(bodyParser.json({limit: '500mb'}));
server.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, sign');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('X-Powered-By', 'iBeaconCS');

    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        /**ip = req.headers['x-forwarded-for'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;
         ip = ip.indexOf('::ffff:')>-1?ip.split('::ffff:')[1]:ip;
         console.log('remote ip='+ip);
         if (white_lit.indexOf(ip) == -1) {
			res.status(200).send({resultCode: 99888, resultMsg: '访问客户端不在白名单范围内！'});
		} else {
			next();
		}*/
        next();
    }
});
server
    .use(express.static('./'))
    .use(function (req, res, next) {
        var logData = {
            time: new Date(),
            spdy: req.spdyVersion,
            path: req.path,
            headers: req.headers,
            method: req.method,
            params: req.params,
            body: req.body,
            remote: req.connection.remoteAddress,
            status: res.statusCode
        }


        var strLogData = JSON.stringify(logData);
        console.log('**************************************************');
        console.log('LOG : ' + strLogData);
        console.log('**************************************************');
        next();
    })
    // .use('/auth/api', auth_apiRouter) //身份认证接口
    .use('/upload', upload_apuRouter);

server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var port = process.argv[2] || 8038;
http.createServer(server).listen(port, function () {
    console.log('CMS Cloud Server is listening on port : ' + port);
});
