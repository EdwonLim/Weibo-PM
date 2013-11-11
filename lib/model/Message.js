(function(module) {

    var send = require('../network/MessageSend'),
        reply = require('../network/MessageReply');

    var METHOD = {
        REPLY : 1,
        SEND : 2
    };

    var TYPE = {
        TXT : 'text',
        IMG : 'image',
        ART : 'articles',
        POS : 'position'
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

            var execResult = function(result) {
                me[result.error ? 'errorCallback' : 'successCallback'](result)
            };

            if (this.method) {
                var data = {};
                switch (this.type) {
                    case TYPE.TXT :
                        data.text = this.text;
                        break;
                    case TYPE.IMG :
                        data.vfid = this.vfid;
                        data.tovfid = this.tovfid;
                        break;
                    case TYPE.ART :
                        data.articles = this.articles;
                        break;
                    case TYPE.POS :
                        data.longitude = this.longitude;
                        data.latitude = this.latitude;
                        break;
                    default :
                        return;
                }
                if (this.method == METHOD.REPLY) {
                    reply(this.id, this.type, data, execResult);
                } else {
                    send(this.uid, this.type, data, execResult);
                }
            }
            return this;
        }
    };

    module.exports = Message;

})(module);