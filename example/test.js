var pm = require("./../core");


// 打开Debug

pm.Debug.open();

// 初始化用户

pm.init('username', 'uid', 'password', 'appkey');

// 打开分级目录功能

pm.ReplyManager.openFloor({
    items : {
        'js' : '欢迎来到js脚本目录！输入 1 、 2 查看相应内容。',
        'css' : '欢迎来到css样式目录！输入 1 、 2 查看相应内容。',
        'html' : '欢迎来到html页面目录！输入 1 、 2 查看相应内容。'
    },
    hotKey : ['menu', '菜单'],
    helpText : '欢迎来到此地，请输入"js","css","html"进入相应目录，输入"0"退出相应目录。',
    backText : '已退出目录"FLOOR"。',
    backKey : ['0'],
    timeout : 300
});

// 消息回复功能。

var rft = pm.ReplyProcess.replyForText;

rft.init({
    'js' : {
        '1' : ['text', 'js是很神奇的东西'],
        '2' : ['articles', [
                ['js很牛', 'js太牛了', 'http://tp2.sinaimg.cn/1908736117/180/5678518790/1', 'http://weibo.com'],
                ['js很牛逼', 'js太牛逼了', 'http://tp2.sinaimg.cn/1908736117/180/5678518790/1', 'http://weibo.com']
              ]]
    },
    'css' : {
        '1' : ['text', 'css是很神奇的东西'],
        '2' : ['image', 1055597360, 1055597367]
    },
    'html' : {
        '1' : ['text', 'html是很神奇的东西'],
        '2' : ['position', '116.309868', '39.984371']
    }
});

pm.ReplyManager.addProcess(rft);

// 事件回复功能

var rfe = pm.ReplyProcess.replyForEvent;

rfe.init({
    'follow' : '亲！欢迎关注本账号！输入 menu 或 菜单 查看相应内容。',
    'unfollow' : '不要离开我，行不行吗？呜呜！'
});

pm.ReplyManager.addProcess(rfe);

// 开始进程

pm.ReplyManager.start();