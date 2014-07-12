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