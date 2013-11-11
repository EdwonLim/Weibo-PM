(function(module) {

    var http = require('http'),
        user = require('../UserInfo'),
        parse = require('../util/ParseMsg'),
        Debug = require('../util/Debug');

    var msg_id = 0,
        started = false,
        options = {},
        listeners = {};

    var getMessage = function() {

        var url = options.path + (msg_id ? '&since_id=' + msg_id : '');

        var req = http.request({
            hostname : 'm.api.weibo.com',
            port : 80,
            path : url,
            auth : options.auth,
            method : 'GET'
        }, function(res){
            res.on('data', function (chunk) {
                var msg = parse(JSON.parse(chunk));
                Debug.log('Receive', JSON.stringify(msg));
                msg_id = msg.id;
                listeners.all && listeners.all(msg);
                if (msg.type == 'event') {
                    listeners.event && listeners.event(msg);
                } else if (msg.type == 'mention') {
                    listeners.mention && listeners.mention(msg);
                } else {
                    listeners.message && listeners.message(msg);
                }
            });

            res.on('end', function () {
                Debug.log('Listener', 'Stop response && create new request.');
                getMessage();
            });

        });

        req.on('error', function(){
            Debug.log('Listener', 'Stop response && create new request.');
            getMessage();
        });

        setTimeout(function() {
            req.abort()
        }, 3 * 60 * 1000);

        req.end();
    };

    var httpStart = function() {
        Debug.log('Listener', 'Start receive service.');
        options = {
            path : '/2/messages/receive.json?uid=' + user.get('uid') + '&source=' + user.get('appkey'),
            auth : user.get('username') + ':' + user.get('password')
        };
        getMessage();
    };

    var Listener = {
        on : function(listener) {
            if (typeof listener == 'function') {
                listeners.all = listener
            }
        },
        onEvent : function(listener) {
            if (typeof listener == 'function') {
                listeners.event = listener
            }
        },
        onMessage : function(listener) {
            if (typeof listener == 'function') {
                listeners.message = listener
            }
        },
        onMention : function(listener) {
            if (typeof listener == 'function') {
                listeners.mention = listener
            }
        },
        start : function(){
            if (!started) {
                httpStart();
                started = true;
            }
        }
    };

    module.exports = Listener;

})(module);