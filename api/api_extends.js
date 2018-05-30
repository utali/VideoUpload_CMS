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
