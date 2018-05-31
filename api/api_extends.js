var fs = require('fs'),
    http = require('http'),
    resource = require('../resource');
var interfaceHost = resource.INTERFACEHOST, interfacePort = resource.INTERFACEPORT;

exports.sendInterface = function (method, path, post_data, sign, res, next) {
    headers = {};
    if (post_data) {
        headers['Content-Type'] = 'application-json';
        headers['Content-Length'] = Buffer.byteLength(post_data);
    }
    if (sign) {
        headers.sign = sign + Date.parse(new Date()) / 1000;
    }
    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: path,
        method: method,
        headers: headers
    };

    var interfaceReq = http.request(options, function (interfaceRes) {
        console.log('STATUS: ' + interfaceRes.statusCode);
        console.log('HEADERS: ' + JSON.stringify(interfaceRes.headers));
        interfaceRes.setEncoding('utf8');

        if (interfaceRes.statusCode == 200) {
            var chunks = "";
            interfaceRes.on('data', function (chunk) {
                chunks += chunk;
            });
            interfaceRes.on('end', function () {
                next(null, chunks);
            });
        } else {
            next('err');
        }
    });
    console.log(post_data);
    if (post_data)
        interfaceReq.write(post_data);
    interfaceReq.end();
};

exports.generate = function (workgroupList, generateBaseFolder, next) {
    errPath = [];
    workgroupList.forEach(function (workgroupData) {
        /**workgroupPath = generateBaseFolder + '/' + workgroupData.path;
         if (!fs.existsSync(workgroupPath)) {
			fs.mkdirSync(workgroupPath);
			if (!fs.existsSync(workgroupPath)) {
				errPath.push(workgroupData.path);
			} else {
				console.log(workgroupPath + 'PATH创建成功！');
			}
		}*/

        subMenus = workgroupData.subMenus;
        subMenus.forEach(function (menu) {
            if (menu.path) {
                var realPath = generateBaseFolder,
                    operationPathList = menu.path.split('-');
                operationPathList.forEach(function (operationPath) {
                    realPath += '/' + operationPath;
                    if (!fs.existsSync(realPath)) {
                        fs.mkdirSync(realPath);
                        if (!fs.existsSync(realPath)) {
                            errPath.push(workgroupData.path);
                        } else {
                            menuPath = realPath;

                            ctrlFile = menuPath + '/ctrl.js';
                            indexFile = menuPath + '/index.html';
                            if (!fs.existsSync(ctrlFile)) {

                                var ctrlContent = "'use strict';\n\n";
                                ctrlContent += "define(['rapid', 'jquery', 'angular', 'moment', 'datepicker'],\n";
                                ctrlContent += "function (rapid, $, angular, moment, datepicker) {\n";
                                ctrlContent += "var modName = 'ctrl-" + menu.path + "';\n";
                                ctrlContent += "rapid.register.controller(modName, function ($scope, $state, $rootScope, $http, dialogs, forms, principal) {\n";
                                ctrlContent += "});\n";
                                ctrlContent += "});";
                                fs.writeFileSync(ctrlFile, ctrlContent);
                            }
                            if (!fs.existsSync(indexFile)) {
                                var htmlContent = '<div class="module-header">\n';
                                htmlContent += '</div>\n';
                                htmlContent += '<div class="module-content">\n';
                                htmlContent += '</div>\n';
                                fs.writeFileSync(indexFile, htmlContent);
                            }
                            if (!fs.existsSync(menuPath)) {
                                errPath.push(menu.path);
                            } else {
                                console.log(menuPath + ' PATH创建成功！');
                            }

                        }
                    }
                });
            }
        });
    });
    next(errPath);
};
exports.options = options;
exports.options_http = options_http;


function options(interfaceHost, interfacePort, path, method, post_data, sign, header){
    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: path,
        method: method,
        key: fs.readFileSync('./certs/develop/cms_client_key.pem'),
        cert: fs.readFileSync('./certs/develop/cms_client_crt.pem'),
        ca: fs.readFileSync('./certs/develop/cms_ca_crt.pem'),
        requestCert: true,
        rejectUnauthorized: false
    };
    header = header || {};

    if (method=='POST' || method == 'PUT' || method == 'DELETE') {
        options['headers'] = {
            "Content-Type": 'application/json',
            "Content-Length": Buffer.byteLength(post_data),
            sign: sign + Date.parse(new Date()) / 1000
        }
    } else if (method=='GET') {
        options['headers'] = {
            sign: sign + Date.parse(new Date()) / 1000
        }
    }
    options['headers'] = Object.assign({}, options['headers'], header);

    return options;
}

function options_http(interfaceHost, interfacePort, path, method, post_data, sign, header){
    var options = {
        host: interfaceHost,
        port: interfacePort,
        path: path,
        method: method
    };
    header = header || {};

    if (method=='POST' || method == 'PUT' || method == 'DELETE') {
        options['headers'] = {
            "Content-Type": 'application/json',
            "Content-Length": Buffer.byteLength(post_data),
            sign: sign + Date.parse(new Date()) / 1000
        }
    } else if (method=='GET') {
        options['headers'] = {
            sign: sign + Date.parse(new Date()) / 1000
        }
    }
    options['headers'] = Object.assign({}, options['headers'], header);

    return options;
}
exports.date_yyyymmdd = function () {
    var D = new Date();
    year = D.getFullYear();
    month = (D.getMonth() + 1).toString();
    if (month.length == 1) month = '0' + month;
    day = D.getDate().toString();
    if (day.length == 1) day = '0' + day;

    return year + month + day;
};