/**
 * Parse Message
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    module.exports = function(msg) {
        var data = {};
        data.id = msg.id;
        data.type = msg.type;
        data.toUid = msg.receiver_id;
        data.fromUid = msg.sender_id;
        data.time = new Date(msg.created_at).getTime();
        data.text = msg.text;
        data.data = msg.data;
        return data;
    };

})(module)