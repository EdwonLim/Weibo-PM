(function(module) {

    var listener = require('../network/MessageListener'),
        Message = require('../model/Message'),
        parseParam = require('../util/ParseParam');

    var Processes = [],
        TYPES = ['onEvent', 'onMessage', 'onMention'];

    var floorOpt = {
        flag : false,
        items : {},
        hotKey : [],
        helpText : '',
        backText : '',
        backKey : [],
        timeout : 0
    };

    var userFloors = {};

    var execMsg = function(msg, type) {
        var floor = '';
        if (floorOpt.flag && type == TYPES[2]) {
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
                        if (floorOpt.backText) {
                            new Message().setId(msg.id).setText(floorOpt.backText.replace('FLOOR', floor)).success(function(){
                                if (floorOpt.helpText) {
                                    setTimeout(function() {
                                        new Message().setId(msg.id).setText(floorOpt.helpText).send();
                                    }, 1000);
                                }
                            }).send();
                        }
                        delete userFloors[msg.fromUid];
                        type = 'onQuitFloor';
                    }
                } else if (floorOpt.hotKey.indexOf(msg.text) > -1) {
                    new Message().setId(msg.id).setText(floorOpt.helpText).send();
                    return;
                } else if (floorOpt.items[msg.text]) {
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
        for (var i = 0, len = Processes.length; i < len; i ++) {
            var process = Processes[i];
            if (process[type]) {
                var reply = new Message();
                reply.setId(msg.id);
                if (process[type](msg, reply, floor) === false) {
                    break;
                }
            }
        }
    };

    var Main = {
        start : function() {
            listener.start();

            TYPES.forEach(function(value) {
                listener[value](function(msg) {
                    execMsg(msg, value);
                });
            });
        },
        openFloor : function(opt) {
            floorOpt = parseParam(floorOpt, opt);
            floorOpt.flag = true;
        },
        addProcess : function(process) {
            Processes.push(process);
        },
        removeProcess : function(process) {
            var index = Processes.indexOf(process);
            if (index > -1) {
                Processes.splice(index, 1);
            }
        }
    };

    module.exports = Main;

})(module);