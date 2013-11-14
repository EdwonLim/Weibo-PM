(function(module) {

    module.exports = {
        init : require('./lib/UserInfo').init,
        listener : require('./lib/network/MessageListener'),
        send : require('./lib/network/MessageSend'),
        reply : require('./lib/network/MessageReply'),
        Message : require('./lib/model/Message'),
        ReplyManager : require('./lib/manager/ReplyManager'),
        ReplyProcess : {
            replyForText : require('./lib/process/ReplyForText'),
            replyForEvent : require('./lib/process/ReplyForEvent'),
            Lottery : require('./lib/process/Lottery'),
            SecKill : require('./lib/process/SecKill'),
            CustomerService : require('./lib/process/CustomerService')
        },
        OpenAPI : require('./lib/network/OpenAPI'),
        Debug : require('./lib/util/Debug')
    };

})(module);