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

