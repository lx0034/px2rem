var fs = require("fs");
// var pwd = process.cwd();

// console.log(process.argv);

var HtmlReadpath  = './Mobile/main.html',   // 读目标html文件
    HtmlWritepath = './Mobile/creat.html',  // 写入新的html文件
    CssReadpath   = './Mobile/main.css',    // 读目标css文件
    CssWritepath  = 'Mobile/creat.css';     // 写入新的css文件


// 读DPR值
new Promise(function (resolve, reject) {
    console.log('inputDPR:');
    gets(function (result) {
        var DPR = parseInt( result.replace('\n','') ) || 2;
        resolve( DPR );
    });
})
.then(function (DPR) {
    // 读基准大小
    return new Promise(function (resolve, reject) {
        console.log('inputBaseSize:');
        gets(function (result) {
            var BaseSize = parseInt( result.replace('\n', '') ) || 12;
            resolve({DPR, BaseSize});
        });
    });
})
.then(function (obj) {
    // 读基准屏幕宽度
    return new Promise(function (resolve, reject) {
        var DPR = obj.DPR,
            BaseSize = obj.BaseSize;

        console.log('inputBaseWidth:');
        gets(function (result) {
            var BaseWidth = parseInt( result.replace('\n', '') ) || 375;
            resolve({DPR, BaseSize, BaseWidth});
        });
    });
})
.then(function (obj) {
    // 读html文件
    return new Promise(function (resolve, reject) {
        fs.readFile(HtmlReadpath, {encoding: 'UTF-8'}, function (err, data) {
            var DPR = obj.DPR,
                BaseWidth = obj.BaseWidth,
                BaseSize = obj.BaseSize;

            if ( err ) throw err;
            var str = "</title>"
            + "<script type='text/javascript'>"
            + "function fontSize (baseSize, baseWidth) {"
            + "var docEl = document.documentElement, "
            + "resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',"
            + "recalc = function () {"
            + "var clientWidth = docEl.clientWidth;"
            + "if (!clientWidth) return;"
            + "docEl.style.fontSize = baseSize * (clientWidth / baseWidth) + 'px';"
            + "};"
            + "if (!document.addEventListener) return;"
            + "window.addEventListener(resizeEvt, recalc, false);"
            + "recalc();"
            + "};"
            + "fontSize("+ BaseSize +", "+ BaseWidth +");"
            + "</script>";
            data = data.replace(/<\/title>/, str);
            resolve({DPR, BaseSize, data});
        });
    })
})
.then(function (obj) {
    // 写html文件
    return new Promise(function (resolve, reject) {
        var DPR = obj.DPR,
            BaseSize = obj.BaseSize;

        fs.writeFile(HtmlWritepath, obj.data, function (err) {
            if ( err ) throw err;
            else console.log('write HTML success!');
            resolve({DPR, BaseSize});
        });
    })
})
.then(function (obj) {
    // 读css文件
    return new Promise(function (resolve, reject) {
        var DPR = obj.DPR,
            BaseSize = obj.BaseSize;

        fs.readFile(CssReadpath, {encoding: 'UTF-8'}, function (err, data) {

            if (err) throw err;
            data = data.replace(/:\s*([0-9]+)px|:\s*([0-9]+)_px/gi, function (all, $1, $2) {
                if ( $1 ) {
                    return ': '+ ($1/obj.DPR)/obj.BaseSize +'rem';
                } else if ( $2 ) {
                    return ': '+ $2 +'px';
                }
            });
            resolve({data});
        });
    })
})
.then(function (obj) {
    // 写css文件
    return new Promise(function (resolve, reject) {
        fs.writeFile(CssWritepath, obj.data, function (err) {
            if (err) throw err;
            console.log('write CSS success!');
        });
    })
});


function gets(cb){
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', function(chunk) {
     process.stdin.pause();
     cb(chunk);
  });
}

// then(function () {
//     var defer = when.defer();

//     setTimeout(function () {
//         defer.resolve();
//     });

//     return defer.promise;
// });


