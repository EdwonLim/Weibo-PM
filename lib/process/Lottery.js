(function(module) {

    var fs = require('fs'),
        xlsx = require('node-xlsx'),
        Message = require('../model/Message'),
        OpenAPI = require('../network/OpenAPI'),
        parseParam = require('../util/ParseParam');

    var Process = function(name) {

        this.type = 'Lottery';

        this.name = name;

        this.startTime = 0;
        this.endTime = 0;

        this.key = [];

        this.prize = {};

        this.content = {
            'beforeEvent' : '',
            'repeat' : '',
            'onEvent' : '',
            'afterEvent' : '',
            'prize' : '',
            'none' : ''
        };

        this.uids = [];

        this.logFilePath = '';
    };

    Process.prototype = {
        setTime : function(startTime, endTime) {
            var me = this;
            this.startTime = new Date(startTime).getTime();
            this.endTime = new Date(endTime).getTime();
            setTimeout(function() {
                me.randomPrize();
            }, this.endTime - new Date());
        },
        setKey : function(keys) {
            this.key = [].concat(keys);
        },
        addPrize : function(name, text, num) {
            this.prize[name] = {
                text : text,
                num : num,
                uids : []
            }
        },
        setLogFile : function(path) {
            this.logFilePath = path;
        },
        setContent : function(content) {
            this.content = parseParam(this.content, content);
        },
        saveLog : function() {
            var me = this, total = 0, items = [];
            var execRs = function(index, key, uid, name) {
                total --;
                items.push([index, key, uid, name]);
                if (total == 0) {
                    items.sort(function(t1, t2) {
                        return t1[0] - t2[0];
                    });
                    items.unshift(['No', '类别', '用户id', '用户昵称']);
                    var content = xlsx.build({
                        worksheets: [{
                            name : '获奖名单',
                            data : items
                        }, {
                            name : '未获奖用户id',
                            data : [['No', '用户id']].concat(me.uids.map(function(uid, index){
                                return [index + 1, uid];
                            }))
                        }]
                    });
                    me.logFilePath && fs.writeFileSync(me.logFilePath, content);
                }
            };
            for (var key in this.prize) {
                this.prize[key].uids.forEach(function(uid) {
                    total ++;
                    (function(key, uid, index) {
                        OpenAPI.get('users/show', 'uid=' + uid, function(data) {
                            execRs(index, key, uid, data.screen_name || uid);
                        });
                    })(key, uid, total);
                });
            }
        },
        randomPrize : function() {
            var total = 0;
            for (var key in this.prize) {
                total += this.prize[key].num;
            }
            while (this.uids.length && total) {
                var num = parseInt(Math.random() * 11185272) % this.uids.length;
                for (var key in this.prize) {
                    if (this.prize[key].uids.length < this.prize[key].num) {
                        this.prize[key].uids.push(this.uids[num]);
                        this.uids.splice(num, 1);
                        total --;
                        break;
                    }
                }
            }
            if (this.content.prize) {
                var text = this.content.prize;
                for (var key in this.prize) {
                    var p = this.prize[key];
                    p.uids.forEach(function(uid) {
                        new Message().setUid(uid).setText(text.replace('NAME', key).replace('TEXT', p.text)).send();
                    });
                }
            }
            if (this.content.none) {
                var text = this.content.none;
                this.uids.forEach(function(uid) {
                    new Message().setUid(uid).setText(text).send();
                });
            }
            this.saveLog();
            this.destory && this.destory();
        },
        onMessage : function(msg, reply) {
            if (msg.type == 'text' && this.key.indexOf(msg.text) > -1) {
                if (msg.time < this.startTime) {
                    this.content.beforeEvent && reply.setText(this.content.beforeEvent).send();
                } else if (msg.time > this.endTime) {
                    this.content.afterEvent && reply.setText(this.content.afterEvent).send();
                } else if (this.uids.indexOf(msg.fromUid) > -1) {
                    this.content.repeat && reply.setText(this.content.repeat).send();
                } else {
                    this.uids.push(msg.fromUid);
                    this.content.onEvent && reply.setText(this.content.onEvent).send();
                }
            }
        },
        getResult : function() {
            return {
                name : this.name,
                prize : this.prize,
                uids : this.uids
            };
        }
    };

    module.exports = Process;

})(module);