# Weibo-PM

### Prowered By [Edwon Lim](http://edwon.me)

-------

## Introduction 介绍:

* 新浪微博粉丝服务私信管理工具，用于认证用户（蓝V，橙V）的自主服务，
* 详见 [http://open.weibo.com/wiki/粉丝服务开发模式指南](http://open.weibo.com/wiki/粉丝服务开发模式指南)

![NPM](https://nodei.co/npm/weibo-pm.png)

------

## Function 功能:

1. 消息自动回复：回复内容包括文本消息、媒体Card、包含图片的消息、包含地理位置的消息。
2. 事件自动回复：关注和取消关注时，自动发送私信。
3. 目录机制：加入目录规则，可根据目录的不同，回复不同的消息。
4. 留言箱：用户可以给不同的对象留言，例如投诉、询问，支持将留言转发至私信，邮件以及URL提交。
5. 活动事件：通过私信进行活动，如抽奖和秒杀，并将结果制成Excel。
6. 客服系统：通过私信转发，实现一个账号，多人接入的客服系统，一个大V账号可以接多个客服（微博账号），用户与大V账号的私信会被转发到客服账号。

支持二维码生成、邮件功能、上传功能等。

------

## Install & Use 安装与使用:

用`npm`安装:
	
```
	npm install weibo-pm
```
	
`require`引入	

```	
	var pm = require("weibo-pm");
```
	
------


## Base API 基本接口:

### 1.Initialize 初始化:

初始化模块 ： 用户名，用户id，用户密码，在粉丝服务器管理平台中绑定的appkey （**此用户要对APPKEY授权**）
 
```
	pm.init(username, uid, password, appkey);
```
	
### 2.Receive Message 接收消息:

监听所有消息

```
	pm.listener.on(function(msg) {
		// 处理消息
	});
```

监听事件消息（关注和取消关注）

``` 
	pm.listener.onEvent(function(msg) {
        // 处理消息
    });
```

监听私信消息（包括文本，图片，地理位置，语音等）
 
``` 
	pm.listener.onMessage(function(msg) {
        // 处理消息
    });
```
    
监听@消息 （**需要申请高级权限**）

``` 
    pm.listener.onMention(function(msg) {
        // 处理消息
    });
```

### 3.Start Listener 启动监听:

启动监听（**每4分钟会自动重新建立HTTP长连接（文档上要求的，为了减少服务器压力）**）

```
    pm.listener.start();
```

### 4.Rely Message 回复消息:

需要回复的消息的id，类型和数据，详细参看文档 （**每条消息最多只可被回复 3 次**）
 
``` 
	pm.rely(msgId, type, data, function(rs) {
		// 处理结果
	});
```
	
文档：[http://open.weibo.com/wiki/2/messages/reply](http://open.weibo.com/wiki/2/messages/reply)

### 5.Send Message 发送消息:

用户id，类型和数据，详细参看文档 (**只可给粉丝发送消息**)

``` 
	pm.send(uid, type, data, function(rs) {
		// 处理结果
	});
```

文档：[http://open.weibo.com/wiki/2/messages/send](http://open.weibo.com/wiki/2/messages/send)

### 6.Post Message 推送消息:

给`订阅用户`推送消息 (**此接口还没开放，开放后，会及时更新**)

-----

## Extend API 拓展接口:

### 1.Open API 开放平台接口:

可以通过此接口，调用微博开放平台的接口，详细参看文档 （**暂不支持Post提交文件**）

```
	// GET 请求
	pm.OpenAPI.get('users/show', 'uid=1908736117', function(data) {
		// 处返回理数据
	});
	
	// POST 请求
	pm.OpenAPI.post('statuses/update', 'status=' + encodeURIComponent('这是一条测试微博'), function(data) {
		// 处返回理数据
	});
```

### 2.Upload API 上传接口:

可以通过此接口，上传文件到微盘

```
	pm.Upload(options, function(data) {
		// 处理返回数据，返回数据中包含fid, vfid, tovfid及几张缩略图的地址。
	});
```
`options`参数如下：
* `toUid` : 对方的用户id，必选，否则对方看不到
* `fid` : 文件的id（微盘） 可选 自动下载后再上传
* `filePath` : 文件的路径 可选
* `url` : 文件的网络地址 可选 自动下载后再上传
* `qrCode` : 二维码包含的信息 可选 先生成二维码，再上传

`fid`, `filePath`, `url`, `qrCode` 选择其一。

------ 

## Advanced API 高级接口:

### 1. Message Model 消息类：

在每次回复和发送私信的过程中，都可以新建一个消息实体

    var message = new pm.Message();    

设置需要回复的消息的id或者用户的id
 
    message.setId("msg id");
    message.setUid("user id");

设置文本，将发出文本消息
 
    message.setText("message text");

添加图文信息，将发出图文消息，展示为Card
 
    message.addArticle("title", "summary", "image", "url");

设置地理位置，将发出地理位置的消息
 
	message.setPosition("longitude", "latitude");
    
设置图片（上传所得的id），将发出带有图片的消息
 
    message.setImage(vfid, tovfid);
    
成功回调
 
    message.success(function(rs) {
        // Execute Success RS
    });

失败错误回调
 
    message.error(function(rs) {
        // Execute Error RS
    });

开始发送
 
    message.send();

简单示例
 
    new Message()
        .setUid("1908736117")
        .setText("Hello World!")
        .success(function(rs){alert("success")})
        .error(function(rs){alert("error")})
        .send();
    
### 2.Reply Manager 回复管理器:

### 启动:

	pm.ReplyManager.start()
	
启动后，基本API Listener会失效。

### 开启分级目录功能:

	pm.ReplyManager.openFloor({
    	items : {  // 目录和进入目录显示的消息
        	"js" : "欢迎来到js脚本目录！输入 1 、 2 查看相应内容。", 
        	"css" : "欢迎来到css样式目录！输入 1 、 2 查看相应内容。",
        	"html" : "欢迎来到html页面目录！输入 1 、 2 查看相应内容。"
    	},
    	hotKey : ["menu", "菜单"], // 显示菜单帮助的命令
    	helpText : "欢迎来到此地，请输入'js', 'css', 'html'进入相应目录，输入'0'退出相应目录。", // 菜单帮助消息
    	backText : "已退出目录'FLOOR'。", // 退出目录显示的消息
    	backKey : ["0"], // 退出目录的命令
    	timeout : 300 // 自动退出目录的时间，单位s，300表示5分钟自动退出到根目录
	});
	
### 增加处理过程:

	pm.ReplyManager.addProcess({
		onMessage : function(msg, reply, floor) {},
		onEvent : function(msg, reply) {},
		onMetion : function(msg, reply) {},
		onQuitFloor : function(msg, reply) {},
		onEnterFloor : function(msg, reply) {}
	});
	
处理过程为一个对象，里面要包含`onMessage`, `onEvent`, `onMetion`, `onQuitFloor`, `onEnterFloor` 中的一个或几个方法，当有相应事件时，会调用此方法。

参数中`msg`是消息，`reply`是`pm.Message`实体，已经设置好`id`，设置回复内容后，可直接发送，`floor`为目录，开启目录功能后，会有此参数

### 删除处理过程:
	
	pm.ReplyManager.removeProcess(process);


## Process 处理过程:

可以自定义处理过程来进行消息的自动处理和回复。

下面已经完成的`4`个`Process`，之后会逐渐增加。

### 1. ReplyForEvent 事件自动回复:

示例如下:

	var rfe = pm.ReplyProcess.replyForEvent;

	rfe.init({
    	"follow" : "亲！欢迎关注本账号！输入 menu 或 菜单 查看相应内容。",
    	"unfollow" : "不要离开我，行不行吗？呜呜！"
	});

	pm.ReplyManager.addProcess(rfe);
	
### 2. ReplyForText 文本消息自动回复:

示例如下:

	var rft = pm.ReplyProcess.replyForText;

	rft.init({
    	"js" : {
        	"1" : ["text", "js是很神奇的东西"],
     		"2" : ["articles", [
                	["js很牛", "js太牛了", "http://tp2.sinaimg.cn/1908736117/180/5678518790/1", "http://weibo.com"],
                	["js很牛逼", "js太牛逼了", "http://tp2.sinaimg.cn/1908736117/180/5678518790/1", "http://weibo.com"]
              	]]
    	},
    	"css" : {
        	"1" : ["text", "css是很神奇的东西"],
        	"2" : ["image", 1055597360, 1055597367]
    	},
    	"html" : {
        	"1" : ["text", "html是很神奇的东西"],
        	"2" : ["position", "116.309868", "39.984371"]
    	}
	});

	pm.ReplyManager.addProcess(rft);

### 3. Lottery 抽奖:

示例如下:

	var lot = new pm.ReplyProcess.Lottery();

	lot.setTime("2013/11/13 12:00:00", "2013/11/13 13:00:00");

	lot.setKey(["抽奖", "cj"]);

	lot.setContent({
    	beforeEvent : "抽奖还未开始！",
    	onEvent : "成功参与抽奖，请耐心等待结果！",
    	repeat : "您已成功参与抽奖！每人只可参与一次！",
    	afterEvent : "抽奖已经结束！",
    	prize : "恭喜您获得【NAME】- TEXT ，稍后我们将私信联系您。",
    	none : "很遗憾，您没有抽中任何奖项，谢谢您的参与！"
	});

	lot.addPrize("特等奖", "宝马一辆", 1);
	lot.addPrize("一等奖", "Mac Pro一台", 1);
	lot.addPrize("二等奖", "MacBook Pro一台", 1);

	lot.setLogFile("/Users/Apple/Downloads/lot.xlsx");

	pm.ReplyManager.addProcess(lot);
	
### 4. SecKill 秒杀:

示例如下:

	var sk = new pm.ReplyProcess.SecKill();

	sk.setTime("2013/11/13 12:00:00", "2013/11/13 13:00:00");

	sk.setKey(["秒杀", "ms"]);

	sk.setContent({
    	beforeEvent : "秒杀还未开始！",
    	repeat : "您已成功秒杀！每人只可秒杀一次！",
    	afterEvent : "秒杀已经结束！",
    	success : "恭喜您获得 - NAME ，稍后我们将私信联系您。",
    	none : "商品已经全部被秒杀！"
	});

	sk.setPrize("宝马一辆", 1);

	sk.setLogFile("/Users/Apple/Downloads/sk.xlsx");

	pm.ReplyManager.addProcess(sk);



## CustomerService 客服系统 - 高级处理过程:

示例如下：

	var cs = new pm.ReplyProcess.CustomerService();

	cs.setTime("9:30", "19:00");

	cs.setKey(["客服"]);

	// 设置客服人员名称和对应的微博id
	cs.setWorkers({
    	"小洋" : "2609545991"
	});

	cs.setContent({
        outerTime : "对不起，现在不是客服服务时间。\n（服务时间9:30~18:30）",
        enter : "欢迎使用客服系统，系统正在自动为您连接客服人员，请稍候！\n(发送0可以退出客服系统)",
        follow : "【注意】由于系统限制，关注本账号，成为本账号的粉丝，才能正常使用客服系统。",
        wait : "【排队中】现在业务非常繁忙，请您稍等片刻！\n(发送0可以退出客服系统)",
        startConv : "已经连接到客服人员，客服【 NAME 】为您服务！\n(发送0可以退出客服系统)",
        stopConv : "您已经退出客服系统，欢迎下次再次使用。",
        worker : "【 NAME 】:\n欢迎进入客服人员工作系统:\n发送next接待下一位客户；\n发送 talk:用户昵称或用户id 与相应直接沟通；\n发送exit退出与当前客户的交流；\n发送0退出客服系统。",
        none : "客服系统中现在没有等待的客户。",
        new : "有新客户进入客服系统，发送next进行接待。",
        startWork : "客户已经接入。",
        stopWork : "和客户的交谈已经结束，发送next接待下一位客户。",
        notSupport : "对不起，客服系统不支持您的消息类型。",
        noUser : "用户不存在或者不是此账号的粉丝。"
    });

	pm.ReplyManager.addProcess(cs);

## Configure 统一配置:

可以统一配置这些功能:

    pm.configure(options);

配置格式为:

    {
        "floor": {
            "items": {
                "js": "欢迎来到js脚本目录！输入 1 、 2 查看相应内容。",
                "css": "欢迎来到css样式目录！输入 1 、 2 查看相应内容。",
                "html": "欢迎来到html页面目录！输入 1 、 2 查看相应内容。",
                "客服": null
            },
            "hotKey": [
                "menu",
                "菜单"
            ],
            "helpText": "欢迎来到此地，请输入\"js\",\"css\",\"html\"进入相应目录，输入\"0\"退出相应目录。",
            "backText": {
                "js": "已经退出 js 目录。",
                "css": "已经退出 css 目录。",
                "html": "已经退出 html 目录。",
                "客服": null
            },
            "backKey": [
                "0"
            ],
            "timeout": 300
        },
        "forText": {
            "js": {
                "1": [
                    "text",
                    "js是很神奇的东西"
                ],
                "2": [
                    "articles",
                    [
                        [
                            "js很牛",
                            "js太牛了",
                            "http://tp2.sinaimg.cn/1908736117/180/5678518790/1",
                            "http://weibo.com"
                        ],
                        [
                            "js很牛逼",
                            "js太牛逼了",
                            "http://tp2.sinaimg.cn/1908736117/180/5678518790/1",
                            "http://weibo.com"
                        ]
                    ]
                ]
            },
            "css": {
                "1": [
                    "text",
                    "css是很神奇的东西"
                ],
                "2": [
                    "image",
                    1055597360,
                    1055597367
                ]
            },
            "html": {
                "1": [
                    "text",
                    "html是很神奇的东西"
                ],
                "2": [
                    "position",
                    "116.309868",
                    "39.984371"
                ]
            }
        },
        "forEvent": {
            "follow": "亲！欢迎关注本账号！输入 menu 或 菜单 查看相应内容。",
            "unfollow": "不要离开我，行不行吗？呜呜！"
        },
        "customer": {
            "startTime": "9:30",
            "endTime": "19:00",
            "key": "客服",
            "workers": {
                "小洋": "2609545991"
            },
            "content": {
                "outerTime": "对不起，现在不是客服服务时间。\n（服务时间9:30~18:30）",
                "enter": "欢迎使用客服系统，系统正在自动为您连接客服人员，请稍候！\n(发送0可以退出客服系统)",
                "follow": "【注意】由于系统限制，关注本账号，成为本账号的粉丝，才能正常使用客服系统。",
                "wait": "【排队中】现在业务非常繁忙，请您稍等片刻！\n(发送0可以退出客服系统)",
                "startConv": "已经连接到客服人员，客服【 NAME 】为您服务！\n(发送0可以退出客服系统)",
                "stopConv": "您已经退出客服系统，欢迎下次再次使用。",
                "worker": "【 NAME 】:\n欢迎进入客服人员工作系统:\n发送next接待下一位客户；\n发送 talk:用户昵称或用户id 与相应直接沟通；\n发送exit退出与当前客户的交流；\n发送0退出客服系统。",
                "none": "客服系统中现在没有等待的客户。",
                "new": "有新客户进入客服系统，发送next进行接待。",
                "startWork": "客户已经接入。",
                "stopWork": "和客户的交谈已经结束，发送next接待下一位客户。",
                "notSupport": "对不起，客服系统不支持您的消息类型。",
                "noUser": "用户不存在或者不是此账号的粉丝。"
            }
        },
        "event": [
            {
                "type": "Lottery",
                "startTime": "2013/11/11 00:00:00",
                "endTime": "2013/11/11 01:00:00",
                "key": [
                    "抽奖",
                    "cj"
                ],
                "prize": [
                    [
                        "特等奖",
                        "宝马一辆",
                        1
                    ],
                    [
                        "一等奖",
                        "Mac Pro一台",
                        1
                    ],
                    [
                        "二等奖",
                        "MacBook Pro一台",
                        1
                    ]
                ],
                "content": {
                    "beforeEvent": "抽奖还未开始！",
                    "onEvent": "成功参与抽奖，请耐心等待结果！",
                    "repeat": "您已成功参与抽奖！每人只可参与一次！",
                    "afterEvent": "抽奖已经结束！",
                    "prize": "恭喜您获得【NAME】- TEXT ，稍后我们将私信联系您。",
                    "none": "很遗憾，您没有抽中任何奖项，谢谢您的参与！"
                },
                "log": "/Users/Apple/Downloads/Lottery.xlsx"
            },
            {
                "type": "SecKill",
                "startTime": "2013/11/11 00:00:00",
                "endTime": "2013/11/11 01:00:00",
                "key": [
                    "秒杀",
                    "ms"
                ],
                "prize": {
                    "name": "宝马M",
                    "num": 1
                },
                "content": {
                    "beforeEvent": "秒杀还未开始！",
                    "repeat": "您已成功秒杀！每人只可秒杀一次！",
                    "afterEvent": "秒杀已经结束！",
                    "success": "恭喜您获得 - NAME ，稍后我们将私信联系您。",
                    "none": "商品已经全部被秒杀！"
                },
                "log": "/Users/Apple/Downloads/SecKill.xlsx"
            }
        ]
    }

## Debug 调试信息:

开启调试信息输出:
	
	pm.Debug.open();