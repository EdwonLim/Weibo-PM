(function(module) {

    module.exports = {
        init : require('./lib/UserInfo').init,
        listener : require('./lib/network/MessageListener'),
        send : require('./lib/network/MessageSend'),
        reply : require('./lib/network/MessageReply'),
        Message : require('./lib/model/Message'),
        ReplyManager : require('./lib/manager/ReplyManager'),
        ReplyProcess : {
            replyForText :  require('./lib/process/ReplyForText'),
            replyForEvent :  require('./lib/process/ReplyForEvent')
        },
        Debug : require('./lib/util/Debug')
    };

})(module);