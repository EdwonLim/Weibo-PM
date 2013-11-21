var pm = require('./../core'),
    fs = require('fs');

// 打开Debug

pm.Util.Debug.open();

// 初始化
pm.init('username', 'uid', 'password', 'appkey');

// 配置
pm.configure(JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8')), __dirname);

// 两个小Demo
pm.ReplyManager.addProcess(require('./moduleDemo/ManDemo')(pm));

pm.ReplyManager.addProcess(require('./moduleDemo/WeatherDemo'));

// 微信自动回复过程
pm.ReplyManager.addProcess(
    new pm.WeChat.Process(
        'http://sipc.sinaapp.com/index.php',
        'sipcsipcsipc',
        'http://weibopm.duapp.com',
        'wechat'
    )
);

// 微信模拟接口
// pm.WeChat.Server('abc', '123', 8080);


