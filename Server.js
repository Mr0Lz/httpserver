var http=require('http');//Http服务器API
var fs=require('fs');//用于处理本地文件
var os=require('os');//用于获取本地IP
var exec=require('child_process').exec;//用于打开默认浏览器
var path=require('path');//用于处理路径
var url=require('url');//用于解析get请求所带的参数
var mine=require('./mine').types;
var CONFIG,//默认配置
	HTTP,//HTTP静态码
	log;//日志打印

	CONFIG={
		homedir:"",
		home:"index.html",
		port:3000,
		browser:true,
	};

	log=function (txt) {
		console.log(txt);	
	};

	HTTP={
		init:function () {
			//注册监听端口和请求响应事件
			//新建一个http服务器
			this.createServer();
		},
		_getIPAddress:function () {
			/* 获取本地IPv4的IP地址 */
			//通过内置的OS模块中的networkInterfaces()方法获取本机的网络接口信息集合，
			//从中可以得到IPv4的地址
			var ifaces=os.networkInterfaces();
			var ip="";
			for(var dev in ifaces){
				ifaces[dev].forEach(function (details) {
					if (ip===""&&details.family==="IPv4"&&!details.internal) {
						ip=details.address;
						return;				
					}
				});
			}
			//return ip;
			return "127.0.0.1";
		},
		_openURL:function(path){
			/* 使用默认浏览器打开URL */
			//process.platform 判断平台
			switch(process.platform){
				case "win32" :exec('start '+path);break;
				case "darwin" :exec('open '+path);break;
				default :exec("xdg-open",[path]);
			}
		},
		_getMIME:function (ext) {
			/* 获取文件的MIME类型 */
			return mine[ext];

		},
		route:function( pathName, req, res ){/* 路由到指定的文件并响应输出 */
			var self=this;
			//注意：自Node V4.0以后这个方法已经不再支持，请使用fs.stat()或fs.access()。
			//fs.exists(pathname, function (exists) {});


			fs.stat(pathName,function (err,stats) { 
				if (err) {
					res.writeHead(404,"Not Found",{"Content-type":"text/plai"});
					res.write("This request URL " + pathName + " was not found on this server.");
					res.end();
				}else{
					if (stats.isDirectory()) {//如果是文件夹就打开默认主页
						console.log(req.url+"--1--"+pathName);
						//console.log(req.url+"--0--"+pathName+"------"+pathName.slice(-1));
						//pathName=path.join(pathName,'/',CONFIG.home);
						//self.route(pathName, req, res );
						//console.log(__dirname);
						//console.log(req.url+"--1--"+pathName);
						fs.readdir(pathName,function(err, files){
							   if (err) {
							   	console.log(err+req.url+"-if-"+files+"--"+pathName);
							   }else{
							   	console.log(req.url+"-else-"+files+"--"+pathName);
							   	//判断文件夹是否有index.html
								for (var i = files.length - 1; i >= 0; i--) {
									if(files[i]===CONFIG.home&&pathName.slice(-1)==="/"){
										pathName=path.normalize(pathName+"/"+CONFIG.home);
										self.route.bind(self)(pathName,req,res);
							   			break;
							   		}else if(files[i]===CONFIG.home&&pathName.slice(-1)!=="/"){
							   			res.writeHead(200,"OK");
							   			res.write("get  file");
							   			res.end();
							   		}
								}
							   }
							 
							});
					}else{
						//console.log(req.url+"--2--"+pathName);
						var method=req.method,
							ext=path.extname(pathName),
							params='';
							ext=ext?ext.slice(1):"unknown";
							// 如果是get请求，且url结尾为'/'，那么就返回 home 页
							if(method==="GET"){
								//console.log(req.url+"--3--"+pathName);
								pathName.slice(-1) === '/' && (pathName=path.normalize(pathName+"/"+CONFIG.home));
								params=url.parse(req.url,true).query;
								self.responseFile.bind(self)(pathName,res, ext, params);
							}else if(method==="POST") {
							//	console.log(req.url+"--4--"+pathName);
								var _postData="",_postMap="";
								req.on("data",function(chunk){
									_postData+=chunk;//接收post 参数
								}).on("end",function () {
									//querystring模块处理查询字符串的工具
									params=reqiure("querystring").parse(_postData);
									self.responseFile.bind(self)(pathName,res, ext, params);
								});
							}else{
							//	console.log(req.url+"--5--"+pathName);
								self.responseFile.bind(self)(pathName,res, ext, params);
							}

					}
				}
			});
		},
		responseFile:function (pathName, res, ext, params) {
			 /* 读取文件流并输出 */
			//路由处理 判断文件是否存在  不存在返回404  
			//存在 则判断是否是文件夹 isDirectory  是文件夹,就返回文件夹下的默认home页面
			//如果是文件,则获取扩展名和请求数据的参数  
			//根据扩展名获取文件MIME类型
			//响应流中添加允许跨域请求 Access-Control-Allow-Origin=*;
			//如果文件是json格式,则判断是否有delay延迟参数  有 则延迟
			
			var self=this;
			var raw=fs.createReadStream(pathName);
			//setHeader 允许跨域调用
			res.setHeader("Access-Control-Allow-Origin","*");
			res.setHeader("Content-type",self._getMIME(ext));
			//判断是否有json,是否需要delay延迟
			if (ext==="json"&&params.delay) {
				setTimeout(function () {
					res.writeHead(200,"OK");
					raw.pipe(res);
				},params.delay);
			}else{
				res.writeHead(200,"OK");
				raw.pipe(res);
			}

			
		},
		createServer:function(){/* 创建一个http服务 */
			var server=http.createServer(),
			self=this;
			server.listen(CONFIG.port!==0?CONFIG.port:0);//监听0端口 node会自动分配
			self._bindEvents(server);
		},
		_bindEvents:function(server){ /* 注册响应事件 */
				//注册监听端口启动事件
			//在成功链接到端口后,获取port端口号和本地IP,并打开默认浏览器
				var self=this,
			defaultUrl=CONFIG.homedir?CONFIG.homedir+'/'+CONFIG.home:CONFIG.home;
			server.on('listening',function () {
				var port=server.address().port;
				log("server runging a "+port);
				//打开默认浏览器
				log(self._getIPAddress());
				CONFIG.browser&&self._openURL("http://"+self._getIPAddress()+":"+port+'/'+defaultUrl);
			});

				//注册请求处理事件 在接收请求url后,解析并路由到指定文件并输出
			server.on("request",function(request,response) {
				//解析请求url
				var oUrl=url.parse(request.url);
				var pathname=oUrl.pathname.slice(1);
				if(!pathname)pathname=defaultUrl;
				//log(request.url+"----lz------"+pathname+"------lz-----"+__dirname);
				self.route.bind(self)(pathname,request,response);
			});
		}
	};
HTTP.init();

