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