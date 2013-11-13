(function(module) {

    var fs = require('fs'),
        xlsx = require('node-xlsx'),
        OpenAPI = require('../network/OpenAPI'),
        parseParam = require('../util/ParseParam');

    var Process = function() {
        this.startTime = 0;
        this.endTime = 0;

        this.key = [];

        this.content = {
            beforeEvent : '',
            afterEvent : '',
            repeat : '',
            success : '',
            none : ''
        };

        this.logFilePath = '';

        this.uids = [];

        this.nids = [];
    };

    Process.prototype = {
        setTime : function(startTime, endTime) {
            var me = this;
            this.startTime = new Date(startTime).getTime();
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
        setPrize : function(name, total) {
            this.name = name;
            this.total = total;
        },
        setLogFile : function(path) {
            this.logFilePath = path;
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
                            name : '秒杀到的用户名单',
                            data : items
                        }, {
                            name : '未秒杀到的用户id',
                            data : [['No', '用户id']].concat(me.nids.map(function(uid, index){
                                return [index + 1, uid];
                            }))
                        }]
                    });
                    me.logFilePath && fs.writeFileSync(me.logFilePath, content);
                }
            };

            this.uids.forEach(function(uid, index) {
                total ++;
                OpenAPI.get('users/show', 'uid=' + uid, function(data) {
                    execRs(index, uid, data.screen_name || uid);
                });
            });
            this.destory && this.destory();
        },
        onMessage : function(msg, reply) {
            if (msg.type == 'text' && this.key.indexOf(msg.text) > -1) {
                if (msg.time < this.startTime) {
                    this.content.beforeEvent && reply.setText(this.content.beforeEvent).send();
                } else if (msg.time > this.endTime) {
                    this.content.afterEvent && reply.setText(this.content.afterEvent).send();
                } else if (this.total > 0) {
                    if (this.uids.indexOf(msg.fromId) > -1) {
                        this.content.repeat && reply.setText(this.content.repeat).send()
                    } else {
                        this.total --;
                        this.uids.push(msg.fromUid);
                        this.content.success && reply.setText(this.content.success.replace('NAME', this.name)).send();
                    }
                } else {
                    if (this.nids.indexOf(msg.fromUid) == -1) {
                        this.nids.push(msg.fromUid);
                    }
                    this.content.none && reply.setText(this.content.none).send()
                }
                return false;
            }
        }
    };

    module.exports = Process;

})(module);