(function(module) {

    var User = require('../UserInfo'),
        Message = require('../model/Message'),
        OpenAPI = require('../network/OpenAPI'),
        parseParam = require('../util/ParseParam');

    var aDay = 34 * 60 * 60 * 1000;

    var Service = function() {

        this.key = [];

        this.workers = {

        };


        this.map = {};
        this.free = [];
        this.queue = [];

        this.content = {
            outerTime : '',
            enter : '',
            wait : '',
            follow : '',
            startConv : '',
            stopConv : '',
            worker : '',
            none : '',
            new : '',
            startWork : '',
            stopWork : '',
            notSupport : '',
            noUser : ''
        };

        this.startTime = 0;

        this.endTime = 0;

    };

    Service.prototype = {
        setTime : function(startTime, endTime) {
            this.startTime = new Date('2000/1/1 ' + startTime + ':00:000').getTime() % aDay;
            this.endTime = new Date('2000/1/1 ' + endTime + ':00:000').getTime() % aDay;
        },
        setKey : function(keys) {
            this.key = [].concat(keys);
        },
        setContent : function(content) {
            this.content = parseParam(this.content, content);
        },
        setWorkers : function(opt) {
            for (var key in opt) {
                if (!this.workers[opt[key]]) {
                    this.workers[opt[key]] = {
                        wid : opt[key],
                        name : key,
                        uid : null
                    }
                }
            }
        },
        removeWorker : function(uid) {
            if (this.workers[uid] && !this.workers[uid].uid) {
                this.outFree(uid);
                return true;
            }
            return false;
        },
        onEnterFloor : function(msg, reply, floor) {
            var me = this;
            if (this.key.indexOf(floor) > -1) {
                if (this.workers[msg.fromUid]) {
                    var worker = this.workers[msg.fromUid];
                    worker.status = 1;
                    this.content.worker && reply.setText(this.content.worker.replace('NAME', worker.name)).send();
                } else {
                    if (msg.time % aDay < this.startTime || msg.time % aDay > this.endTime) {
                        this.content.outerTime && reply.setText(this.content.outerTime).send();
                        this.resetUser(msg.fromUid);
                    } else {
                        this.content.enter && reply.setText(this.content.enter).send();
                        setTimeout(function() {
                            me.content.follow && reply.setText(me.content.follow).send();
                        }, 500);
                        this.queue.push(msg.fromUid);
                        if (this.queue.length > 1 || this.free.length <= 0) {
                            setTimeout(function() {
                                me.content.wait && reply.setText(me.content.wait).send();
                            }, 1000);
                        } else {
                            this.free.forEach(function(uid) {
                                me.content.new && (new Message().setUid(uid).setText(me.content.new).send());
                            });
                        }
                    }
                }
                return 'keep';
            }
        },
        onQuitFloor : function(msg, reply, floor) {
            if (this.key.indexOf(floor) > -1) {
                if (this.map[msg.fromUid]) {
                    this.stopConv(this.workers[this.map[msg.fromUid]]);
                } else if (this.workers[msg.fromUid]) {
                    this.workers[msg.fromUid].status = 0;
                    if (this.workers[msg.fromUid].uid) {
                        this.stopConv(this.workers[msg.fromUid]);
                    }
                } else if (this.queue.indexOf(msg.fromUid) > -1) {
                    this.queue.splice(this.queue.indexOf(msg.fromUid), 1);
                    this.content.stopConv && (new Message().setUid(msg.fromUid).setText(this.content.stopConv).send());
                }
            }
        },
        onMessage : function(msg, reply, floor) {
            var me = this;
            if (this.key.indexOf(floor) > -1) {
                if (this.workers[msg.fromUid]) {
                    var wid = msg.fromUid, worker = this.workers[wid];
                    if (worker.uid) {
                        if (msg.type == 'text' && msg.text == 'exit') {
                            this.stopConv(worker);
                        } else {
                            this.sendMsg(msg, wid, worker.uid);
                        }
                    } else {
                        if (msg.type == 'text' && msg.text.indexOf('next') == 0) {
                            if (this.queue.length > 0) {
                                this.startConv(worker, this.queue.shift());
                            } else {
                                this.outFree(wid);
                                this.content.none && reply.setText(this.content.none).send();
                            }
                        } else if (msg.type == 'text' && msg.text.indexOf('talk') == 0) {
                            var tag = msg.text.replace(/\s/g, '').split(':');
                            tag = tag.length > 1 ? tag[1] : null;
                            if (tag) {
                                this.outFree(worker.wid);
                                var param = 'source_id=' + User.get('uid') + '&';
                                if (parseInt(tag)) {
                                    param += 'target_id=' + tag;
                                } else {
                                    param += 'target_screen_name=' + tag;
                                }
                                OpenAPI.get('friendships/show', param, function(data) {
                                   if (data.target && data.target.following) {
                                       me.startConv(worker, data.target.id);
                                   } else {
                                       me.content.noUser && (new Message().setUid(worker.wid).setText(me.content.noUser).send());
                                   }
                                });
                            }
                        }
                    }
                } else {
                    if (this.map[msg.fromUid]) {
                        this.sendMsg(msg, msg.fromUid, this.map[msg.fromUid]);
                    } else {
                        me.content.wait && reply.setText(me.content.wait).send();
                    }
                }
            }
        },
        sendMsg : function(msg, fuid, tuid) {
            var message = new Message();
            var id = this.getMsgId(tuid);
            if (id) {
                message.setId(id);
            } else {
                message.setUid(tuid);
            }
            switch (msg.type) {
                case 'text' :
                    message.setText(msg.text);
                    break;
                case 'image' :
                    message.setText(msg.text).setImage(msg.data.vfid, msg.data.tovfid);
                    break;
                case 'position' :
                    message.setText(msg.text).setPosition(msg.data.longitude, msg.data.latitude);
                    break;
                default :
                    id = this.getMsgId(fuid);
                    if (id) {
                        message.setId(id);
                    } else {
                        message.setUid(fuid);
                    }
                    message.setText(this.content.notSupport);
            }
            message.send();
        },
        startConv : function(worker, uid) {
            worker.uid = uid;
            this.outFree(worker.wid);
            this.moveUser(uid, this.key[0], new Date().getTime() + aDay);
            this.map[uid] = worker.wid;
            this.content.startConv && (new Message().setUid(uid).setText(this.content.startConv.replace('NAME', worker.name)).send());
            this.content.startWork && (new Message().setUid(worker.wid).setText(this.content.startWork).send());
            OpenAPI.get('users/show', 'uid=' + uid, function(data) {
                new Message().setUid(worker.wid).addArticle('用户信息', data.screen_name + ' ' + (data.gender == 'm' ? '男' : '女') + ' ' + (data.follow_me ? '粉丝' : '非粉丝')  + '\n' + data.location, 'http://tp1.sinaimg.cn/' + uid + '/180//1', 'http://weibo.com/u/' + uid).send()
            });
        },
        stopConv : function(worker) {
            var uid = worker.uid;
            worker.uid = null;
            worker.mid = null;
            delete this.map[uid];
            this.resetUser(uid);
            this.content.stopConv && (new Message().setUid(uid).setText(this.content.stopConv).send());
            this.content.stopWork && (new Message().setUid(worker.wid).setText(this.content.stopWork).send());
        },
        outFree : function(uid) {
            var index = this.free.indexOf(uid);
            if (index > -1) {
                this.free.splice(index, 1);
            }
        },
        getStatus : function() {
            return {
                workers : this.workers,
                map : this.map,
                free : this.free,
                queue : this.queue
            };
        }
    };

    module.exports = Service;

})(module);