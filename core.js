(function(module) {

    module.exports = {
        init : require('./lib/UserInfo.js').init,
        listener : require('./lib/MessageListener.js'),
        send : require('./lib/MessageSend.js'),
        reply : require('./lib/MessageReply.js')
    };

})(module);