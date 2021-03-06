/**
 * Reply Manager
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    var listener = require('../network/MessageListener'),
        Message = require('../model/Message'),
        parseParam = require('../util/ParseParam'),
        Segment = require('segment').Segment;

    var Processes = [],
        TYPES = ['onEvent', 'onMessage'];

    var segment = new Segment();
        segment.useDefault();

    var floorOpt = {
        flag : false,
        items : {},
        hotKey : [],
        helpText : '',
        backText : {},
        backKey : [],
        segment : false,
        segmentTip : 'KEY',
        timeout : 0
    };

    var userFloors = {};

    var execMsg = function(msg, type) {
        var floor = '';
        if (floorOpt.flag && type == TYPES[1]) {
            if (userFloors[msg.fromUid]) {
                if ((+new Date()) - userFloors[msg.fromUid].timestamp > floorOpt.timeout * 1000) {
                    delete userFloors[msg.fromUid];
                } else {
                    floor = userFloors[msg.fromUid].floor;
                }
            }
            if (msg.type == 'text'){
                if (floor) {
                    if (floorOpt.backKey.indexOf(msg.text) > -1) {
                        msg.text = floor;
                        if (floorOpt.backText[floor]) {
                            new Message().setId(msg.id).setText(floorOpt.backText[floor]).send();
                        }
                        if (floorOpt.helpText) {
                            setTimeout(function() {
                                new Message().setId(msg.id).setText(floorOpt.helpText).send();
                            }, 1000);
                        }
                        delete userFloors[msg.fromUid];
                        type = 'onQuitFloor';
                    } else {
                        var time = new Date().getTime();
                        if (time > userFloors[msg.fromUid].timestamp) {
                            userFloors[msg.fromUid].timestamp = time;
                        }
                    }
                } else if (floorOpt.hotKey.indexOf(msg.text) > -1) {
                    new Message().setId(msg.id).setText(floorOpt.helpText).send();
                    floor = '';
                    return;
                } else if (floorOpt.items[msg.text] !== undefined) {
                    floor = msg.text;
                    userFloors[msg.fromUid] = {
                        floor : floor,
                        timestamp : +new Date()
                    };
                    if (floorOpt.items[floor]) {
                        new Message().setId(msg.id).setText(floorOpt.items[floor]).send();
                    }
                    type = 'onEnterFloor';
                }
            }
        }
        var breaked = false;
        for (var i = 0, len = Processes.length; i < len; i ++) {
            var process = Processes[i];
            if (process[type]) {
                var reply = new Message();
                reply.setUid(msg.fromUid);
                reply.setId(msg.id);
                var rs = process[type](msg, reply, floor);
                if (rs == 'break') {
                    breaked = true;
                    break;
                } else if (rs == 'keep') {
                    userFloors[msg.fromUid] && (userFloors[msg.fromUid].timestamp = new Date().getTime() + 24 * 60 * 60 * 1000);
                }
            }
        }
        if (floorOpt.segment && !breaked && !floor && msg.type == 'text') {
            var key = segment.doSegment(msg.text).filter(function(value) {
                if (floorOpt.items[value.w] !== undefined) {
                    return true;
                }
            }).shift();
            if (key) {
                new Message().setId(msg.id).setText(floorOpt.segmentTip.replace(/KEY/g, key.w)).send();
            }
        }
    };

    var startListener = function() {
        TYPES.forEach(function(value) {
            listener[value](function(msg) {
                execMsg(msg, value);
            });
        });
    };

    var Main = {
        start : function() {
            listener.start();
            startListener();
        },
        openFloor : function(opt) {
            floorOpt = parseParam(floorOpt, opt);
            floorOpt.flag = true;
        },
        addProcess : function(process) {
            Processes.push(process);
            process.destory = function() {
                Main.removeProcess(process);
            };
            process.resetUser = function(uid) {
                delete userFloors[uid];
            };
            process.moveUser = function(uid, floor, time) {
                userFloors[uid] = {
                    floor : floor,
                    timestamp : new Date().getTime() + time
                };
            };
        },
        removeProcess : function(process) {
            var index = Processes.indexOf(process);
            if (index > -1) {
                Processes.splice(index, 1);
            }
        },
        reset : function() {
            Processes.forEach(function(process) {
                process.destory();
                delete process;
            });
            floorOpt.flag = false;
        },
        startListener : startListener
    };

    module.exports = Main;

})(module);