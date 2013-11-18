/**
 * Status
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    var fs = require('fs'),
        FormData = require('form-data'),
        OpenAPI = require('./OpenAPI'),
        user = require('../UserInfo');

    module.exports = function(data, listener) {
        if (data && data.text) {
            if (data.pic) {
                var form = new FormData(),
                    path = '/2/statuses/upload.json';
                form.append('source', user.get('appkey'));
                form.append('status', encodeURIComponent(data.text));
                form.append('pic', fs.createReadStream(data.pic));
                if (data.visible) {
                    form.append('visible', data.visible);
                }
                form.submit({
                    host: 'api.weibo.com',
                    path: path,
                    auth: user.get('username') + ':' + user.get('password')
                }, function(err, res) {
                    var rs = '';
                    res.on('data', function(chunk){
                        rs += chunk + '';
                    });
                    res.on('end', function(){
                        listener && listener(JSON.parse(rs));
                    });
                    res.resume();
                });
            } else {
                var param = 'status=' + encodeURIComponent(data.text);
                if (data.visible) {
                    param += '&visible=' +  data.visible;
                }
                OpenAPI.post('statuses/update', param, function(data) {
                    listener && listener(data);
                });
            }
        }
    };

})(module);