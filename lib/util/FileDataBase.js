(function(module) {

    var fs = require('fs'),
        jf = require('./JsonFormat');

    var basePath = '';

    var FileDataBase = {
        init : function(path) {
            if (fs.existsSync(path)) {
                basePath = path;
            }
        },
        set : function(key, value) {
            if (basePath) {
                fs.writeFileSync(basePath + key + '.json', jf(JSON.stringify(value)), 'utf-8');
            }
        },
        get : function(key) {
            if (basePath) {
                return fs.readFileSync(basePath + key + '.json', 'utf-8');
            } else {
                return false;
            }
        }
    };

    module.exports = FileDataBase;

})(module)