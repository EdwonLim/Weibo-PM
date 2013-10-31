(function(module) {

    var http = require('http'),
        user = require('./UserInfo.js');

    var listener = null, timer = null, msg_id = 0, options = {};

    var getMessage = function() {

        var url = options.path + (msg_id ? '&since_id=' + msg_id : '');
        var req = http.request({
            hostname : 'm.api.weibo.com',
            port : 80,
            path : url,
            auth : options.auth,
            method : 'GET'
        }, function(res){
            res.on('data', function (chunk) {
                var msg = JSON.parse(chunk);
                msg_id = msg.id;
                listener && listener(msg);
            });

            res.on('end', function () {
                getMessage();
            });
        });
        req.end();

        timer && clearTimeout(timer);
        timer = setTimeout(function(){
            req.abort();
        }, 4 * 60 * 1000);
    };

    var httpStart = function() {
        options = {
            path : '/2/messages/receive.json?uid=' + user.get('uid') + '&source=' + user.get('appkey'),
            auth : user.get('username') + ':' + user.get('password')
        };
        getMessage();
    };

    module.exports = function(callback) {
        if (!listener) {
            httpStart();
        }
        listener = callback;
    };

})(module);