(function(module) {

    var fs = require('fs'),
        Mention = require('../manager/MentionManager'),
        Message = require('../model/Message'),
        Status = require('../network/Status'),
        OpenAPI = require('../network/OpenAPI'),
        parseParam = require('../util/ParseParam');

    var RepostDiscount = function(name) {
        this.name = name;
        this.filter = [];
        this.key = [];
        this.statusId = '';
        this.uids = [];
        this.num = 0;
        this.content = {
            repostSuccess : '',
            success : '',
            repeat : '',
            none : ''
        };
        this.logFilePath = '';
    };

    RepostDiscount.prototype = {
        start : function(data) {
            var me = this;
            Status(data, function(data) {
                me.statusId = data.mid;
                Mention.addRepostListener(data.mid, function(user) {
                    me.filter.push(user.uid);
                    me.content.repostSuccess && new Message().setUid(user.uid).setText(me.content.repostSuccess).send();
                });
            });
        },
        setConf : function(startTime, endTime, data) {
            var me = this;
            this.startTime = new Date(startTime).getTime();
            setTimeout(function() {
                me.start(data);
            }, this.startTime - new Date());
            this.endTime = new Date(endTime).getTime();
            setTimeout(function() {
                me.end();
            }, this.endTime - new Date());
        },
        setKey : function(keys) {
            this.key = [].concat(keys);
        },
        setContent : function(content) {
            this.content = parseParam(this.content, content);
        },
        setNum : function(num) {
            this.num = parseInt(num);
        },
        setLogFile : function(path) {
            this.logFilePath = path;
        },
        onMessage : function(msg, reply) {
            if (msg.type == 'text' && this.key.indexOf(msg.text) > -1) {
                if (this.filter.indexOf(msg.fromUid) > -1) {
                    if (!this.num || this.uids.length < this.num) {
                        if (this.uids.indexOf(msg.fromUid) > -1) {
                            this.content.repeat && reply.setText(this.content.repeat).send();
                        } else {
                            this.uids.push(msg.fromUid);
                            this.content.success && reply.setText(this.content.success).send();
                        }
                    } else {
                        this.content.none && reply.setText(this.content.none).send();
                    }
                }
            }
        },
        end : function() {
            var me = this, total = 0, items = [];
            var execRs = function(index, uid, nick) {
                total --;
                items.push([index + 1, uid, nick]);
                if (total == 0) {
                    items.sort(function(t1, t2) {
                        return t1[0] - t2[0];
                    });
                    items.unshift(['No', '用户id', '用户昵称']);
                    var content = xlsx.build({
                        worksheets: [{
                            name : '获得优惠劵的用户名单',
                            data : items
                        }]
                    });
                    me.logFilePath && fs.writeFileSync(me.logFilePath, content);
                }
            };

            Mention.removeRepostListener(this.statusId);

            this.uids.forEach(function(uid, index) {
                total ++;
                OpenAPI.get('users/show', 'uid=' + uid, function(data) {
                    execRs(index, uid, data.screen_name || uid);
                });
            });
            this.destory && this.destory();
        }
    };

    module.exports = RepostDiscount;

})(module)