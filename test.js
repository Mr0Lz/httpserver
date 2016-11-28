var http = require('http');
var util = require('util');
var os=require('os');
var exec=require("child_process").exec;
var fs=require("fs");
var path=require("path");
var https = require('https');
var querystring = require('querystring');
/*如何获取本地的IP地址？os.networkInterfaces 
通过内置的OS模块中的networkInterfaces()方法获取本机的网络接口信息集合，从中可以得到IPv4的地址
*/

var ifaces = os.networkInterfaces();
var ip = '';
for (var dev in ifaces) {
  ifaces[dev].forEach(function (details) {
  	//console.log(details);
    if (ip === '' && details.family === 'IPv4' && !details.internal) {
      ip = details.address;
      return;
    }
  });
}
console.log('---------------===========-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=');

/*
如何打开默认浏览器？
通过判断当前系统的类型，获取相应的cli命令，调用内置的进程管理模块中的exec方法打开url。
 */


var u="http://127.0.0.1:3000/";

//process 内置进程管理模块
//process.platform  获取操作系统
switch(process.platform){
	case "darwin":
		exec('open '+u);//必须要有个空格  因为只是调用命令行
		console.log(1);
		break;
	case "win32":
		exec('start '+u);//必须要有个空格  因为只是调用命令
		console.log(2);
		break;
	default:
		exec('xdg-open',[u]);
	
}
console.log('---------------===========-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=');
 /*如何自动分配一个可用的端口号？
我只想启动一个可用的服务，端口号我不关注，只要不报错，不被占用就ok，
当然启动完，我要知道我在哪个端口启动了。
监听0.0.0.0，nodejs会自动分配给你一个可用端口，
listening中获取port就ok了
*/

var server = http.createServer();
server.listen(0);
server.on('listening', function() { 
	var port = server.address().port;
	console.log(port);
});
console.log('---------------===========-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=');


fs.readdir('xxx/',function(e,f) {
	if(e){
		console.log(e);
	}else{
		console.log(f);
	}
});

console.log('---------------===========-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=');
//正确判断文件存在


fs.stat('/aaaa/bbbb/c', function(err, stat) {
    if(err == null) {
        if(stat.isDirectory()) {
            console.log('文件夹存在');
        } else if(stat.isFile()) {
            console.log('文件存在');
        } else {
            console.log('路径存在，但既不是文件，也不是文件夹');
            //输出路径对象信息
            console.log(stat);
        }
    } else if(err.code == 'ENOENT') {
        console.log(err.name);
        console.log('路径不存在');
    } else {
        console.log('错误：' + err);
    }
});

console.log('---------------===========-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=');
//读取HTTP GET的回应
//Node.js的http.get的Callback中的第一个res参数是执行Readable Stream接口的。
//所以可以通过他的on方法来监听data和end事件，
//在data事件中需要把每次的片段（chunk参数）拼接起来，最后在end事件中使用完整的数据。
//（如果是字符串数据的话，请使用Buffer的toString方法转换成字符串）
//
//拼接数据也有多种方式，这里使用的是简单的JavaScript中的Array.push，
//然后再使用Node.js的Buffer.concat来把chunk数组合并成完整的Buffer。
console.log('开始');
http.get("http://www.microsoft.com", function(res) {
    console.log("HTTP StatusCode: " + res.statusCode);
    
    var buffers = [];
    res.on('data', function(chunk) {
        console.log(util.format('收到chunk %d 字节', chunk.length));
        buffers.push(chunk);
    });
    
    res.on('end', function(chunk) {
        var wholeData = Buffer.concat(buffers);
        console.log(util.format('完毕，共 %d 字节', wholeData.length));
        console.log(wholeData);
        var dataStr = wholeData.toString('utf8');
        console.log(dataStr.substr(0, Math.min(2000, dataStr.length)) + '...(省略)');
    });
}).on('error', function(e) {
    console.log("错误: " + e.message);
});

console.log('---------------===========-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=');

//因为Node.js（目前0.12.4）现在还没有直接发送POST请求的封装。
//发送GET的话，使用http.get可以直接传一个字符串作为URL，而http.get方法就是封装原始的http.request方法。
//发送POST的话，只能使用原始的http.request方法，
//同时因为要设置HTTP请求头的参数，
//所以必须传入一个对象作为http.request的第一个options参数（而不是URL字符串）。
//options参数中的hostname需要的是不带协议的URL根路径，
//子路径需要在path属性单独设置。如果hostname包含了完整的URL，
//通常会遇到错误：Error: getaddrinfo ENOTFOUND http://www.xxx.com/xxx。
//可以使用url.paser()  解析后出过去;
//然后就是常见POST请求HTTP Header属性的设置，设置method为POST，
//另外如果是模拟HTML <form>的POST请求的话，
//Content-Type应当是application/x-www-form-urlencoded，最后别忘了Content-Length，而且，
//如果Content是字符串的话最好用Buffer.byteLength('字符串', 'utf8')
//来获取字节长度（而不是直接'字符串'.length，虽然使用URL编码的ASCII字符串每个字符是1字节）
//最后就是request.on("data/end/error")来处理数据
//POST URL 测试地址
var urlstr = 'http://httpbin.org/post';
//POST 内容
var bodyQueryStr = {
    name: 'mgen',
    id: 2345,
    str: 'hahahahahhaa'
};

var contentStr = querystring.stringify(bodyQueryStr);
var contentLen = Buffer.byteLength(contentStr, 'utf8');
console.log(util.format('post data: %s, with length: %d', contentStr, contentLen));
var httpModule = urlstr.indexOf('https') === 0 ? https : http;
var urlData = url.parse(urlstr);

//HTTP请求选项
var opt = {
    hostname: urlData.hostname,
    path: urlData.path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': contentLen
    }
};

//处理事件回调
var req = httpModule.request(opt, function(httpRes) {
    var buffers = [];
    httpRes.on('data', function(chunk) {
        buffers.push(chunk);
    });

    httpRes.on('end', function(chunk) {
        var wholeData = Buffer.concat(buffers);
        var dataStr = wholeData.toString('utf8');
        console.log('content ' + wholeData);
    });
}).on('error', function(err) {
    console.log('error ' + err);
});

//写入数据，完成发送
req.write(contentStr);
req.end();