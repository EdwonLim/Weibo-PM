/**
 * Upload
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    var FormData = require('form-data'),
        http = require('http'),
        fs = require('fs'),
        request = require('request'),
        user = require('../UserInfo');

    function upload(options, listener) {
        var form = new FormData();

        var submit = function(path) {
            form.submit({
                host: 'upload.api.weibo.com',
                path: '/2/mss/upload.json?tuid=' + options.toUid + '&source=' + user.get('appkey'),
                auth: user.get('username') + ':' + user.get('password')
            }, function(err, res) {
                res.on('data', function(chunk){
                    listener(JSON.parse(chunk));
                    path && fs.unlink(path);
                });
                res.resume();
            });
        };

        if (options.filePath) {
            form.append('file', fs.createReadStream(options.filePath));
            submit();
        } else if (options.url) {
            form.append('file', request(options.url));
            submit();
        } else if (options.fid) {
            var path = 'tmp/tmp_' + new Date().getTime().toString(16) + '.png',
                tmp = fs.createWriteStream(path);
            tmp.on('close', function() {
                form.append('file', fs.createReadStream(path));
                submit(path);
            });
            request({
                url : 'http://upload.api.weibo.com/2/mss/msget?source=' + user.get('appkey') + '&fid=' + options.fid,
                auth : {
                    user : user.get('username'),
                    pass : user.get('password'),
                    sendImmediately : true
                }
            }).pipe(tmp);
        } else if (options.qrCode) {
            form.append('file', request('http://chart.apis.google.com/chart?chs=280x280&cht=qr&chld=H|0&chl=' + options.qrCode));
            submit();
        }
    }

    module.exports = function(filePath, listener) {
        upload(filePath, listener);
    };

})(module)