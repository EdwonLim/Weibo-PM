(function(module) {

    var RULES = {};

    var process = {
        init : function(opt) {
            RULES = opt;
        },
        onMessage : function(msg, reply, floor) {
            var obj;
            if (msg.type == 'text') {
                if (floor) {
                    if (RULES[floor]) {
                        obj = RULES[floor][msg.text];
                    }
                } else {
                    obj = RULES[msg.text];
                }
                if (obj) {
                    if (obj[0] == 'text') {
                        reply.setText(obj[1]);
                    } else if (obj[0] == 'articles') {
                        var items = obj[1];
                        for (var i = 0, len = items.length; i < len; i ++) {
                            reply.addArticle.apply(reply, items[i]);
                        }
                    } else if (obj[0] == 'image') {
                        reply.setImage(obj[1], obj[2]);
                    } else if (obj[0] == 'position') {
                        reply.setPosition(obj[1], obj[2]);
                    }
                    reply.send();
                }
            }

        }
    };

    module.exports = process;


})(module);