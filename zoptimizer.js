;(function(){/*
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

/**
 *实现自定义事件机制的基类
 *该类适合于并发处理消息的场景，无视保证所有监听者之间的依赖
*/

var ObserverFactory = {
    /*
     *创建该对象的一个实例，支持自定义属性
     *@param {Object} opt 创建对象的自定义属性
     */
    create: function (opt){
        var ob = {};

        utils.foreach(opt, function (k, item){
            opt.hasOwnProperty(k) && (ob[k] = item);
        });

        ob.addListener = this.addListener;
        ob.removeListener = this.removeListener;
        ob.fireEvent = this.fireEvent;
        ob.getListener = this.getListener;

        return ob;
    },

    addListener: function (types, listener){
        types = utils.trim(types).split(' ');
        for (var i = 0, ti; ti = types[i++];) {
            this.getListener(ti).push(listener);
        }
    },

    removeListener: function (types, listener){
        types = utils.trim(types).split(' ');
        for (var i = 0, ti; ti = types[i++];) {
            (ti = this.getListener(ti)) && utils.removeArrayItem(ti, listener);
        }
    },

    fireEvent: function (types){
        types = utils.trim(types).split(' ');

        for (var i = 0, ti; ti = types[i++];) {

            var listeners = this.getListener(ti),
                t, k;

            if (listeners) {
                k = listeners.length;
                while (k--) {
                    if(!listeners[k])continue;
                    t = listeners[k].apply(this, arguments);
                }
            }

            (t = this['on' + ti.toLowerCase()]) && (t = t.apply(this, arguments) );
        }

        return t;
    },


    /**
     * 获得对象所拥有监听类型的所有监听器
     * @param {String} type 事件类型
     * @returns {Array} 监听器数组,默认会根据请求创建空对象
     */
    getListener: function (type) {
        var allListeners = this.allListeners;
        type = type.toLowerCase();
        return allListeners ? ( allListeners[type] || (this.allListeners[type] = []) ) : (this.allListeners = {}, this.allListeners[type] = []);
    }
};


/**
 * zoptimizer的核心文件
 * 遍历指定命名空间
 * 包装关联的可执行函数
*/
var zop = function(){
    var shell = [];

    function findRightShell(itemKey, checkVal){
        var len = shell.length;

        while (len--){
            if(shell[len][itemKey]===checkVal) return shell[len];
        }
    }

    return ObserverFactory.create({
        version: '1.0.0',

        check: function(ns){
            var cur,
                temp,
                curbak,
                obj;

            obj = typeof ns === 'string' ? utils.getNSObj(utils.trimRight(utils.trimLeft(ns, 'window\\.'), '\\.')) : ns;

            shell.push({'object': obj, 'name': ns, 'supCopy': null});

            while (obj){
                var _realobj = findRightShell('supCopy', obj);

                _realobj = _realobj ? _realobj['realSup'] : obj;

                cur = curbak = utils.copy(obj);//一次迭代内变量

                for (var k in cur){//遍历副本对象不对原始对象修改
                    if ( ('hasOwnProperty' in cur && cur.hasOwnProperty(k)) || (utils.isIE>0 && utils.isIE<9)){
                        temp = cur[k];
                        delete cur[k];

                        if(findRightShell('object', temp)) continue;//可能存在已有的对象引用

                        if (utils.isObject(temp)){
                            shell.push({'object': temp, 'supCopy': cur, 'realSup': _realobj, 'name': k});//在壳对象中以对象为键值保存对象的信息，不能直接设定到原始对象
                        }else if (typeof temp === 'function'){
                            var fname = [],
                                shellobj = findRightShell('object', _realobj);

                            while (shellobj){
                                shellobj.name && fname.unshift(shellobj.name);
                                shellobj = findRightShell('object', findRightShell('supCopy', shellobj.supCopy).realSup);
                            }

                            shell.push({'object': temp, 'supCopy': cur, 'realSup': _realobj, 'name': k, 'path': fname.join('.')+'.'+k});

                            //派发消息供外部对象存储路径标识，本身只做遍历不存储
                            this.fireEvent('function-found', shell[shell.length-1].path);

                            //修改真实对象

                            var useObj = utils.getNSObj(fname.join('.'));
                            useObj[k] = this.wrapCount(temp);

                            //Trace: 这里复制属性的时候可能会把是函数或对象的属性也拷贝过去
                            //
                            utils.extend(useObj[k], temp, 1);//保留属性值

                        }else{//只处理Object和Function类型的属性，其它跳过
                            continue;
                        }
                        cur = temp;
                        break;
                    }
                }

                obj = curbak===cur ? findRightShell('object', _realobj).supCopy : cur;//相同时证明该对象没有子对象，返回上一级对象，否则返回当前子对象
            }
        },

        wrapCount: function(fn){
            var me = this;

            return function(){
                var path = findRightShell('object', fn).path;
                //TODO: fireEvent被wrap后这里调用会导致循环调用
                me.fireEvent('before-function-exec', path, arguments, fn);

                var res,
                    stime = +new Date;

                if (this.constructor===arguments.callee){//called by new
                    for (var i=0, arg=[]; i<arguments.length; i++){
                        arg.push(typeof arguments[i]==='string' ? '"'+arguments[i]+'"' : arguments[i]);
                    }
                    res = new Function('return new fn(' + arg.join(',') + ')')();
                }else{
                    res = fn.apply(this, arguments);
                }

                me.fireEvent('after-function-exec', path, arguments, fn, (+new Date) - stime);

                return res;
            }
        },

        getShell: function (){
            return shell;
        }
    });
}();
/**
* 核心数据处理
* 通过注册zop的事件采集函数数据
*/

var dataset = function (){
    /*
     *保存函数监测结果对象的集合，每个对象含有三个键值
     *@item.key {Array} runtime 函数每次运行的时长
     *@item.key {Array} arglist 函数每次运行的参数列表
     *@item.key {Array} caller 调用该函数的对象列表
     */
    var funcInfos = {};

    return {
        //TODO:结果集中的item需要保护不能直接对外提供对象

        /*
         *添加函数路径到结果集对象
         *@param {String} fpath
         */
        setInfoByPath: function (fpath){
            funcInfos[fpath] = {'runtime':[], 'arglist':[], 'caller':[]};
        },
        /*
         *获取指定路径函数的监测结果
         *@param {String|null} fpath 函数的全路径名称或空
         *@return {Object} 结果集中的项或结果集
         */
        getInfoByPath: function (fpath){
            //TODO: 基于完整性考虑不该返回整个对象
            return fpath ? funcInfos[fpath] : funcInfos;
        },

        /*
         *对数据应用指定筛选器
         *@param {Object} format 筛选器
         *@param {String} method 筛选器使用的方法名
         */
        applyFormat: function (format, method){
            utils.foreach(funcInfos, function (k, v){
                format[method](k, v);
            });
        },

		getFuncInfosLength: function (){
			var i = 0;
			utils.foreach(funcInfos, function (){
				i++;
			});
			return i;
		}
    }
}();

zop.addListener('function-found', function (_, fnpath){
    dataset.setInfoByPath(fnpath);
});

//zop.addListener('before-function-exec', function (_, fnpath, args, fn){
//    var item = dataset.getInfoByPath(fnpath);
//
//    item.runtime.push(+new Date);
//    item.arglist.push(utils.list2Array(args).join(','));
//    item.caller.push(args.callee.caller);
//});

zop.addListener('after-function-exec', function (_, fnpath, args, fn, duration){
    var item = dataset.getInfoByPath(fnpath);

    item.runtime.push(duration);
    item.arglist.push(utils.list2Array(args).join(','));
    item.caller.push(args.callee.caller);
});
/*
 *定义一些自定义参数的文件
 *运行时允许动态改变
 */

var preference = {
    displayMaxLine: 10 //结果集展示的最大行数
};

zop.addListener('preference-changed', function (_, name, val){
    utils.isUndefined(preference[name]) || (preference[name] = val);
});
/*
 *对结果集处理的控制类
 *每个格式化输出类必须实现自己的lable和格式化规则
 */

var format = function (){
    var allFormats = {},
        count = 0;

    return {
        create: function (opt){
            var obj = {
                'label': 'format-filter' + count++,
                'filter': this.filter
            };

            allFormats[obj.label] = obj;

            opt && utils.extend(obj, opt);

            return obj;
        },

        filter: function (){},

        getFilteredData: function (type){
            var fter = this.getFormatByName(type);

            dataset.applyFormat(fter, 'filter');
            return fter.getData();
        },

        getFormatByName: function (name){
            return allFormats[name] || allFormats;
        }
    }
}();


/*
 *定义一个格式化筛选器
 *按照使用次数多少对结果集筛选
 */

 format.create({
    label: '调用次数最多的函数列表',

    filteredData: [],

    filter: function (path, info){
        //TODO:添加忽略函数的策略
        this.filteredData.push([path, info.runtime.length]);
    },

    /*
     *获取当前筛选器的结果
     *@return {Object} header是结果的标题字段[字段名, 宽度百分比]，data是结果集
     */
    getData: function (){
        var ret = {
            header: [['函数名称', 75], ['调用次数', 25]],
            data: this.filteredData.sort(function (a, b){
                return b[1] - a[1]
            })
        };

        this.filteredData = [];
        return ret;
    }
 });
/*
 *定义一个格式化筛选器
 *按照函数平均调用时间对结果集筛选
 */

 format.create({
    label: '平均耗时最多的函数列表',

    filteredData: [],

    filter: function (path, info){
        //TODO:添加忽略函数的策略
        var rs = info.runtime,
            sum = utils.sumArray(rs);

        this.filteredData.push([path, sum>0 ? utils.formatDecimal((sum/rs.length), 2) : 0]);
    },

    /*
     *获取当前筛选器的结果
     *@return {Object} header是结果的标题字段[字段名, 宽度百分比]，data是结果集
     */
    getData: function (){
        var ret = {
            header: [['函数名称', 75], ['平均耗时(ms)', 25]],
            data: this.filteredData.sort(function (a, b){
                return b[1] - a[1]
            })
        };

        this.filteredData = [];
        return ret;
    }
 });
/*
 *定义一个格式化筛选器
 *按照函数平均调用时间对结果集筛选
 */

 format.create({
    label: '单次调用耗时最长的函数列表',

    filteredData: [],

    filter: function (path, info){
        this.filteredData.push([path, utils.getMaxFromArray(info.runtime)]);
    },

    /*
     *获取当前筛选器的结果
     *@return {Object} header是结果的标题字段[字段名, 宽度百分比]，data是结果集
     */
    getData: function (){
        var ret = {
            header: [['函数名称', 75], ['耗时(ms)', 25]],
            data: this.filteredData.sort(function (a, b){
                return b[1] - a[1]
            })
        };

        this.filteredData = [];
        return ret;
    }
 });
/*
 *展示结果集的封装表格类
 *
 */

var TableView = {
    formatHTML: function (tableData){
        var html = [],
            tdata, thead;

        if ((tdata = tableData.data).length > 0){
            html.push('<table>');
            if ((thead = tableData.header).length > 0){
                html.push('<tr>');
                utils.each(thead, function (item){
                    html.push('<th' + (item[1] ? ' width='+item[1]+'%' : '') + '>' + item[0] +'</th>');
                });
                html.push('</tr>');
            }
            utils.each(tdata.slice(0, preference.displayMaxLine), function (item){
                html.push('<tr>');
                utils.each(item, function (it){
                    html.push('<td>' + it + '</td>');
                });
                html.push('</tr>');
            });
        }

        return html.join('');
    }
};
/*
 *界面控制器
 *组织界面的展现形式和交互
 */

var dashboard = function (){
    var _html = '<div class="zoptimizer-header"><span id="zoptimizer-winToggle"></span>ZOptimizer让脚本运行时更高效！</div>'+
               '<div class="zoptimizer-content-wrap" id="zoptimizer-searchbar"><label forid="zoptimizer-data-input">监测对象：</label><input id="zoptimizer-data-input" class="zoptimizer-comp" type="text" placeholder="输入要监测的对象" /><input type="button" class="zoptimizer-comp" id="zoptimizer-input-confirm" value="确定" /></div>'+
               '<div id="zoptimizer-dataset"><div class="zoptimizer-content-wrap" id="zoptimizer-filterbar">筛选方式：<select id="zoptimizer-filter-type" class="zoptimizer-comp"></select></div>'+
               '<div class="zoptimizer-content-wrap" id="zoptimizer-resultbar"></div></div>',

        inlineStyle = ['.zoptimizer-wrapper{text-align:left;position:fixed;right:0;bottom:0;border:1px solid #666;width:330px;font-size:12px;line-height:1.8;background-color:#fff;color:#333;overflow:hidden;z-index:9999999}',
        '.zoptimizer-wrapper *{padding:0;margin:0;}',
        '.zoptimizer-wrapper .minimize{display:block;float:right;margin:10px 10px 0 0;width:20px;height:3px;border:5px solid #666;background-color:#fff;cursor:pointer;}',
        '.zoptimizer-wrapper .maximize{display:block;float:right;width:20px;height:8px;margin:10px 10px 0 0;border:2px solid #fff;cursor:pointer;}',
        '.zoptimizer-wrapper input{vertical-align:top;}',
        '.zoptimizer-wrapper select{vertical-align:top;}',
        '.zoptimizer-header{background-color:#666;height:36px;color:#fff;font:600 14px/2.5 georgia, arial, sans-serif;text-indent:1em;}',
        '.zoptimizer-content-wrap{padding:10px 6px;}',
        '.zoptimizer-comp{border:1px solid #666;background-color:#fff;color:#333;}',
        '#zoptimizer-dataset{display:none;}',
        '#zoptimizer-data-input{width:190px;height:20px;}',
        '#zoptimizer-input-confirm:hover{color:#fff;background-color:#666;}',
        '#zoptimizer-input-confirm{width:50px;height:22px;cursor:pointer;margin-left:10px;}',
        '#zoptimizer-filter-type{height:22px;width:190px;}',
        '#zoptimizer-resultbar table{border:1px solid #d3d2d2;border-collapse:collapse;width:100%;table-layout:fixed;}',
        '#zoptimizer-resultbar th{text-align:center;height:26px;line-height:26px;background-color:#f3f2f2;word-break;break-all;word-wrap:break-word;border:1px solid #d3d2d2;}',
        '#zoptimizer-resultbar td{text-align:left;padding:0 4px;word-break;break-all;word-wrap:break-word;border:1px solid #d3d2d2;}'];

    return ObserverFactory.create({
        init: function (formatLabels){
            var me = this;

            utils.domReady(function (){
                var wrap = me.wrap = document.createElement('div'),
                    $ = utils.$;

                wrap.className = 'zoptimizer-wrapper';
                wrap.id = 'zoptimizer';
                wrap.innerHTML = _html;
                document.body.appendChild(wrap);
                utils.injectCSS2Page(inlineStyle);

                me.dataInput = $('zoptimizer-data-input');
                me.inputConfirm = $('zoptimizer-input-confirm');
                me.filterType = $('zoptimizer-filter-type');
                me.filterResult = $('zoptimizer-resultbar');
                me.datasetWrap = $('zoptimizer-dataset');
				me.winToggle = $('zoptimizer-winToggle');

                utils.DomEvent.on(me.inputConfirm, 'click', function (){
                    me.startCheck(me.dataInput.value, me.filterType.value);
                });

                utils.DomEvent.on(me.dataInput, 'keydown', function (e){
                    if(e.keyCode===13 && utils.trim(me.dataInput.value)){
                        me.startCheck(me.dataInput.value, me.filterType.value);
                    }
                });

                me.setFilterTypes(formatLabels);
            });
        },

        startCheck: function (objName, filterType){
            this.datasetWrap.style.display = 'block';
			this.dataInput.parentNode.replaceChild(document.createTextNode(this.dataInput.value), this.dataInput);
			this.inputConfirm.style.display = 'none';
            zop.check(objName);
            this.filterTypeChange(filterType);
			if (dataset.getFuncInfosLength()>0){
				this.winToggle.className = 'minimize';
				var me = this;
				utils.DomEvent.on(this.winToggle, 'click', function(e){
					if (this.className === 'minimize'){
						me.datasetWrap.style.display = 'none';
						this.className = 'maximize';
					}else{
						me.datasetWrap.style.display = 'block';
						this.className = 'minimize';
                        me.filterTypeChange(me.filterType.value);
					}
				});
			}
        },

        setFilterTypes: function (formatLabels){
            var slt = this.filterType,
                frg = document.createDocumentFragment(),
                me = this,
                tmp;

            utils.foreach(formatLabels, function (k, item){
                tmp = document.createElement('option');
                tmp.innerHTML = item.label;
                tmp.value = k;
                frg.appendChild(tmp);
            });
            slt.appendChild(frg);
            utils.DomEvent.on(slt, 'change', function (){
                this.disabled = true;
                me.filterTypeChange(this.value);
                this.disabled = false;
            });
        },

        filterTypeChange: function (type){
            this.datasetWrap.style.display!=='none' && (this.filterResult.innerHTML = TableView.formatHTML( format.getFilteredData(type) ) || '暂无结果');
        }
    });
}();

dashboard.init(format.getFormatByName());

zop.addListener('after-function-exec', function (){
    var timer;

    return function (){
        timer && window.clearTimeout(timer);
        timer = setTimeout(function (){
            dashboard.filterTypeChange(dashboard.filterType.value);
        }, 50);
    }
}());})();