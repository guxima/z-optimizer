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

