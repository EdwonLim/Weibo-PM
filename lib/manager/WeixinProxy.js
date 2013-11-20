(function(module) {

    var http = require('http'),
        querystring = require('querystring'),
        crypto = require('crypto'),
        DOMParser = require('xmldom').DOMParser,
        URL = require('url');

    var sha1 = function sha1(str) {
        var md5sum = crypto.createHash('sha1');
        md5sum.update(str, 'uft-8');
        str = md5sum.digest('hex');
        return str;
    };

    var Proxy = function(url, token, floor) {
        this.url = URL.parse(url);
        this.token = token;
        this.floor = floor;
        this.open = false;
    };

    var REQTPL = {
        'text' : [
            '<xml>',
                '<ToUserName><![CDATA[:toUid]]></ToUserName>',
                '<FromUserName><![CDATA[:fromUid]]></FromUserName>',
                '<CreateTime>:time</CreateTime>',
                '<MsgType><![CDATA[text]]></MsgType>',
                '<Content><![CDATA[:text]]></Content>',
                '<MsgId>:id</MsgId>',
            '</xml>'
        ].join('')
    };

    var sorter = function (a, b) {
        var aFloat = parseFloat(a),
            bFloat = parseFloat(b),
            aNumeric = aFloat + '' === a,
            bNumeric = bFloat + '' === b;
        if (aNumeric && bNumeric) {
            return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
        } else if (aNumeric && !bNumeric) {
            return 1;
        } else if (!aNumeric && bNumeric) {
            return -1;
        } else {
            if (!aFloat) {
                return 1;
            } else if (!bFloat) {
                return -1;
            } else {
                return a > b ? 1 : a < b ? -1 : 0;
            }
        }
    };

    var getValue = function(item, key) {
        return item.getElementsByTagName(key)[0].childNodes[0].data;
    };

    var execReply = function(rs, reply) {
        var type = getValue(rs, 'MsgType');
        switch (type) {
            case 'text' :
                reply.setText(getValue(rs, 'Content')).send()
                break;
            case 'news' :
                var items = rs.getElementsByTagName('item');
                for (var i = 0, l = items.length; i < l; i ++) {
                    reply.addArticle(
                        getValue(items[i], 'Title'),
                        getValue(items[i], 'Description'),
                        getValue(items[i], 'PicUrl'),
                        getValue(items[i], 'Url')
                    );
                }
                reply.send();
                break;
        }
    };

    Proxy.prototype = {
        getKey : function() {
            var timestamp = new Date().getTime(),
                nonce = parseInt(Math.random() * 100000),
                data = {
                    timestamp : timestamp,
                    nonce : nonce
                },
                arr = [this.token, timestamp, nonce];
            arr.sort(sorter);
            data.signature = sha1(arr.join(''));
            return data;
        },
        requestUrl : function(data, callback) {
            var key = this.getKey();
            var req = http.request({
                method : 'POST',
                hostname : this.url.hostname,
                path : this.url.path + '?' + querystring.stringify(key),
                headers: {
                    'Content-Type': 'text/xml',
                    'Content-Length': data.length
                }
            }, function(res) {
                var rs = '';
                res.on('data', function(chunk) {
                    rs += chunk + '';
                });
                res.on('end', function() {
                    callback(rs);
                });
            });
            req.write(data);
            req.end();
        },
        execMsg : function(msg, reply) {
            var data = REQTPL[msg.type];
            msg.time = parseInt(msg.time / 1000);
            for (var key in msg) {
                data = data.replace(':' + key, msg[key]);
            }
            this.requestUrl(data, function(rs) {
                if (rs && rs.length) {
                    execReply(new DOMParser().parseFromString(rs.replace(/[\s\n]/g, ''), "text/xml"), reply);
                }
            });
        },
        onEvent : function(msg, reply) {
            this.execMsg(msg, reply);
        },
        onMessage : function(msg, reply, floor) {
            if (!this.floor || floor == this.floor) {
                this.execMsg(msg, reply);
            }
        }
    };

    module.exports = Proxy;

})(module);