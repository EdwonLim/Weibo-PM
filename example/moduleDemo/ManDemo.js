(function(module) {

    module.exports = function(pm) {
        return {
            onMessage : function(msg, reply) {
                if (msg.type == 'text' && msg.text == '我是') {
                    pm.OpenAPI.get('users/show', 'uid=' + msg.fromUid, function(data) {
                        reply.setText(data.location + ' ' + (data.gender == 'm' ? '纯爷们' : '女汉子')).send();
                    });
                }
            }
        };
    };

})(module)