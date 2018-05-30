var
    express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    router = express.Router(),
    auth_apiRouter = require('./api/auth_api'),
    fs = require('fs'),
    server = express();

var
    datKey = fs.readFileSync('certs/develop/cms_key.pem'),
    datCert = fs.readFileSync('certs/develop/cms_cert.pem'),
    options = {
        key: datKey,
        cert: datCert
    };

optionsSpdy = {
    key: datKey,
    certs: datCert,
    spdy: {
        protocols: ['h2', 'spdy/3.1', 'http/1.1'],
        plain: false,
        connection: {
            windowSize: 1024 * 1024,
            autoSpdy31: true
        }
    }
};
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
    .use('/auth/api', auth_apiRouter)//身份认证接口

server.get('/demo', function (req, res) {
    res.sendFile(path.join(__dirname + '/demo.html'));
});

server.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var port = process.argv[2] || 8038;
http.createServer(server).listen(port, function () {
    console.log('CMS Cloud Server is listening on port : ' + port);
});
