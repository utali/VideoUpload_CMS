# qcloud_video-node
nodejs sdk for [腾讯云微视频服务]

## 安装
npm install qcloud_video
或者
下载源码后将qcloud_video放到项目的node_modules目录中

## 指定您的配置
修改conf.js中的配置信息或者如下设置
```javascript
qcloud_video.conf.setAppInfo('000000', 'xxxxxxxx', 'xxxxxxx');
```

## 程序示例
```javascript
var qcloud = require('qcloud_video');

qcloud.conf.setAppInfo('100000', 'AKIDoooooooooooooooooooooooooooooooo', 'ROllllllllllllllllllllllllllllll');

/*
* 各接口的callback 为单个参数的function： function(ret){}
* ret 为 {'httpcode':200,'code':0,'message':'ok','data':{}} 的对象，其中data的内容依接口有所不同
*/
//上传视频
qcloud.video.upload('/tmp/test.mp4', 'bucket', '/1.mp4', function(ret){
    if (ret.code != 0) {
        console.log(ret);
    }else{
        // 查询视频
        qcloud.video.statFile('bucket', '/1.mp4', function(ret) {
            console.log(ret);
        });
        // 删除视频
        qcloud.video.deleteFile('bucket', '/1.mp4', function(ret) {
            console.log(ret);
        });
    }
});

//创建目录
qcloud.video.createFolder('bucket', '/firstDir/');

//获取指定目录下视频列表
qcloud.video.list('bucket', '/firstDir/', 20, 'eListFileOnly');

//获取bucket下视频列表
qcloud.video.list('bucket', '/', 20, 'eListFileOnly');

//获取指定目录下以'abc'开头的视频
qcloud.video.prefixSearch('bucket', '/firstDir/', 'abc', 20, 'eListFileOnly');

```
