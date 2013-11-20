var pm = require('./../core'),
    fs = require('fs');

// 打开Debug

pm.Debug.open();

// 初始化
pm.init('username', 'uid', 'password', 'appkey');
pm.init('yinxl_002@163.com', '2818428057', '@xmu123456', '2466206962');

// 配置
pm.configure(JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8')), __dirname);

pm.ReplyManager.addProcess(require('./moduleDemo/ManDemo')(pm));

pm.ReplyManager.addProcess(require('./moduleDemo/WeatherDemo'));

pm.ReplyManager.addProcess(
    new pm.WeixinProxy(
        'http://sipc.sinaapp.com/index.php',
        'sipcsipcsipc'
    )
);
