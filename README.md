# Weibo-PM

### Prowered By [Edwon Lim](http://edwon.me)

-------

## Introduction 介绍:

* 新浪微博粉丝服务私信管理工具，用于认证用户（蓝V，橙V）的自主服务，
* 详见 [http://open.weibo.com/wiki/粉丝服务开发模式指南](http://open.weibo.com/wiki/粉丝服务开发模式指南)

![NPM](https://nodei.co/npm/weibo-pm.png)

* 从0.5.0版本开始，为完整的稳定版本。

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
	pm.OpenAPI.get("users/show", "uid=1908736117", function(data) {
		// 处返回理数据
	});
	
	// POST 请求
	pm.OpenAPI.post("statuses/update", "status=" + encodeURIComponent("这是一条测试微博"), function(data) {
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

### 3.Status 发送微博:

可以通过此接口，发布微博

```
	pm.Stauts(options, function(data) {
		// 平台标准返回
	});
```

`options`参数如下：
* `text` : 微博内容，必选
* `pic` : 图片路径 可选 (**暂时仅支持本地图片，以后会拓展**)
* `visible` : 可见度 可选 

### 4.Base62 微博ID转换:

对微博的ID进行转换

```
	pm.Base62.encode(mid);
	
	pm.Base62.decode(id);
```

微博的ID为`mid`，微博的实际路径为`http://weibo.com/用户id/base62的微博id`。

### 5.Debug 调试输出:

* 打开日志输出 `pm.Debug.open()`
* 日志输出 `pm.Debug.log(......)`

------ 

## Message Model 消息实体：

在每次回复和发送私信的过程中，都可以创建一个消息实体

```
    var message = new pm.Message();    
```

设置需要回复的消息的id或者用户的id (**两者必选其一**)
 
```
    message.setId("msg id");
    message.setUid("user id");
```

设置文本信息，将发出文本消息

```
    message.setText("message text");
```

添加图文信息，将发出图文消息，展示为媒体Card

```
    message.addArticle("title", "summary", "image", "url");
```

设置地理位置，将发出地理位置的消息

```
	message.setPosition("longitude", "latitude");
```
    
设置图片（上传所得的id），将发出带有图片的消息
 
```
    message.setImage(vfid, tovfid);
```

设置图片路径，将发出带有图片的消息

```
	message.setImagePath("/path/to/file");
```

设置图片网络路径，将发出带有图片的消息

```
	message.setImageUrl("http://path/to/file");
```

设置图片微盘id，将发出带有图片的消息

```
	message.setImageId(id);
```

设置二维码信息，将发出带有图片的消息

```
	message.setQrCode("This is \"QRCode Info\".");
```
    
成功回调
 
```
    message.success(function(rs) {
        // 处理成功结果
    });
```

失败错误回调

```
    message.error(function(rs) {
        // 处理失败结果
    });
```

开始发送

```
    message.send();
```

简单示例

``` 
    new Message()
        .setUid("1908736117")
        .setText("Hello World!")
        .success(function(rs){alert("success")})
        .error(function(rs){alert("error")})
        .send();
```

-----

## Mention Manager @管理器:

（**需要申请前文所说的Mention权限**）

### 启动

```
	pm.MentionManager.start();
```

### 监听某一微博的转发:

```
	// 微博的id 监听函数
	pm.MentionManager.addRepostListener(statusId, function(user) {
		// 返回的user.uid是用户的id
	});
```

### 移除对某一微博的转发的监听:

```
	pm.MentionManager.removeRepostListener(statusId);
```
### 监听某一微博中的@自己的评论:

```
	// 微博的id 监听函数
	pm.MentionManager.addCommentListener(statusId, function(user) {
		// 返回的user.uid是用户的id
	});
```

### 移除对某一微博中的@自己的评论的监听:

```
	pm.MentionManager.removeCommentListener(statusId);
```

-----
    
## Reply Manager 回复管理器:

### 启动:

```
	pm.ReplyManager.start();
```	
启动后，基本API Listener会失效。（**基本API Listener不是队列是单个绑定**）

### 开启分级目录功能:

目录配置信息:
* `items` : 目录（功能）及进入目录后，提示的信息（下面的配置中`js`，`css`，`html`对应的是目录，而`咨询`，`投诉`，`反馈`，`客服`则是对应的功能，将在后面具体讲解）
* `hotKey` : 关键词，用户发送关键词，会回复目录帮助信息
* `helpText` : 目录帮助信息
* `backText` : 退出目录返回的信息
* `backKey` : 退出目录的关键词
* `timeout` : 自动退出目录的等待时间，单位是秒 300表示5分钟没有消息，自动退出目录到根目录。

```
	pm.ReplyManager.openFloor({
        "items": {
            "js": "欢迎来到js脚本目录！发送 1 、 2  、 3 查看相应内容。",
            "css": "欢迎来到css样式目录！发送 1 、 2  、 3 查看相应内容。",
            "html": "欢迎来到html页面目录！发送 1 、 2 、 3 查看相应内容。",
            "咨询": "请输入您需要咨询的问题。",
            "投诉": "请输入您需要投诉的问题。",
            "反馈": "请输入您需要反馈的问题。",
            "客服": null
        },
        "hotKey": ["menu", "菜单"],
        "helpText": "欢迎您的访问：\n请发送\"js\",\"css\",\"html\"进入相应目录，输入\"0\"退出相应目录；\n发送`咨询`，`投诉`，`反馈`，`客服`进入相应功能。",
        "backText": {
            "js": "已经退出 js 目录。",
            "css": "已经退出 css 目录。",
            "html": "已经退出 html 目录。"
        },
        "backKey": ["0"],
        "timeout": 300
    });
```    

### 处理过程:

处理过程是真正处理消息和回复消息的业务逻辑，开发者这可以自定义一些业务逻辑。

处理过程是一个对象，里面要包含`onMessage`, `onEvent`, `onQuitFloor`, `onEnterFloor` 中的一个或几个方法，当有相应事件时，会调用对应方法，接收到消息后，进项处理。

每个方法都可以有返回值

* 如果返回值是"break"，那么消息不会继续进入到后续的处理过程中，类似于阻止冒泡
* 如果返回值是"keep"，那么此目录的有效时间将变为1天

```
	var Process = {
		onMessage : function(msg, reply, floor) {}, // 有私信消息
		onEvent : function(msg, reply) {}, // 有事件消息
		onQuitFloor : function(msg, reply, floor) {}, // 退出目录
		onEnterFloor : function(msg, reply, floor) {} // 进入目录
	}

```

参数中`msg`是消息，`reply`是`pm.Message`实体，已经设置好`id`和`uid`，设置回复内容后，可直接发送，`floor`为目录，开启目录功能后，会有此参数。
	
### 增加处理过程:

```
	pm.ReplyManager.addProcess(process);
```

添加处理过程后，会为process添加3个方法

销毁处理过程(不是真正的销毁，是从处理过程的队列里移除):

```
	process.destory();
```

重置用户至根目录:

```
	process.resetUser(uid)
```

移动用户到固定目录:

```
	// 用户id，目录，目录持续时间
	process.moveUser(uid, floor, time);
```

### 删除处理过程:

```	
	pm.ReplyManager.removeProcess(process);
```

------

## 华丽丽地分割一下

### 上面的是基本的数据交互接口，开发者可以基于它构建自己的自动回复管理工具。

### 下面将是5类7种已经完成的处理功能，可以配置后直接使用。

------

## Static Auto Reply 静态自动回复:

根据用户的消息/事件，静态匹配，并自动回复静态内容。

### 1. ReplyForEvent 事件自动回复:

组件: `pm.ReplyProcess.replyForEvent`

根据用户的关注/取消关注事件，回复静态消息。

示例如下:

```
	var rfe = pm.ReplyProcess.replyForEvent;

	rfe.init({
    	"follow" : "亲！欢迎关注本账号！输入 menu 或 菜单 查看相应内容。", // 关注回复
    	"unfollow" : "不要离开我，行不行吗？呜呜！" // 取消关注回复
	});

	pm.ReplyManager.addProcess(rfe);
```
![配图](http://ww2.sinaimg.cn/large/71c50075jw1eao79t12e1j20cn0e0gmu.jpg)


### 2. ReplyForText 文本消息自动回复:

组件: `pm.ReplyProcess.replyForText`

根据用户的文本消息，回复静态消息。

示例如下:

```
	var rft = pm.ReplyProcess.replyForText;

	rft.init({
        "js": {
            "1": ["text", "js是很神奇的东西"],
            "2": [
                "articles",
                [
                    ["js很牛", "js太牛了", "http://tp2.sinaimg.cn/1908736117/180/5678518790/1", "http://weibo.com"],
                    ["js很牛逼", "js太牛逼了", "http://tp2.sinaimg.cn/1908736117/180/5678518790/1", "http://weibo.com"]
                ]
            ],
            "3" : ["imagePath", "/Users/Apple/Documents/npm.png"]
        },
        "css": {
            "1": ["text", "css是很神奇的东西"],
            "2": ["image", 1055597360, 1055597367],
            "3": ["imageUrl", "http://tp2.sinaimg.cn/1908736117/180/5678518790/1"]
        },
        "html": {
            "1": ["text", "html是很神奇的东西"],
            "2": ["position", "116.309868", "39.984371"],
            "3": ["qrCode", "http://weibo.com"]
        }
    });

	pm.ReplyManager.addProcess(rft);
```
* 图示1：
![配图](http://ww1.sinaimg.cn/large/71c50075jw1eao7hfzro1j209008pt8x.jpg)

* 图示2：
![配图](http://ww4.sinaimg.cn/large/71c50075jw1eao7gcr3n0j208w08k3yq.jpg)

* 图示3：
![配图](http://ww4.sinaimg.cn/large/71c50075jw1eao7ixb8p5j208x08kglx.jpg)

* 图示4：
![配图](http://ww2.sinaimg.cn/large/71c50075jw1eao7jiubsej209108ut93.jpg)

------

## Event 活动(纯私信):

### 1.Lottery 乐透大抽奖

抽奖活动：通过私信发送固定消息后可以参与抽奖，结束时，会随机抽出幸运用户，自动发送获奖和未获奖的消息。 可以创建多次抽奖活动。

组件: `pm.ReplyProcess.Lottery`

示例如下:

```	
	// 创建示例
	var lot = new pm.ReplyProcess.Lottery();

	// 设置开始和结束时间
	lot.setTime("2013/11/11 00:00:00", "2013/11/11 01:00:00");

	// 设置参与活动的固定消息
	lot.setKey(["抽奖", "cj"]);

	// 设置回复内容
	lot.setContent({
    	beforeEvent : "抽奖还未开始！",
    	onEvent : "成功参与抽奖，请耐心等待结果！",
    	repeat : "您已成功参与抽奖！每人只可参与一次！",
    	afterEvent : "抽奖已经结束！",
    	prize : "恭喜您获得【NAME】- TEXT ，稍后我们将私信联系您。",
    	none : "很遗憾，您没有抽中任何奖项，谢谢您的参与！"
	});

	// 增加奖项
	lot.addPrize("特等奖", "宝马一辆", 1);
	lot.addPrize("一等奖", "Mac Pro一台", 1);
	lot.addPrize("二等奖", "MacBook Pro一台", 1);

	// 设置结果输出文件 Excel
	lot.setLogFile("/Users/Apple/Downloads/lot.xlsx");

	// 增加处理过程
	pm.ReplyManager.addProcess(lot);
```
	
获取结果 : `lot.getResult();`

图示:
![图例](http://ww2.sinaimg.cn/large/71c50075jw1eao83ffbq2j209108rglw.jpg)

	
### 2. SecKill 秒杀:

抽奖活动：通过私信发送固定消息后可以参与秒杀，秒杀按照私信先来后到来排序，先到先得，秒完为止。 可以创建多次秒杀活动。

组件: `pm.ReplyProcess.SecKill`

示例如下:

```	
	// 创建秒杀活动实例
	var sk = new pm.ReplyProcess.SecKill();

	// 设置开始和结束时间
	sk.setTime("2013/11/11 00:00:00", "2013/11/11 01:00:00");

	// 设置参与活动的固定消息
	sk.setKey(["秒杀", "ms"]);

	// 设置回复内容
	sk.setContent({
    	beforeEvent : "秒杀还未开始！",
    	repeat : "您已成功秒杀！每人只可秒杀一次！",
    	afterEvent : "秒杀已经结束！",
    	success : "恭喜您获得 - NAME ，稍后我们将私信联系您。",
    	none : "商品已经全部被秒杀！"
	});
	
	// 增加奖项
	sk.setPrize("宝马一辆", 1);

	// 设置结果输出文件 Excel
	sk.setLogFile("/Users/Apple/Downloads/sk.xlsx");

	// 增加处理过程
	pm.ReplyManager.addProcess(sk);
```

获取结果 : `sk.getResult();`

图示:

![图例](http://ww2.sinaimg.cn/large/71c50075jw1eao8betq7gj209a08v74i.jpg)

------

## Event 活动(私信与转发结合):

### RepostDiscount 转发获取获取优惠劵:

转发相应微博后，会用私信通知粉丝，然后粉丝回复相应内容，即可获得优惠劵。

组件：`pm.ReplyProcess.RepostDiscount`

```
	// 创建活动实例
	var rd = new pm.ReplyProcess.RepostDiscount("转发优惠活动");

	// 设计关键字
	rd.setKey("优惠");

	// 设置优惠劵数量
	rd.setNum(100);

	// 设置时间和发送的微博
	rd.setConf("2013/11/11 00:00:00", "2013/11/11 01:00:00", {
    	text : "[Test] 关注本账号，并转发此微博，有机会获得本店优惠劵一张。【测试测试测试】"
	});

	// 设置回复内容
	rd.setContent({
    	repostSuccess : "非常感谢您转发我们的微博，现在您可以回复\"优惠\"获得优惠券。",
    	success : "您已经成功获得优惠劵，消费时请出示微博昵称即可。",
    	none : "优惠劵已经派发完，歇歇您的参与"
	});

	// 添加处理过程
	pm.ReplyManager.addProcess(rd);
```
图示:

![图例](http://ww3.sinaimg.cn/large/71c50075jw1eapduxk0quj209c08vdg7.jpg)


------

## MailBox 信箱:

信箱，留言箱，提供用户留言功能，并具有分类的功能（创建多个MailBox实例），为大V提供真正的留言功能。

组件: `pm.ReplyProcess.MailBox`

它能将用户的留言以三种形式存储：
1. 以私信的形式转发给其他固定的账号，这是这个账号和大V得私信列表就是留言记录。
2. 以邮件的形式发到固定的账号，当然两个邮件账号之间的邮件列表就是留言记录，而且方便处理。
3. 以http post形式提交到指定的url，这个适用于公司有自己的留言系统的。

### 私信形式:

示例代码

```	
	// 创建MailBox实例
	var mb = new pm.ReplyProcess.MailBox("咨询系统");
	
	// 设置相应关键字
    mb.setKey("咨询");
    
    // 设置回复内容
    mb.setContent({
    	"success": "您的咨询问题已经收到，我们将找专业人员为您解答！",
    	"notSupport": "对不起，系统不支持您的消息类型。"
    });
    
    // 设置类型 message 第二个参数为uid列表，是转发给的用户的id
    mb.setType("message", ["2609545991"]);
    
    // 添加处理过程
    pm.ReplyManager.addProcess(mb);
```

* 图示1:
![配图](http://ww4.sinaimg.cn/large/71c50075jw1eao8whr2jtj208w08mt8y.jpg)
* 图示2:
![配图](http://ww1.sinaimg.cn/large/71c50075jw1eao8xdlaz4j20gk087weq.jpg)

### 邮件形式

示例代码

```	
	// 创建MailBox实例
	var mb = new pm.ReplyProcess.MailBox("投诉系统");
	
	// 设置相应关键字
    mb.setKey("投诉");
    
    // 设置回复内容
    mb.setContent({
    	"success": "您的投诉问题已经收到，我们将找专业人员为您解答！",
    	"notSupport": "对不起，系统不支持您的消息类型。"
    });
    
    // 设置类型 
    mb.setType("mail", {
    	"host": "smtp.163.com", // 邮件服务器，暂时仅支持stmp协议
    	"secureConnection": true, // 加密否
    	"port": 465, // 端口
    	"user": "yinxl_002@163.com", // 发邮件的邮箱账户
    	"pass": "******", // 对应的密码
    	"toUser": "edwon.lim@gmail.com" // 发给的邮箱账户
    });
    
    // 添加处理过程
    pm.ReplyManager.addProcess(mb);
```

* 图示1:
![配图](http://ww2.sinaimg.cn/large/71c50075jw1eao92ii1ntj209c08smxg.jpg)
* 图示2:
![配图](http://ww1.sinaimg.cn/large/71c50075jw1eao92ubwdrj20cv0863yp.jpg)


### Post形式

示例代码

```	
	// 创建MailBox实例
	var mb = new pm.ReplyProcess.MailBox("反馈系统");
	
	// 设置相应关键字
    mb.setKey("反馈");
    
    // 设置回复内容
    mb.setContent({
    	"success": "您的反馈问题已经收到，我们将找专业人员为您解答！",
    	"notSupport": "对不起，系统不支持您的消息类型。"
    });
    
    // 设置类型 
    mb.setType("server", {
    	"url" : "http://127.0.0.1:8080/",
    	"token" : "feedback"
    });
    
    
    // 添加处理过程
    pm.ReplyManager.addProcess(mb);
```

注意：为了防止`url`被非法提交，`server`接收的`post`参数里有`token`，`tag`，`timestamp`三个参数，
其中 `token` 应该等于 `sha1(tag + static_token + timestamp)`，`static_token`为配置中的`feedback`。

因为`static_token`是不公开的，服务器可以通过`token`验证请求是不是来自本系统，从而排除非法提交。

------


## CustomerService 客服系统:

基于微博私信的客服系统，使一个大V账号，可以连接多个客服账号，而用户只需和大V进行私信交互，就可实现和客服的一对一交交流。首先方便了用户，让用户通过与只一个账号互动，而完成很多事情，然后对于大V用户，更容易管理，并借助微博私信的便利，形成自己的客服系统。

组件: `pm.ReplyProcess.CustomerService`

示例如下：

```
	// 创建客服系统实例
	var cs = new pm.ReplyProcess.CustomerService();
	
	// 设置启用时间
	cs.setTime("9:30", "19:00");

	// 设置关键字
	cs.setKey(["客服"]);

	// 设置客服人员名称和对应的微博用户Id
	cs.setWorkers({
    	"小洋" : "2609545991"
	});

	// 设置回复内容
	cs.setContent({
        outerTime : "对不起，现在不是客服服务时间。\n（服务时间9:30~19:00）",
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

	// 添加处理过程
	pm.ReplyManager.addProcess(cs);
```
	
### 用户操作:

* 对于用户，需要输入关键字`客服`，即可进入客服系统，进入后会有相应提示。（**使用客服系统的用户应是粉丝用户**）
* ![配图](http://ww2.sinaimg.cn/large/71c50075jw1eao9ydvf7mj209508oaaf.jpg)
* 当客服接入后，会有提示，然后和正常聊天相同，发消息即可。
* ![配图](http://ww4.sinaimg.cn/large/71c50075jw1eaoa7c99s4j209f08m74t.jpg)
* 输入`0`，可以立刻退出客服系统。
* ![配图](http://ww1.sinaimg.cn/large/71c50075jw1eaoagw4pjlj209c08twey.jpg)

### 客服操作:

* 对于客服，需要输入关键字`客服`，即可进入客服系统，进入后会有相应提示。（**客服最好是大V的互粉用户**）
* ![配图](http://ww3.sinaimg.cn/large/71c50075jw1eaoa36r59lj209m08pdgc.jpg)
* 发送`next`，可以接待下一位客户。
* 当然也可以用`talk:edwon_lim`直接联系客户。
* 连接成功后，会用客户信息的简介。
* ![配图](http://ww2.sinaimg.cn/large/71c50075jw1eaoa6fsu6cj209508kmxe.jpg)
* 对于客服人员，会有特殊的输入规则，
  * `qr:二维码信息`：客户会收到一个二维码图片,
  * `url:图片地址`：客户会收到相应图片,
  * `pos:精度,纬度`：客户会收到一个带有地理位置信息的消息
  * `place:地点名`：客户会收到一个带有地理位置信息的消息（**地点名尽量明确，否则容易有差错**）
* 客服人员可以输入`exit`结束与此客户的连接。
* ![配图](http://ww1.sinaimg.cn/large/71c50075jw1eaoag3lcdpj209708jdg4.jpg)
* 输入`0`，可以立刻退出客服系统。

------

## Development & Deployment 开发和部署:

### 开发测试

由于大V账号不是非常容易申请，很有可能很多开发者共用一个账号测试，这样一个人发的测试消息，另一个人的程序也会收到，容易造成错乱。

对于这种情况，可以在初始化时使用`filter`来解决:

```
	var allowUids = [1908736117, 2609545991];

	pm.init(username, uid, password, appkey, function(msg) {
		if (allowUids.indexOf(msg.fromUid) > -1) {
			return true;
		}
	});
```
只处理`uid`是1908736117和2609545991的消息，这样不同的程序会处理不同的消息。

### 分离部署

当私信量足够大的时候，单独一个服务可能在压力和处理速度上会遇到瓶颈，而nodejs的效率要与编译性语言稍差，所以这就需要将服务部署很多份，而且互不影响。

* 对于`Event`活动，可以单独部署一个服务，这个服务不支持目录，不支持各种回复，只支持此活动，活动的消息，别的服务不会处理，只是这个服务进行处理。活动进行完，可以直接停止服务，不用再占用资源。

* 同样的，不同类型的处理过程（Process）可以部署到不同的环境，不同的机器上。

* 也可以使用开发测试时的方法，使用`filter`设定每个服务处理消息的`uid`范围，不用的服务处理不同范围用户的消息，这样可以分流压力。

------


## Configure 统一配置:

可以统一配置这些功能:

```
    pm.configure(options);
```

配置格式为:

```
{
    "floor": {
        "items": {
            "js": "欢迎来到js脚本目录！输入 1 、 2  、 3 查看相应内容。",
            "css": "欢迎来到css样式目录！输入 1 、 2  、 3 查看相应内容。",
            "html": "欢迎来到html页面目录！输入 1 、 2 、 3 查看相应内容。",
            "咨询": "请输入您需要咨询的问题。",
            "投诉": "请输入您需要投诉的问题。",
            "反馈": "请输入您需要反馈的问题。",
            "客服": null
        },
        "hotKey": [
            "menu",
            "菜单"
        ],
        "helpText": "欢迎您的访问：\n请发送\"js\",\"css\",\"html\"进入相应目录，输入\"0\"退出相应目录；\n发送`咨询`，`投诉`，`反馈`，`客服`进入相应功能。",
        "backText": {
            "js": "已经退出 js 目录。",
            "css": "已经退出 css 目录。",
            "html": "已经退出 html 目录。"
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
            ],
            "3" : [
                "imagePath",
                "/Users/Apple/Documents/npm.png"
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
            ],
            "3": [
                "imageUrl",
                "http://tp2.sinaimg.cn/1908736117/180/5678518790/1"
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
            ],
            "3": [
                "qrCode",
                "http://weibo.com"
            ]
        }
    },
    "forEvent": {
        "follow": "亲！欢迎关注本账号！输入 menu 或 菜单 查看相应内容。",
        "unfollow": "不要离开我，行不行吗？呜呜！"
    },
    "customer": {
        "startTime": "9:00",
        "endTime": "21:30",
        "key": "客服",
        "workers": {
            "小洋": "2609545991"
        },
        "content": {
            "outerTime": "对不起，现在不是客服服务时间。\n（服务时间9:30~21:30）",
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
            "noUser": "用户不存在或者不是此账号的粉丝。",
            "noPlace": "地点不存在。"
        }
    },
    "box": [
        {
            "name": "咨询信箱",
            "key": "咨询",
            "type": "message",
            "data": [
                "2609545991"
            ],
            "content": {
                "success": "您的咨询问题已经收到，我们将找专业人员为您解答！",
                "notSupport": "对不起，系统不支持您的消息类型。"
            }
        },
        {
            "name": "投诉信箱",
            "key": "投诉",
            "type": "mail",
            "data": {
                "host": "smtp.163.com",
                "secureConnection": true,
                "port": 465,
                "user": "yinxl_002@163.com",
                "pass": "******",
                "toUser": "edwon.lim@gmail.com"
            },
            "content": {
                "success": "您的投诉已经受理，谢谢您的支持！",
                "notSupport": "对不起，系统不支持您的消息类型。"
            }
        },
        {
            "name": "反馈信箱",
            "key": "反馈",
            "type": "server",
            "data": {
                "url" : "http://127.0.0.1:8080/",
                "token" : "feedback"
            },
            "content": {
                "success": "您的咨询问题已经收到，我们将找专业人员为您解答！",
                "notSupport": "对不起，系统不支持您的消息类型。"
            }
        }
    ],
    "event": [
        {
            "type": "Lottery",
            "name" : "双11抽奖活动",
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
            }
        },
        {
            "type": "SecKill",
            "name" : "双11日秒杀活动",
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
            }
        },
        {
            "type": "RepostDiscount",
            "name" : "转发微博换优惠劵活动",
            "startTime": "2013/11/11 00:00:00",
            "endTime": "2013/11/11 01:00:00",
            "key": [
                "优惠"
            ],
            "status" : {
                "text" : "[Test] 关注本账号，并转发此微博，有机会获得本店优惠劵一张。"
            },
            "num" : 100,
            "content" : {
                "repostSuccess" : "非常感谢您转发我们的微博，现在您可以回复\"优惠\"获得优惠券。",
                "success" : "您已经成功获得优惠劵，消费时请出示微博昵称即可。",
                "none" : "优惠劵已经派发完，歇歇您的参与"
            }
        }
    ]
}
```
    
------

## TODO 要做的：

1. 优化代码。
2. 集成系统，统一管理多份部署的服务。
3. 桌面系统，基于Node-Webkit开发桌面端的服务，方便操作，可视直观。