/*
 * 常用的工具类，打包文件的入口
*/

var utils = {
    /*
     *根据字符串声明一个命名空间并创建对象
     *@param {String} namespace 要创建命名空间的字符串
     *@param {String} splitChar 用于实现多级命名空间的分隔符
     */
    ns: function (namespace, splitChar){
        var global = window;

        this.each(this.trim(namespace).split(splitChar || '.'), function (item, i){
            global[item] = global[item] || {};
            global = global[item];
        });

        global = null;
    },

    /*
     *根据命名字符串获取对象
     *@param {String} namespace 命名字符串
     *@return {Object} ret 制定命名空间的对象
     */
    getNSObj: function (namespace){
        var ret = {};
        try{
            ret = new Function('return ' + namespace)();
        }
        catch (e){}

        return ret;
    },

    /*
     *从字符串前后过滤掉特殊字符
     *@param {String} str 指定的字符串
     *@param {String} chr 要过滤掉的字符
     *@return {String} 过滤完成的字符串
     */
    trim: function (str, chr){
        chr = new RegExp('^' + (chr || '\\s') + '+|' + (chr || '\\s') + '+$', 'g');
        return str.replace(chr, '');
    },

    /*
     *从指定字符串首过滤字符
     *@param {String} str 指定的字符串
     *@param {String} chr 要过滤掉的字符
     *@return {String} 过滤完成的字符串
     */
    trimLeft: function (str, chr){
        chr = new RegExp('^' + (chr || '\\s') + '+', 'g');
        return str.replace(chr, '');
    },

    /*
     *从指定字符串尾过滤字符
     *@param {String} str 指定的字符串
     *@param {String} chr 要过滤掉的字符
     *@return {String} 过滤完成的字符串
     */
    trimRight: function (str, chr){
        chr = new RegExp((chr || '\\s') + '+$', 'g');
        return str.replace(chr, '');
    },

    /**
     *移除数组array中的元素item
     *@param {Array} array 指定数组
     *@param {Mix} item 数组中的某一项
     */
    removeArrayItem: function (array, item) {
        this.each(array, function (cur, i){
            return cur === item ? '' + array.splice(i, 1) : 0;
        });
    },

    /*
     *遍历数组执行特定函数
     *@param {Array} array 遍历的数组
     *@param {Function} fn 遍历数组要执行的函数
     */
    each: function (array, fn){
        for (var i=0, len=array.length; i<len; ){
            if(fn(array[i], i++)){//如果函数显示返回true，则终止向下遍历
                return;
            }
        }
    },

    /*
     *遍历对象执行特定函数
     *@param {Object} obj 遍历的对象
     *@param {Function} fn 遍历对象要执行的函数
     */
    foreach: function (obj, fn){
        for (var k in obj){
            if(obj.hasOwnProperty(k) && fn(k, obj[k])){//如果函数显示返回true，则终止向下遍历
                return;
            }
        }
    },

    /*
     *把一个对象的属性扩展至另一个对象
     *@param {Object} target 扩展的目标对象
     *@param {Object} source 扩展的源对象
     *@param {Boolean} isPro 是否扩展prototype属性
     */
    extend: function(target, source, isPro){
        for (var prop in source){
            if(source.hasOwnProperty(prop)){
                target[prop] = source[prop];
            }
        }
        isPro && this.isFunction(source) && (target['prototype']=source['prototype']);//除了new的时候隐式链接，用户有可能手动调用这里要copy
    },

    /*
     *浅拷贝一个对象，对象类型的属性值只拷贝引用不新建
     *@param {Object} obj 目标对象
     *@return {Object} ret 目标对象的副本
     */
    copy: function(obj){
        var ret = {};
        for (var k in obj){
			//ie8及以下版本window对象没有hasOwnProperty方法
            ( ('hasOwnProperty' in obj && obj.hasOwnProperty(k)) || (utils.isIE>0 && utils.isIE<9) ) && (ret[k]=obj[k]);
        }
        return ret;
    },

    /*
     *将含有length属性的可遍历的对象转换成数组返回
     *@param {List} args 含有length属性的列表对象
     *@return {Array} ret 和原始对象等值的一个数组
     */
    list2Array: function(args){
        var ret;

        try{
            ret = [].slice.call(args, 0);
        }
        catch (e){
            for (var i=0, k=args.length; i<k; i++){
                ret.push(args[k]);
            }
        }

        return ret;
    },

    isUndefined: function (obj){
        return typeof obj === 'undefined';
    },

    isNull: function (obj){
        return obj === null;
    },

	isIE: function (){
		var ie = navigator.userAgent.match(/MSIE\s*(.*?);/i);

		return ie ? Math.round(ie[1]) : 0;
	}(),

    injectCSS2Page: function (cssArray){
        var style;

        if (document.createStyleSheet){
            style = document.createStyleSheet();
            var me = this;
            this.each(cssArray, function (item){
                item = me.trim(item).match(/(.+?)\{([^\}]*)\}/);
                item.length === 3 && style.addRule(item[1], item[2]);
            });
        }else if(style = document.createElement('style')){
            style.type = 'text/css';
            style.innerHTML = cssArray.join('');
            document.head.appendChild(style);
        }else{
            throw('injectCSS2Page failed');
        }
    },

    $: function (id){
        return document.getElementById(id) || id;
    },

    /*
     *格式化小数的输出
     *@param {Number} num 数字
     *@param {Number} m 保留小数点后的位数
     */
    formatDecimal: function (num, m){
        var num = String(num),
            idx = num.indexOf('.');

        return idx!==-1 ? num.substr(0, idx+m+1) : num;
    },

    /*
     *封装DOM的事件绑定
     *IE下对旧的DOM事件绑定代理
     */
    DomEvent: function (){
        var ieCallbacks = [];

        return window.addEventListener ? {
            on: function (dom, type, callback){
                dom.addEventListener(type, callback, false);
            },

            un: function (dom, type, callback){
                dom.removeEventListener(type, callback);
            }
        } : {
            on: function(dom, type, callback){
                dom.attachEvent('on' + type, ieCallbacks[ieCallbacks.push({
                    'dom': dom,
                    'type': type,
                    'callback': callback,
                    'handle': function (){
                        return callback.apply(dom, arguments);
                    }
                }) - 1].handle);
            },

            un: function (dom, type, callback){
                var index;

                utils.each(ieCallbacks, function (item, idx){
                    if(item.dom === dom && item.type === type && item.callback === callback){
                        dom.detachEvent('on' + type, item.handle);
                        index = idx;
                        return true;
                    }
                });
                ! utils.isUndefined(index) && ieCallbacks.splice(index, 1);
            }
        }
    }(),

    sumArray: function (array){
        var sum = 0;

        this.each(array, function (item){
            sum += item;
        });

        return sum;
    },

    getMaxFromArray: function (array){
        return new Function('return Math.max(' + (array.join()||0) + ')')();
    },

	addClass: function (node, cls){
		if(! new RegExp('\\b' + cls + '\\b').test(node.className)){
			node.className = node.className==='' ? cls : node.className+' '+cls;
		}
	}
};

//添加“isXXX”对象合集
utils.each(['Object', 'Array', 'Boolean', 'Number', 'Function'], function (item){
    utils['is' + item] = function(obj){
        return Object.prototype.toString.call(obj) === '[object ' + item + ']';
    };
});

//domready event
utils.extend(utils, {
    domReady: function (){
        var cbk = [],
            checkTimer,
            isReady = 0;

        function fireReady(){
            for (var i=0, fn; fn = cbk[i++]; ){
                fn.apply(this, arguments);
            }
        }

        if (window.addEventListener){
            utils.DomEvent.on(document, 'DOMContentLoaded', function(){
                isReady = 1;
                utils.DomEvent.un(document, 'DOMContentLoaded', arguments.callee);
                fireReady.apply(this, arguments);
            });
        }else{
            checkTimer = setInterval(function (){
                try{
                    document.documentElement.doScroll('left');
                    isReady = 1;
                    fireReady.apply(this, arguments);
                    window.clearInterval(checkTimer);
                }
                catch (e){

                }
            });
        }

        return function (fn){
            return (isReady || (document.readyState==='loaded' || document.readyState==='complete')) ? fn.call(document) : cbk.push(fn);
        }
    }()
});
