(function(module) {

    var http = require('http'),
        url = require('url'),
        fs = require('fs'),
        formidable = require('formidable'),
        querystring = require('querystring'),
        Buffer = require('buffer').Buffer,
        FormData = require('form-data'),
        Message = require('../model/Message'),
        OpenAPI = require('../network/OpenAPI'),
        user = require('../UserInfo');

    var appid, secret, access_token;

    var skipToken = false;

    var errorMsg = '{"errcode":60000,"errmsg":"error"}';

    var timer, timeout = 7200 * 1000;
    var getToken = function() {
        timer && clearTimeout(timer);
        access_token = parseInt(Math.random() * 100000000000000).toString(36) + parseInt(Math.random() * 100000000000000).toString(36);
        timer = setTimeout(function() {
            access_token = '';
        }, timeout);
        return access_token;
    };

    var onRequest = function(request, response) {
        var urlObj = url.parse(request.url),
            param = querystring.parse(urlObj.query);
        switch (urlObj.pathname) {
            case '/cgi-bin/token' :
                if (param.grant_type == "client_credential" && param.appid == appid && param.secret == secret) {
                    response.end(JSON.stringify({
                        access_token : getToken(),
                        expires_in : 7200
                    }));
                } else {
                    response.end(errorMsg, 'utf-8');
                }
                break;
            case '/cgi-bin/media/upload' :
                if (skipToken || (access_token && urlObj.access_token == access_token)) {
                    var type = urlObj.type;
                    try {
                        var fileData = null;
                        var iForm = new formidable.IncomingForm({
                            callback : function(buffer) {
                                if (fileData) {
                                    fileData.concat(buffer);
                                } else {
                                    fileData = buffer;
                                }
                            }
                        });

                        iForm.parse(request, function(err, fields, files) {
                            var media = files.media;
                            var form = new FormData();
                            form.append('file', fileData, {
                                filename: media.name,
                                contentType: media.type
                            });
                            form.submit({
                                host : 'upload.api.weibo.com',
                                path : '/2/mss/upload.json?tuid=' + user.get('uid') + '7&source=' + user.get('appkey'),
                                auth : user.get('username') + ':' + user.get('password')
                            }, function(err, res) {
                                var rs = '';
                                res.on('data', function(chunk){
                                    rs += chunk + '';
                                });
                                res.on('end', function() {
                                    try {
                                        rs = JSON.parse(rs);
                                        response.end(JSON.stringify({
                                            type : type,
                                            media_id : rs.vfid,
                                            created_at : parseInt(new Date() / 1000)
                                        }), 'utf-8');
                                    } catch (e) {
                                        response.end(errorMsg, 'utf-8');
                                    }
                                });
                                res.resume();
                            });
                        });
                    } catch (e) {
                        response.end(errorMsg, 'utf-8');
                    }
                } else {
                    response.end(errorMsg, 'utf-8');
                }
                break;
            case '/cgi-bin/media/get':
                if (skipToken || (access_token && urlObj.access_token == access_token)) {
                    var fid = param.media_id;
                    http.request({
                        hostname : 'upload.api.weibo.com',
                        path : '/2/mss/msget?source=' + user.get('appkey') + '&fid=' + fid,
                        auth : user.get('username') + ':' + user.get('password')
                    }, function(res) {
                        res.on('data', function(chunk) {
                            response.write(chunk, 'utf-8');
                        });
                        res.on('end', function() {
                            response.end();
                        });
                    }).end();
                } else {
                    response.end(errorMsg, 'utf-8');
                }
                break;
            case '/cgi-bin/media/pic':
                if (skipToken || (access_token && urlObj.access_token == access_token)) {
                    var fid = param.media_id;
                    http.request({
                        hostname : 'upload.api.weibo.com',
                        path : '/2/mss/msget?source=' + user.get('appkey') + '&fid=' + fid,
                        auth : user.get('username') + ':' + user.get('password')
                    }, function(res) {
                        response.writeHead(200, {
                            'Content-Type': 'image/jpeg'
                        });
                        res.on('data', function(chunk) {
                            response.write(chunk, 'utf-8');
                        });
                        res.on('end', function() {
                            response.end();
                        });
                    }).end();
                } else {
                    response.end(errorMsg, 'utf-8');
                }
                break;
            case '/cgi-bin/message/custom/send':
                if (skipToken || (access_token && urlObj.access_token == access_token)) {
                    var rs = '';
                    request.on('data', function(chunk) {
                        rs += chunk + '';
                    });
                    request.on('end', function() {
                        try {
                            rs = JSON.parse(rs);
                            var msg = new Message().setUid(rs.touser);
                            switch (rs.msgtype) {
                                case 'text' :
                                    msg.setText(rs.text.content);
                                    break;
                                case 'image' :
                                    msg.setImageId(rs.image.media_id);
                                    break;
                                case 'news' :
                                    var arts = rs.data.articles;
                                    arts.forEach(function(item) {
                                        msg.addArticle(item.title, item.description, item.picurl, item.url);
                                    });
                                    break;
                                default :
                                    return;
                            }
                            msg.error(function() {
                                response.end(errorMsg, 'utf-8');
                            }).send();
                        } catch (e) {
                            response.end(errorMsg, 'utf-8');
                        }
                    });
                } else {
                    response.end(errorMsg, 'utf-8');
                }
                break;
            case '/cgi-bin/user/info' :
                if (skipToken || (access_token && urlObj.access_token == access_token)) {
                    var uid = param.openid;
                    OpenAPI.get('users/show', 'uid=' + uid, function(data) {
                        response.end(JSON.stringify({
                            subscribe : data.follow_me ? 1 : 0,
                            openid : data.idstr,
                            nickname : data.screen_name,
                            sex : data.gender == 'm' ? 1 : 0,
                            language : data.lang,
                            city : data.location.split(' ')[0],
                            province : data.location.split(' ')[1],
                            country : '中国',
                            headimgurl : data.avatar_large,
                            subscribe_time : parseInt(new Date() / 1000)
                        }), 'utf-8');
                    });
                } else {
                    response.end(errorMsg, 'utf-8');
                }
                break;
            default :
                response.end();
        }
    };

    module.exports = function(id, st, port, skip) {
        appid = id;
        secret = st;
        skipToken = !!skip;
        try {
            http.createServer(onRequest).listen(parseInt(port));
        } catch (e) {}
    };

})(module)