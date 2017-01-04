var fs=require('fs');
var request=require('request');


var wr=fs.createWriteStream("blue.txt");
request("http://www.baidu.com").pipe(wr);