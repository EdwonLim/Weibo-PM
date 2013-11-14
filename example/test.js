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
        'html' : '欢迎来到html页面目录！输入 1 、 2 查看相应内容。',
        '客服' : null
    },
    hotKey : ['menu', '菜单'],
    helpText : '欢迎来到此地，请输入"js","css","html"进入相应目录，输入"0"退出相应目录。',
    backText : {
        'js' : '已经退出 js 目录。',
        'css' : '已经退出 css 目录。',
        'html' : '已经退出 html 目录。',
        '客服' : null
    },
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

// 抽奖功能

var lot = new pm.ReplyProcess.Lottery();

lot.setTime('2013/11/13 23:20:00', '2013/11/13 23:21:00');

lot.setKey(['抽奖', 'cj']);

lot.setContent({
    beforeEvent : '抽奖还未开始！',
    onEvent : '成功参与抽奖，请耐心等待结果！',
    repeat : '您已成功参与抽奖！每人只可参与一次！',
    afterEvent : '抽奖已经结束！',
    prize : '恭喜您获得【NAME】- TEXT ，稍后我们将私信联系您。',
    none : '很遗憾，您没有抽中任何奖项，谢谢您的参与！'
});

lot.addPrize('特等奖', '宝马一辆', 1);
lot.addPrize('一等奖', 'Mac Pro一台', 1);
lot.addPrize('二等奖', 'MacBook Pro一台', 1);

lot.setLogFile('/Users/Apple/Downloads/lot.xlsx');

pm.ReplyManager.addProcess(lot);

// 秒杀功能

var sk = new pm.ReplyProcess.SecKill();

sk.setTime('2013/11/13 23:52:00', '2013/11/13 23:53:00');

sk.setKey(['秒杀', 'ms']);

sk.setContent({
    beforeEvent : '秒杀还未开始！',
    repeat : '您已成功秒杀！每人只可秒杀一次！',
    afterEvent : '秒杀已经结束！',
    success : '恭喜您获得 - NAME ，稍后我们将私信联系您。',
    none : '商品已经全部被秒杀！'
});

sk.setPrize('宝马一辆', 1);

sk.setLogFile('/Users/Apple/Downloads/sk.xlsx');

pm.ReplyManager.addProcess(sk);

// 客服系统

var cs = new pm.ReplyProcess.CustomerService();

cs.setTime('9:30', '19:00');

cs.setKey(['客服']);

cs.setWorkers({
    '小洋' : '2609545991'
});

cs.setContent({
    outerTime : '对不起，现在不是客服服务时间。\n（服务时间9:30~18:30）',
    enter : '欢迎使用客服系统，系统正在自动为您连接客服人员，请稍候！\n(发送0可以退出客服系统)',
    follow : '【注意】由于系统限制，关注本账号，成为本账号的粉丝，才能正常使用客服系统。',
    wait : '【排队中】现在业务非常繁忙，请您稍等片刻！',
    startConv : '已经连接到客服人员，客服【 NAME 】为您服务！',
    stopConv : '您已经退出客服系统，欢迎下次再次使用。',
    worker : '【 NAME 】:\n欢迎进入客服人员工作系统:\n发送next接待下一位客户；\n发送exit退出与当前客户的交流；\n发送0退出客服系统。',
    none : '客服系统中现在没有等待的客户。',
    new : '有新客户进入客服系统，发送next进行接待。',
    startWork : '客户已经接入。',
    stopWork : '和客户的交谈已经结束，发送next接待下一位客户。',
    notSupport : '对不起，客服系统不支持您的消息类型。'
});

pm.ReplyManager.addProcess(cs);

// 开启回复管理

pm.ReplyManager.start();