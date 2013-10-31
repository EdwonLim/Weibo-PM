(function(module){

    var info = {}

    module.exports = {
        init : function(username, uid, password, appkey) {
            info['username'] = username;
            info['uid'] = uid;
            info['password'] = password;
            info['appkey'] = appkey;
        },
        get : function(key) {
            return info[key];
        }
    };

})(module)