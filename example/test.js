var pm = require('./../core'),
    fs = require('fs');

// 打开Debug

pm.Debug.open();

// 初始化
pm.init('username', 'uid', 'password', 'appkey');

// 配置
pm.configure(JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8')), __dirname);
