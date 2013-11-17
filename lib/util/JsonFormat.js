(function(module) {

    var JsonFormat = function(str) {
        var rs = '', loop = 0, flag = true;
        var tabs = function(n) {
            var t = '';
            for (var j = 0; j < n; j ++) {
                t += '\t';
            }
            return t;
        };
        for (var i = 0, len = str.length; i < len; i ++) {
            var cur = str[i];
            if (flag) {
                if (cur === '{' || cur === '[') {
                    loop ++;
                    rs += cur + '\n' + tabs(loop);
                } else if (cur === '}' || cur === ']') {
                    loop --;
                    rs += '\n' + tabs(loop) + cur;
                } else if (cur === ',') {
                    rs += ',\n' + tabs(loop);
                } else if (cur === ':') {
                    rs += ': ';
                } else {
                    if (cur === '"' && str[i - 1] !== '\\') {
                        flag = false
                    }
                    rs += cur;
                }
            } else {
                if (cur === '"' && str[i - 1] !== '\\') {
                    flag = true;
                }
                rs += cur;
            }
        }
        return rs;
    };

    module.exports = JsonFormat;

})(module);