/**
 * Mention Manager
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    var listener = require('../network/MessageListener'),
        OpenAPI = require('../network/OpenAPI');

    var EventManager = (function(){
        var events = {};
        return {
            fire : function(name, param) {
                var fnList = events[name], fn;
                if(fnList){
                    for (var i = 0, l = fnList.length; i < l; i++) {
                        fn = fnList[i];
                        if (fn && typeof fn == 'function') {
                            fn(param);
                        }
                    }
                }
            },
            add : function(name, fn) {
                if(!events[name]){
                    events[name] = [];
                }
                events[name].push(fn);
            },
            removeAll : function(name) {
                delete events[name];
            },
            destory : function() {
                events = {};
            }
        };
    })();

    var Reposts = {}, Comments = {};

    var execRepost = function(uid, mid) {
        if (!Reposts[mid]) {
            Reposts[mid] = [];
        }
        Reposts[mid].push(uid);
        EventManager.fire('status_' + mid, {uid : uid});
    };

    var execComment = function(uid, mid) {
        if (!Comments[mid]) {
            Comments[mid] = [];
        }
        Comments[mid].push(uid);
        EventManager.fire('comment_' + mid, {uid : uid});
    };

    var execMsg = function(msg) {
        if (msg.data.subtype == 'status') {
            OpenAPI.get('statuses/show', 'id=' + msg.data.key, function(data) {
                if (data.retweeted_status) {
                    execRepost(msg.fromUid, data.retweeted_status.mid);
                }
            });
        } else if (msg.data.subtype == 'comment') {
            OpenAPI.get('comments/show_batch', 'cids=' + msg.data.key, function(data) {
                if (data[0] && data[0].status) {
                    execComment(msg.fromUid, data[0].status.mid);
                }
            });
        }
    };

    var Manager = {
        start : function() {
            listener.onMention(function(msg) {
                execMsg(msg);
            });
        },
        addRepostListener : function(mid, listener) {
            EventManager.add('status_' + mid, listener);
        },
        removeRepostListener : function(mid) {
            EventManager.removeAll('status_' + mid);
        },
        addCommentListener : function(mid, listener) {
            EventManager.add('comment_' + mid, listener);
        },
        removeCommentListener : function(mid) {
            EventManager.removeAll('comment_' + mid);
        },
        getRepostUids : function(mid) {
            return Reposts[mid];
        },
        getCommentUids : function(mid) {
            return Comments[mid];
        },
        reset : function() {
            Reposts = {};
            Comments = {};
            EventManager.destory();
        }
    };

    module.exports = Manager;

})(module)