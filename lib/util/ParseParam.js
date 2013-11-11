(function(module) {

    module.exports = function(source, params, isown) {
        var key, ret = {};
        params = params || {};
        for (key in source) {
            ret[key] = source[key];
            if (params[key] != null) {
                if (isown) {
                    if (source.hasOwnProperty(key)) {
                        ret[key] = params[key];
                    }
                } else {
                    ret[key] = params[key];
                }
            }
        }
        return ret;
    };

})(module)