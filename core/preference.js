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