(function(module) {

    module.exports = {
        init : require('./lib/UserInfo.js').init,
        listener : require('./lib/network/MessageListener.js'),
        send : require('./lib/network/MessageSend.js'),
        reply : require('./lib/network/MessageReply.js'),
        Message : require('./lib/model/Message.js')
    };

})(module);