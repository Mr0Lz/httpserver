var Carousel;
(function () {
	function carousel(bannerBox,imgList,option) {
		var prevBtn=document.querySelector(option.prevBtn||".prev"),
		nextBtn=document.querySelector(option.nextBtn||".next"),
		indexBtn=option.indexBtn||false,
		container=document.querySelector(bannerBox),
		imgBox=document.querySelector(imgList),
		imgs=imgBox.children,btns,
		timer,duration = option.duration || 40,//缓动效果持续时间
		pos=-100,flag=false,startPos,
		ease=option.BezierCurve||function(t,b,c,d){return c*(t/=d)*t*t + b;},
        autoPlay=option.autoPlay&&true,
        autoPlayTime=option.autoPlayTime||1000,
        autoPlayDir=option.autoPlayDir||"left",
        index=1,actClass=option.actClass||"actClass",
        maxWidth=option.maxWidth||"1024",
		imgLength=imgs.length,
		containerW=container.offsetWidth,
		minWidth=option.minWidth||1024;
		container.style.minWidth=minWidth+'px';
		cloneImg(imgBox,imgs);
		imgBox.style.width=(imgLength+2)*100+"%";
		reImgWidth(imgs,containerW);
		imgBox.style.left=pos+"%";
			init();
			play();
function init(){
			bindEvent(window,"resize",function (e) {
				if(container.offsetWidth<=minWidth){
					reImgWidth(imgs,minWidth);
					return false;
				}
				reImgWidth(imgs,container.offsetWidth);
			});
			bindEvent(nextBtn,"click",function (e) {
				changeimg(-1);
			});
			bindEvent(prevBtn,"click",function (e) {
				changeimg(1);
			});

			initIndexBtn();

}

//检查下标
function checkIndex() {
		if(index>imgLength){index=1; return ;}
		if (index<1) {index=imgLength; return ;}
}

//下标按钮
function initIndexBtn() {
	if(indexBtn===false){
		return false;
	}else{
		var ul=document.createElement("ul");
		for (var i = 0; i < imgLength; i++) {
			 	var li=document.createElement('li');
			 	// if(i===0){li.className="ie actClass";}
			 	// else{li.className="ie";}
			 	if(i===0){li.className="actClass";}
				li.data=i+1;
				ul.appendChild(li);
			}
		container.appendChild(ul);
	}
	btns=ul.children;

	for (var j = btns.length - 1; j >= 0; j--) {
		btns[j].onclick=function () {
				
			var self=this,data=self.data,displace=0;
			if(index==data||flag){return false;}
				left=data*100;
				displace=left-Math.abs(pos);
				
		//var sp=0,t=0,	
// function Run(){
// 	sp=ease(t,0,displace,duration);
// 	 imgBox.style.left=pos+(Math.ceil(sp)*-1)+"%";
// 	 if (t<duration) {
// 	 	setTimeout(Run,20);
// 	 	t++;
// 	 }else{
// 	 	pos=left*-1;
// 	 }
// }
// Run();	
		anima(-1,pos,displace,function () {
			pos=left*-1;
		});
		index=data;
		actIndexBtn(self,actClass,btns);

		};
	}


}

function actIndexBtn(o,actClass,reClass) {
	if (reClass) {
		for (var i = reClass.length - 1; i >= 0; i--) {
			removeClass(reClass[i],actClass);
		}}
		addClass(o,actClass);
}


function moveIndexBtn(direction) {
	if(!indexBtn){return false;}

	if (direction===-1) {
		index++;
		checkIndex();
		actIndexBtn(btns[index-1],actClass,btns);
	}else if(direction===1){
		index--;
		checkIndex();
		actIndexBtn(btns[index-1],actClass,btns);
	}
}

//切换图片
function changeimg(direction,onend) {
	startPos=pos;
	if(flag){
		return false;
	}

	if (direction===-1) {
		pos+=(direction*100);
		if(-(imgLength*100)>pos){
			pos=-100;
			anima(direction,startPos,100,onend);
		}else{
			anima(direction,startPos,100,onend);
		}
		moveIndexBtn(direction);
	}else if(direction===1){
		pos+=(direction*100);
		if(-100<pos){
			pos=-(imgLength*100);
			anima(direction,startPos,100,onend);
		}else{
			anima(direction,startPos,100,onend);
		}
		moveIndexBtn(direction)
	}
	
}


function anima(direction,startPos,displace,onend) {
	var t=0,
		sp=0;
// function Run(){
// 	flag=true;
// 	 sp += 10;
//     imgBox.style.left=(pos-100)+sp+"%";
//     if(sp<100){  setTimeout(Run, 50); }
//     else{onend();flag=false;}

// }
function Run(){
	flag=true;
	sp=ease(t,0,displace,duration);
	 imgBox.style.left=startPos+(Math.ceil(sp)*direction)+"%";
	 if (t<duration) {
	 	setTimeout(Run,20);
	 	t++;
	 }else{
	 	onend&&onend();
	 	flag=false;
	 }
}
Run();
}





function l(x) {
	console.log(x);
}

//addClass removeClass hasClass
function addClass(o,c) {
	var o_class=o.className,
	blank=(o_class != "")? " ":"";
	added=o_class+blank+c;
	o.className=added;
}
function removeClass(o,c) {
	var o_class=" "+o.className+" ";
	o_class=o_class.replace(/(\s+)/gi," ");
	removed = o_class.replace(' '+c+' ', ' ');
	removed = removed.replace(/(^\s+)|(\s+$)/g, '');
	o.className=removed;
}
function hasClass(o,c) {
	var o_class=o.className,
	c_lst=o_class.split(/\s+/),
	x=0;
	for(x in c_lst){
		if(c_lst[x]==c){
			return true;
		}
	}
	return false;
}

//自动播放
function play(){
	if (!autoPlay) {return false;}
	automatic();
	bindEvent(container,"mouseover",function(e){
		if(contains(container,getRelatedTarget(e))){
			return false;
		}
		clearInterval(timer);
	});
	bindEvent(container,"mouseout",function(e){
		if(contains(container,getRelatedTarget(e))){
			return false;
		}
		automatic();
	});

}


function automatic(){
	timer=setInterval(function () {
		if (autoPlayDir==="left") {changeimg(-1);}else {changeimg(1);}
	},autoPlayTime);
}

//解决onmouseover onmouseout bug
function getRelatedTarget(e){
	var e=e||window.event;
	if(e.relatedTarget){
		return e.relatedTarget;
	}else{
		if (e.type==="mouseout") {
			return e.toElement;
		}else if(e.type){
			return e.fromElement;
		}
	}
}
function contains(a,b){
	if(a.contains){
		return a!=b&&a.contains(b);
	}else {
		return a.comparDocumentPosition(b)===16;
	}
}

// 克隆节点
function cloneImg(imgBox,imgs) {
	var first=imgs[0].cloneNode(true);
	var last=imgs[imgLength-1].cloneNode(true);
	imgBox.appendChild(first);
	imgBox.insertBefore(last,imgs[0]);
}

// 调整图片宽度
function reImgWidth(imgs,containerW) {
	for (var i = imgs.length - 1; i >= 0; i--) {
			var img=imgs[i].childNodes[0];
			img.style.width=containerW+"px";
		}
}

function bindEvent(ele,type,cb) {
	if(ele.addEventListener){
		ele.addEventListener(type,cb,false);
	}else if(ele.attachEvent){
		ele.attachEvent("on"+type,cb);
	}else{
		ele["on"+type]=cb;
	}
}


	}


	Carousel=carousel;
})();