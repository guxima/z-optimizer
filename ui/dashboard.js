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
}());