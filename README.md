# Weibo-PM

## Introduction 介绍 :

新浪微博粉丝服务私信管理工具，用于认证用户（蓝V，橙V）的自主服务，
详见 [http://open.weibo.com/wiki/粉丝服务开发模式指南](http://open.weibo.com/wiki/粉丝服务开发模式指南)

## Install 安装:

	npm install weibo-pm
	
## Use 使用:

	var pm = require("weibo-pm");

## Base API 基本接口:

### 1.Initialize 初始化:

用户名，用户id，用户密码，用户绑定的appkey
 
	pm.init(username, uid, password, appkey);
	
### 2.Receive Message 接收消息:

监听所有消息
 
	pm.listener.on(function(msg) {
		//TODO Execute All Message
	});

监听事件消息（关注和取消关注）
 
	pm.listener.onEvent(function(msg) {
        //TODO Execute Event Message
    });

监听私信消息（包括文本，图片，地理位置，语音等）
 
	pm.listener.onMessage(function(msg) {
        //TODO Execute Text/Image/Vioce... Message
    });
    
监听@消息
 
    pm.listener.onMention(function(msg) {
        //TODO Execute Mention Message
    });

### 3.Start Listener 启动监听:

启动监听（每3分钟会重新建立HTTP连接）

    pm.listener.start();

### 4.Rely Message 回复消息:

需要回复的消息的id，类型和数据，详细参看文档
 
	pm.rely(msgId, type, data, function(rs) {
		//TODO Execute Result
	});
	
文档：[http://open.weibo.com/wiki/2/messages/reply](http://open.weibo.com/wiki/2/messages/reply)

### 5.Send Message 发送消息:

用户id，类型和数据，详细参看文档 之可给粉丝发送私信
 
	pm.send(uid, type, data, function(rs) {
		//TODO Execute Result
	});

文档：[http://open.weibo.com/wiki/2/messages/send](http://open.weibo.com/wiki/2/messages/send)

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
	    startTime : 'yyyy/MM/dd hh:mm:ss',
	    endTime : 'yyyy/MM/dd hh:mm:ss',
	    onStart : function() {},
	    onEnd : function() {},
		onMessage : function(msg, reply, floor) {},
		onEvent : function(msg, reply) {},
		onMetion : function(msg, reply) {},
		onQuitFloor : function(msg, reply) {},
		onEnterFloor : function(msg, reply) {}
	});
	
处理过程为一个对象，里面要包含`onMessage`, `onEvent`, `onMetion`, `onQuitFloor`, `onEnterFloor`, `onStart`, `onEnd` 中的一个或几个方法，当有相应事件时，会调用此方法。

`startTime`和`endTime`为过程开始和结束时间。

参数中`msg`是消息，`reply`是`pm.Message`实体，已经设置好`id`，设置回复内容后，可直接发送，`floor`为目录，开启目录功能后，会有此参数

### 删除处理过程:
	
	pm.ReplyManager.removeProcess(process);


## Process 处理过程:

可以自定义处理过程来进行消息的自动处理和回复。

下面已经有两个完成的`Process`，之后会逐渐增加。

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


## Debug 调试信息:

开启调试信息输出:
	
	pm.Debug.open();