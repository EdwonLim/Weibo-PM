/**
 * Message Entity
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    var upload = require('../network/Upload'),
        send = require('../network/MessageSend'),
        reply = require('../network/MessageReply'),
        Debug = require('../util/Debug');

    var METHOD = {
        REPLY : 1,
        SEND : 2
    };

    var TYPE = {
        TXT : 'text',
        IMG : 'image',
        ART : 'articles',
        POS : 'position',
        PAT : 'path',
        URL : 'url',
        FID : 'fid',
        QRC : 'qrCode'
    };

    var Message = function() {
        this.method = 0;
        this.type = TYPE.TXT;
        this.id = '';
        this.uid = '';
        this.text = '';
        this.articles = [];
        this.longitude = '';
        this.latitude = '';
        this.vfid = '';
        this.tovfid = '';
        this.url = '';
        this.path = '';
        this.fid = '';
        this.qrCode = '';
        this.successCallback = function(){};
        this.errorCallback = function(){};
    };

    Message.prototype = {
        setId : function(id) {
            this.method = METHOD.REPLY;
            this.id = id.toString();
            return this;
        },
        setUid : function(uid) {
            this.method = METHOD.SEND;
            this.uid = uid.toString();
            return this;
        },
        setText : function(text) {
            this.type = TYPE.TXT;
            this.text = text.toString();
            return this;
        },
        setImage : function(vfid, tovfid) {
            this.type = TYPE.IMG;
            this.vfid = vfid;
            this.tovfid = tovfid;
            return this;
        },
        setImageUrl : function(url) {
            this.type = TYPE.URL;
            this.url = url;
            return this;
        },
        setImagePath : function(path) {
            this.type = TYPE.PAT;
            this.path = path;
            return this;
        },
        setImageId : function(fid) {
            this.type = TYPE.FID;
            this.fid = fid;
            return this;
        },
        setQrCode : function(qrCode) {
            this.type = TYPE.QRC;
            this.qrCode = qrCode;
            return this;
        },
        addArticle : function(name, summary, image, url) {
            this.type = TYPE.ART;
            this.articles.push({
                display_name : name.toString(),
                summary : summary.toString(),
                image : image.toString(),
                url : url.toString()
            });
            return this;
        },
        setPosition : function(longitude, latitude) {
            this.type = TYPE.POS;
            this.longitude = longitude;
            this.latitude = latitude;
            return this;
        },
        success : function(callback) {
            if (typeof callback === 'function') {
                this.successCallback = function(result) {
                    var data = {};
                    data.toUid = result.receiver_id;
                    data.fromId = result.sender_id;
                    data.time = new Date(result.created_at).getTime();
                    callback(data);
                };
            }
            return this;
        },
        error : function(callback) {
            if (typeof callback === 'function') {
                this.errorCallback = callback;
            }
            return this;
        },
        send : function() {
            var me = this;

            var sendMsg = function(ext) {
                if (me.method == METHOD.REPLY) {
                    Debug.log('Reply', 'ID: ' + me.id, me.type, JSON.stringify(ext));
                    if (me.text && me.type != TYPE.TXT) {
                        reply(me.id, TYPE.TXT, {text : me.text}, execResult);
                        setTimeout(function() {
                            reply(me.id, me.type, ext, execResult);
                        }, 500);
                    } else {
                        reply(me.id, me.type, ext, execResult);
                    }
                } else {
                    Debug.log('Send', 'UID: ' + me.uid, me.type, JSON.stringify(ext));
                    if (me.text && me.type != TYPE.TXT) {
                        send(me.uid, TYPE.TXT, {text : me.text}, execResult);
                        setTimeout(function() {
                            send(me.uid, me.type, ext, execResult);
                        }, 500);
                    } else {
                        send(me.uid, me.type, ext, execResult);
                    }
                }
            };

            var execResult = function(result) {
                me[result.error ? 'errorCallback' : 'successCallback'](result)
            };

            var execUpload = function(rs) {
                data.vfid = rs.vfid;
                data.tovfid = rs.tovfid;
                sendMsg(data);
            };

            if (this.method) {
                var data = {};
                switch (this.type) {
                    case TYPE.TXT :
                        data.text = this.text;
                        break;
                    case TYPE.IMG :
                        data.text = this.text;
                        data.vfid = this.vfid;
                        data.tovfid = this.tovfid;
                        break;
                    case TYPE.ART :
                        data.text = this.text;
                        data.articles = this.articles;
                        break;
                    case TYPE.POS :
                        data.text = this.text;
                        data.longitude = this.longitude;
                        data.latitude = this.latitude;
                        break;
                    case TYPE.FID :
                        this.type = TYPE.IMG;
                        upload({toUid : this.uid, fid : this.fid}, execUpload);
                        return;
                    case TYPE.URL :
                        this.type = TYPE.IMG;
                        upload({toUid : this.uid, url : this.url}, execUpload);
                        return;
                    case TYPE.QRC :
                        this.type = TYPE.IMG;
                        upload({toUid : this.uid, qrCode : this.qrCode}, execUpload);
                        return;
                    case TYPE.PAT :
                        this.type = TYPE.IMG;
                        upload({toUid : this.uid, filePath : this.path}, execUpload);
                        return;
                    default :
                        return;
                }
                sendMsg(data);
            }
            return this;
        }
    };

    module.exports = Message;

})(module);