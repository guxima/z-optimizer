(function (){
    var filelist = [
        '../core/utils.js',
        '../core/observer-factory.js',
        '../core/zop.js',
        '../core/dataset.js',
        '../core/preference.js',

        '../formats/format.js',
        '../formats/topx-used-method.js',
        '../formats/topx-average-duration-method.js',
        '../formats/topx-duration-method.js',

        '../ui/tableview.js',
        '../ui/dashboard.js'
    ];

    function loadJs(){
        var frag = document.createElement('script');
        frag.type = 'text/javascript';
        frag.src = filelist.shift();
        frag.onload = frag.onreadystatechange = function (){
            (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') && filelist.length > 0 && loadJs()
        }
        document.getElementsByTagName('head')[0].appendChild(frag);
    }

    loadJs(filelist);

})();