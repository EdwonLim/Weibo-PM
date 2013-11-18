/**
 * Open API
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    var http = require('http'),
        user = require('../UserInfo');

    var BaseUrl = '/2/'

    module.exports = {
        post : function(path, data, listener) {
            var url = BaseUrl + path + '.json';

            data += (data ? '&' : '') + 'source=' + user.get('appkey');

            var req = http.request({
                hostname : 'api.weibo.com',
                port : 80,
                path : url,
                auth : user.get('username') + ':' + user.get('password'),
                method : 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length
                }
            }, function(res) {
                var rs = '';
                res.on('data', function (chunk) {
                    rs += chunk + '';
                });
                res.on('end', function () {
                    listener && listener(JSON.parse(rs));
                });
            });
            req.on('error', function(e) {
                listener && listener({
                    error_code : 1,
                    error : e.getMessage()
                });
            });
            req.write(data);
            req.end();
        },
        get : function(path, data, listener) {
            var url = BaseUrl + path + '.json?source=' + user.get('appkey') + '&' + data;

            var req = http.request({
                hostname : 'api.weibo.com',
                port : 80,
                path : url,
                auth : user.get('username') + ':' + user.get('password'),
                method : 'GET'
            }, function(res) {
                var rs = '';
                res.on('data', function (chunk) {
                    rs += chunk + '';
                });
                res.on('end', function () {
                    listener && listener(JSON.parse(rs));
                });
            });
            req.on('error', function(e) {
                listener && listener({
                    error_code : 1,
                    error : e.getMessage()
                });
            });
            req.end();
        }
    }

})(module);