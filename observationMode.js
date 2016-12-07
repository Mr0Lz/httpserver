//---------------观察者模式又叫发布订阅模式（Publish/Subscribe），
//它定义了一种一对多的关系，让多个观察者对象同时监听某一个主题对象，
//这个主题对象的状态发生变化时就会通知所有的观察者对象，
//使得它们能够自动更新自己。
var pubsub = {};
(function (q) {

    var topics = {}, // 回调函数存放的数组
        subUid = -1;
    // 发布方法
    q.publish = function (topic, args) {

        if (!topics[topic]) {
            return false;
        }

        setTimeout(function () {
            var subscribers = topics[topic],
                len = subscribers ? subscribers.length : 0;

            while (len--) {
                subscribers[len].func(topic, args);
            }
        }, 0);

        return true;

    };
    //订阅方法
    q.subscribe = function (topic, func) {

        if (!topics[topic]) {
            topics[topic] = [];
        }

        var token = (++subUid).toString();
        topics[topic].push({
            token: token,
            func: func
        });

        return token;
    };
    //退订方法
    q.unsubscribe = function (token) {

        for (var m in topics) {
            if (topics[m]) {
                for (var i = 0, j = topics[m].length; i < j; i++) {
                    if (topics[m][i].token === token) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    };
} (pubsub));



//将订阅赋值给一个变量，以便退订

var testSubscription = pubsub.subscribe('example1', function (topics, data) {
    console.log(topics + ": " + data);
});
var testSubscription2 = pubsub.subscribe('example2', function (topics, data) {
    console.log(topics + ": " + data);
});
//发布通知
pubsub.publish('example1', 'hello world!');
pubsub.publish('example1', ['test', 'a', 'b', 'c']);
pubsub.publish('example1', [{ 'color': 'blue' }, { 'text': 'hello'}]);
pubsub.publish('example2', "lz");
//退订
setTimeout(function () {
    //pubsub.unsubscribe(testSubscription);
    pubsub.unsubscribe(testSubscription2);
}, 0);

//再发布一次，验证一下是否还能够输出信息
pubsub.publish('example1', 'hello again! (this will fail)');


//--------------我们也可以利用原型的特性实现一个观察者模式--------------------------------------------
//
function Observer() {
    this.fns = [];
}
Observer.prototype = {
    subscribe: function (fn) {
        this.fns.push(fn);
    },
    unsubscribe: function (fn) {
        this.fns = this.fns.filter(
                        function (el) {
                            if (el !== fn) {
                                return el;
                            }
                        }
                    );
    },
    update: function (o, thisObj) {
        var scope = thisObj || window;
        this.fns.forEach(
                        function (el) {
                            el.call(scope, o);
                        }
                    );
    }
};

//测试
var o = new Observer();
var f1 = function (data) {
    console.log('Robbin: ' + data + ', 赶紧干活了！');
};

var f2 = function (data) {
    console.log('Randall: ' + data + ', 找他加点工资去！');
};

o.subscribe(f1);
o.subscribe(f2);

o.update("Tom回来了！");

//退订f1
o.unsubscribe(f1);
//再来验证
o.update("Tom回来了！");   
//-------------如果想让多个对象都具有观察者发布订阅的功能，
//我们可以定义一个通用的函数，
//然后将该函数的功能应用到需要观察者功能的对象上
//通用代码
var observer = {
    //订阅
    addSubscriber: function (callback) {
        this.subscribers[this.subscribers.length] = callback;
    },
    //退订
    removeSubscriber: function (callback) {
        //console.log(this.subscribers[0]===callback);
        for (var i = 0; i < this.subscribers.length; i++) {
            if (this.subscribers[i] === callback) {        
                delete (this.subscribers[i]);
            }
        }
    },
    //发布
    publish: function (what) {
        for (var i = 0; i < this.subscribers.length; i++) {
            if (typeof this.subscribers[i] === 'function') {
                this.subscribers[i](what);
            }
        }
    },
    // 将对象o具有观察者功能
    make: function (o) { 
        for (var i in this) {
            o[i] = this[i];
            o.subscribers = [];
        }
    }
};
var blogger = {
    recommend: function (id) {
        var msg = 'dudu 推荐了的帖子:' + id;
        this.publish(msg);
    }
};

var user = {
    vote: function (id) {
        var msg = '有人投票了!ID=' + id;
        this.publish(msg);//内部发布
    }
};



function w(w) {
    console.log(w);
}


observer.make(blogger);
observer.make(user);
/*user.addSubscriber(w);

user.vote('1user');

user.removeSubscriber(w);

user.vote('2user');*/







var tom = {
    read: function (what) {
        console.log('Tom看到了如下信息：' + what);
    }
};

var mm = {
    show: function (what) {
        console.log('mm看到了如下信息：' + what);
    }
};
// 订阅
blogger.addSubscriber(tom.read);
blogger.addSubscriber(mm.show);
blogger.recommend(123); //调用发布

//退订
blogger.removeSubscriber(mm.show);
blogger.recommend(456); //调用发布

//另外一个对象的订阅
user.addSubscriber(mm.show);
user.vote(789); //调用发布


/////根据jQuery1.7版新增的on/off功能，我们也可以定义jQuery版的观察者：
(function ($) {
    var o=$({});
    $.subscribe=function() {
        o.on.apply(o,arguments);
    };
    $.unsubscribe=function() {
        o.off.apply(o,arguments);
    };
    $.publish=function() {
        o.trigger.apply(o,arguments);
    };
}(jQuery));


//回调函数
function handle(e, a, b, c) {
    // `e`是事件对象，不需要关注
    console.log(a + b + c);
}

//订阅
$.subscribe("/some/topic", handle);
//发布
$.publish("/some/topic", ["a", "b", "c"]); // 输出abc
        

$.unsubscribe("/some/topic", handle); // 退订

//订阅
$.subscribe("/some/topic", function (e, a, b, c) {
    console.log(a + b + c);
});

$.publish("/some/topic", ["a", "b", "c"]); // 输出abc

//退订（退订使用的是/some/topic名称，而不是回调函数哦，和版本一的例子不一样
$.unsubscribe("/some/topic"); 
// 可以看到，他的订阅和退订使用的是字符串名称，而不是回调函数名称，
// 所以即便传入的是匿名函数，我们也是可以退订的。




//类似上面的版本一
var Events = function() {
 
           var listen, log, obj, one, remove, trigger, __this;
 
           obj = {};
 
           __this = this;
 
           listen = function( key, eventfn ) {  //把简历扔盒子, key就是联系方式.
             var stack, _ref;  //stack是盒子
 
             stack = ( _ref = obj[key] ) != null ? _ref : obj[ key ] = [];
        
             return stack.push( eventfn );
 
           };
        //覆盖之前定义过的
           one = function( key, eventfn ) {
 
             remove( key );
 
             return listen( key, eventfn );
 
           };
 
           remove = function( key ) {
 
             var _ref;
 
             return ( _ref = obj[key] ) != null ? _ref.length = 0 : void 0;
 
           };
 
           trigger = function() {  //面试官打电话通知面试者
 
             var fn, stack, _i, _len, _ref, key;
             key = Array.prototype.shift.call( arguments ); 
 
             stack = ( _ref = obj[ key ] ) != null ? _ref : obj[ key ] = [];
 
             for ( _i = 0, _len = stack.length; _i < _len; _i++ ) {
 
               fn = stack[ _i ];
 
               if ( fn.apply( __this,  arguments ) === false) {
 
                 return false;
 
               }
 
             }
        };
             return {
 
                listen: listen,
 
                one: one,
 
                remove: remove,
 
                trigger: trigger
 
             };
 
        
       };

 var adultTv = Events();
adultTv.listen(  'play',  function( data ){
 
   alert( "今天是谁的电影" + data.name );
 
});
 
//发布者
 
adultTv.trigger(  'play',  { 'name': '麻生希' }  );

//adultTv.remove('play');

adultTv.trigger(  'play',  { 'name': 'lz' }  );