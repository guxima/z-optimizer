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