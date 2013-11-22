//     __                  
//    / /_  ___  ___  _____
//   / __ \/ _ \/ _ \/ ___/
//  / /_/ /  __/  __/ /    
// /_.___/\___/\___/_/     
//
// @brief : a simple request wrapper of request
// @author : [turingou](http://guoyu.me)

var request = require('request'),
    _ = require('underscore');

var res = function(error, response, body, cb) {
    if (!error) {
        cb(null, {
            stat: response.statusCode,
            response: response,
            body: body
        });
    } else {
        cb(error, {
            response: response
        });
    }
};

var extend = function(url, params, method) {
    return _.extend({
        url: (method && method == 'get' && params.query) ? exports.join(params.query, url) : url,
        json: (typeof(params.json) != 'undefined' && params.json === false) ? false : true
    }, params);
}

// join params to url
exports.join = function(params, url) {
    if (_.isObject(params) && !_.isEmpty(params)) {
        var url = url + '?';
        if (params.headers) delete params.headers;
        _.each(params, function(value, key, list) {
            url = [
                url, (url.lastIndexOf('?') == url.length - 1) ? '' : '&',
                key,
                '=',
                value
            ].join('');
        });
    }
    return url;
}

// get
exports.get = function(url, params, cb) {
    request.get(extend(url, params, 'get'), function(error, response, body) {
        res(error, response, body, cb)
    });
};

// post
exports.post = function(url, params, cb) {
    request.post(extend(url, params), function(error, response, body) {
        res(error, response, body, cb)
    })
};

// put
exports.put = function(url, params, cb) {
    request.put(extend(url, params), function(error, response, body) {
        res(error, response, body, cb)
    })
};

// delete
exports.delete = function(url, params, cb) {
    request.del(extend(url, params), function(error, response, body) {
        res(error, response, body, cb)
    })
};