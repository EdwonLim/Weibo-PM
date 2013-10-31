(function(module) {

    var http = require('http'),
        querystring = require('querystring'),
        user = require('./UserInfo.js');

    module.exports = function(id, type, data, listener) {

        var post_data = querystring.stringify({
            source : user.get('appkey'),
            id : id,
            type : type,
            data : JSON.stringify(data)
        });

        var req = http.request({
            hostname : 'm.api.weibo.com',
            port : 80,
            path : '/2/messages/reply.json',
            auth : user.get('username') + ':' + user.get('password'),
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        }, function(res){
            res.on('data', function (chunk) {
                listener && listener(JSON.parse('' + chunk));
            });
        });
        req.on('error', function(e) {
            listener && listener({
                error_code : 1,
                error : e.getMessage()
            });
        });
        req.write(post_data);
        req.end();
    };

})(module)