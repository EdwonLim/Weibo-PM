(function(module) {

    var fs = require('fs'),
        crypto = require('crypto'),
        request = require('request'),
        NodeMailer = require('nodemailer'),
        OpenAPI = require('../network/OpenAPI'),
        Message = require('../model/Message'),
        FormData = require('form-data'),
        parseParam = require('../util/ParseParam'),
        user = require('../UserInfo');

    var TAG = 'Token';

    var sha1 = function sha1(str) {
        var md5sum = crypto.createHash('sha1');
        md5sum.update(str, 'uft-8');
        str = md5sum.digest('hex');
        return str;
    };

    var saveFile = function(fid, listener) {
        var path = 'tmp/tmp_' + new Date().getTime().toString(16) + '.png',
            tmp = fs.createWriteStream(path);
        tmp.on('close', function() {
            listener && listener(path);
        });
        request({
            url : 'http://upload.api.weibo.com/2/mss/msget?source=' + user.get('appkey') + '&fid=' + fid,
            auth : {
                user : user.get('username'),
                pass : user.get('password'),
                sendImmediately : true
            }
        }).pipe(tmp);
    };

    var MailBox = function(name) {
        this.name = name;
        this.key = [];
        this.type = '';
        this.data = {};
        this.msgs = [];
        this.content = {
            success : '',
            notSupport : ''
        }
    };

    MailBox.prototype = {
        setKey : function(key) {
            this.key = [].concat(key);
        },
        setType : function(type, data) {
            if (type == 'message') {
                this.type = type;
                this.data = [].concat(data);
            } else if (type == 'mail') {
                this.type = type;
                this.data.user = data.user;
                this.data.toUser = data.toUser;
                this.data.sender = NodeMailer.createTransport("SMTP", {
                    host : data.host,
                    secureConnection: data.secureConnection,
                    port: data.port,
                    auth: {
                        user: data.user,
                        pass: data.pass
                    }
                });
            } else if (type == 'server') {
                this.type = type;
                this.data.url = data.url;
                this.data.token = data.token;
            }
        },
        setContent : function(content) {
            this.content = parseParam(this.content, content);
        },
        onMessage : function(msg, reply, floor) {
            var me = this;
            if (this.key.indexOf(floor) > -1) {
                if (msg.type == 'text' || msg.type == 'image') {
                    this.msgs.push(msg);
                    OpenAPI.get('users/show', 'uid=' + msg.fromUid, function(user) {
                        if (me.type == 'message') {
                            me.data.forEach(function(uid) {
                                new Message().setUid(uid).setText('@' + user.screen_name + ' ' + me.key[0] + ': ' + msg.text).send();
                                if (msg.type == 'image') {
                                    setTimeout(function() {
                                        new Message().setUid(uid).setImageId(msg.data.tovfid).send();
                                    }, 100);
                                }
                            });
                        } else if (me.type == 'mail') {
                            var options = {
                                from : me.data.user,
                                to : me.data.toUser,
                                subject : '【' + me.key[0] + '】来自微博用户@' + user.screen_name,
                                headers : {'X-Laziness-level': 1000},
                                text : msg.text
                            };
                            if (msg.type == 'image') {
                                saveFile(msg.data.tovfid, function(path) {
                                    options.attachments = [
                                        {
                                            fileName : 'attachment.png',
                                            filePath : path,
                                            cid : new Date().getTime().toString(16)
                                        }
                                    ];
                                    me.data.sender.sendMail(options, function() {
                                        fs.unlink(path);
                                    });
                                });
                            } else {
                                me.data.sender.sendMail(options, function() {});
                            }
                        } else if (me.type == 'server') {
                            var form = new FormData(),
                                timestamp = new Date().getTime();
                            form.append('tag', TAG);
                            form.append('timestamp', timestamp);
                            form.append('token', sha1(TAG + me.token + timestamp));
                            form.append('title', me.name);
                            form.append('uid', msg.fromUid);
                            form.append('nick', user.screen_name);
                            form.append('content', msg.text);
                            if (msg.type == 'image') {
                                saveFile(msg.data.tovfid, function(path) {
                                    form.append('file', fs.createReadStream(path));
                                    form.submit(me.data.url, function(err, res) {
                                        fs.unlink(path);
                                        res.resume();
                                    });
                                });
                            } else {
                                form.submit(me.data.url);
                            }
                        }
                    });
                    this.content.success && reply.setText(this.content.success).send();
                    this.resetUser(msg.fromUid);
                } else {
                    this.content.notSupport && reply.setText(this.content.notSupport).send();
                }
            }
        },
        getAllMsg : function() {
            return this.msgs;
        }
    };

    module.exports = MailBox;

})(module);