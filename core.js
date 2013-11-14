(function(module) {

    var Core = {
        init : require('./lib/UserInfo').init,
        configure : function(options) {
            if (options) {
                var process;
                if (options.floor) {
                    Core.ReplyManager.openFloor(options.floor);
                }
                if (options.forText) {
                    process = Core.ReplyProcess.replyForText;
                    process.init(options.forText);
                    Core.ReplyManager.addProcess(process);
                }
                if (options.forEvent) {
                    process = Core.ReplyProcess.replyForEvent;
                    process.init(options.forEvent);
                    Core.ReplyManager.addProcess(process);
                }
                if (options.customer) {
                    process = new Core.ReplyProcess.CustomerService();
                    process.setTime(options.customer.startTime, options.customer.endTime);
                    process.setKey(options.customer.key);
                    process.setWorkers(options.customer.workers);
                    process.setContent(options.customer.content);
                    Core.ReplyManager.addProcess(process);
                }
                if (options.event) {
                    options.event.forEach(function(e) {
                        switch (e.type) {
                            case 'Lottery' :
                                process = new Core.ReplyProcess.Lottery();
                                process.setTime(e.startTime, e.endTime);
                                process.setKey(e.key);
                                process.setContent(e.content);
                                e.prize.forEach(function(item){
                                    process.addPrize.apply(process, item);
                                });
                                process.setLogFile(e.log);
                                Core.ReplyManager.addProcess(process);
                                break;
                            case 'SecKill' :
                                process = new Core.ReplyProcess.SecKill();
                                process.setTime(e.startTime, e.endTime);
                                process.setKey(e.key);
                                process.setContent(e.content);
                                process.setPrize(e.prize.name, e.prize.num);
                                process.setLogFile(e.log);
                                Core.ReplyManager.addProcess(process);
                                break;
                       }
                    });
                }
            }
            Core.ReplyManager.start();
        },
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

    module.exports = Core;

})(module);