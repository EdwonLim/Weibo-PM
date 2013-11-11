(function(module) {

    var RULES = {}

    module.exports = {
        init : function(opt) {
            RULES = opt;
        },
        onEvent : function(msg, reply) {
            if (msg.data.subtype == 'follow' && RULES['follow']) {
                reply.setText(RULES['follow']).send();
            } else if (msg.data.subtype == 'unfollow' && RULES['unfollow']) {
                reply.setText(RULES['unfollow']).send();
            }
        }
    }

})(module)