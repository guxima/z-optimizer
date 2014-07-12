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