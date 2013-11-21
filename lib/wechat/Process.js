(function(module) {

    var http = require('http'),
        querystring = require('querystring'),
        crypto = require('crypto'),
        reader = require('xmlreader'),
        OpenAPI = require('../network/OpenAPI'),
        URL = require('url');

    var sha1 = function sha1(str) {
        var md5sum = crypto.createHash('sha1');
        md5sum.update(str, 'uft-8');
        str = md5sum.digest('hex');
        return str;
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
        ].join(''),
        'image' : [
            '<xml>',
            '<ToUserName><![CDATA[:toUid]]></ToUserName>',
            '<FromUserName><![CDATA[:fromUid]]></FromUserName>',
            '<CreateTime>:time</CreateTime>',
            '<MsgType><![CDATA[image]]></MsgType>',
            '<PicUrl><![CDATA[:url]]></PicUrl>',
            '<MediaId><![CDATA[:fid]]></MediaId>',
            '<MsgId>:id</MsgId>',
            '</xml>'
        ].join(''),
        'position' : [
            '<xml>',
            '<ToUserName><![CDATA[:toUid]]></ToUserName>',
            '<FromUserName><![CDATA[:fromUid]]></FromUserName>',
            '<CreateTime>:time</CreateTime>',
            '<MsgType><![CDATA[location]]></MsgType>',
            '<Location_X><![CDATA[:x]]></Location_X>',
            '<Location_Y><![CDATA[:y]]></Location_Y>',
            '<Scale><![CDATA[:1]]></Scale>',
            '<Label><![CDATA[:addr]]></Label>',
            '<MsgId>:id</MsgId>',
            '</xml>'
        ].join(''),
        'event' : [
            '<xml>',
            '<ToUserName><![CDATA[:toUid]]></ToUserName>',
            '<FromUserName><![CDATA[:fromUid]]></FromUserName>',
            '<CreateTime>:time</CreateTime>',
            '<MsgType><![CDATA[event]]></MsgType>',
            '<Event><![CDATA[:event]]></Event>',
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

    var execReply = function(rs, reply) {
        reader.read(rs, function(err, res) {
            if (!err) {
                var type = res.xml.MsgType.text();
                switch (type) {
                    case 'text' :
                        reply.setText(res.xml.Content.text()).send();
                        break;
                    case 'image' :
                        console.log(res.xml.Image.MediaId.text());
                        reply.setImageId(res.xml.Image.MediaId.text()).send();
                        break;
                    case 'news' :
                        var arts = res.xml.Articles;
                        for (var i = 0, l = arts.count(); i < l; i ++) {
                            var item = arts.at(i).item;
                            reply.addArticle(item.Title.text(), item.Description.text(), item.PicUrl.text(), item.Url.text());
                        }
                        reply.send();
                        break;
                }
            }
        });
    };

    var Proxy = function(url, token, baseUrl, floor) {
        this.url = URL.parse(url);
        this.token = token;
        this.baseUrl = baseUrl;
        this.floor = floor;
        this.open = false;
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
            var me = this;
            var data = REQTPL[msg.type];
            if (data) {
                msg.time = parseInt(msg.time / 1000);
                if (msg.data) {
                    msg.fid = msg.data.tovfid;
                    msg.url = this.baseUrl + '/cgi-bin/media/pic?media_id=' + msg.fid;
                    msg.x = msg.data.longitude;
                    msg.y = msg.data.latitude;
                    msg.event = msg.data.subkey;
                }
                for (var key in msg) {
                    if (msg[key] !== undefined) {
                        data = data.replace(':' + key, msg[key]);
                    }
                }
                if (msg.type == 'position') {
                    OpenAPI.get('location/geo/geo_to_address', 'coordinate=' + msg.x + ',' + msg.y, function(data) {
                       if (data && data.geos && data.geos.length) {
                           data.replace(':addr', data.geos[0].address);
                           me.requestUrl(data, function(rs) {
                               if (rs && rs.length) {
                                   execReply(rs.replace(/[\s\n]/g, ''), reply);
                               }
                           });
                       }
                    });
                } else {
                    this.requestUrl(data, function(rs) {
                        if (rs && rs.length) {
                            execReply(rs.replace(/[\s\n]/g, ''), reply);
                        }
                    });
                }
            }
        },
        onEvent : function(msg, reply) {
            if (!this.floor) {
                if (msg.data.subkey == 'follow') {
                    msg.data.subkey = 'subscribe';
                    this.execMsg(msg, reply);
                }
            }
        },
        onMessage : function(msg, reply, floor) {
            if (!this.floor || floor == this.floor) {
                this.execMsg(msg, reply);
            }
        }
    };

    module.exports = Proxy;

})(module);