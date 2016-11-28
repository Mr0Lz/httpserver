var PORT=3000;

var http=require('http');
var url=require('url');
var fs=require('fs');
var mine=require('./mine').types;
var path=require('path');

http.createServer(function (request,response) {
   var pathname = url.parse(request.url).pathname;
   var realPath = path.join("xx", pathname);
   console.log(realPath+"---"+pathname);

/*   path.extname对于url中扩展名的识别存在bug，比如这样的URL识别会取到最后一个点的位置，本来应该是woff2，结果却是0。
   http://localhost:8000/ab/resources/fonts/font.woff2?v=4.5.0
   取得.0
   不过pathname;取得后的?号就没了
  */
 
	/*var  extname=realPath;
	var i=extname.indexOf('?');
	if(i>=0){
		extname=extname.substring(0,i);
	}*/
	var ext = path.extname(realPath); 
		ext=ext ? ext.slice(1) : "unknown";

   //判断路径是否存在
   fs.exists(realPath,function (exists) {
   		if(!exists){
   			response.writeHead(404,{"Content-type":"text/plain"});
   			response.write("This  request URL"+pathname+"was not  found on this  server.");
   			response.end();
   		}else{

   			console.log(realPath+"---"+ext);
   			if (pathname==='/') {
   				// 钉死
   				var p=path.join(__dirname,"xx","index.html");
	   			fs.readFile(p,'binary',function (err,file){
	   				if (err) {
	   					response.writeHead(500,{"Content-type":"text/plain"});
	   					response.end(err);
	   				}else{
		   				response.writeHead(200,{"Content-type":"text/html"});
		   				response.write(file,"binary");
		   				response.end();
	   				}
	   			});

   			}else{


	   			fs.readFile(realPath,'binary',function (err,file) {
	   				if (err) {
	   					response.writeHead(500,{"Content-type":"text/plain"});
	   					response.end(err);
	   				}else{
	   					var contentType=mine[ext] || "text/plain";
	   					response.writeHead(200,{"Content-type":contentType});
	   					response.write(file,"binary");
	   					response.end();
	   				}
	   			});
   			}










   		}


   	});

}).listen(PORT);
console.log("Server runing at port "+PORT+".");

