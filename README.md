# Weibo-PM

## Introduction 介绍 :

新浪微博粉丝服务私信管理工具，用于认证用户（蓝V，橙V）的自主服务，详见 [http://open.weibo.com/wiki/粉丝服务开发模式指南](http://open.weibo.com/wiki/粉丝服务开发模式指南)

## Install 安装:

	npm install weibo-pm
	
## Use 使用:

	var pm = require("weibo-pm");

## Base API 基本接口:

### Initialize 初始化:

 * 用户名，用户id，用户密码，用户绑定的appkey
 
	pm.init(username, uid, password, appkey);
	
### Receive Message 接收消息:

 * 监听所有消息
 
	pm.listener.on(function(msg) {
		//TODO Execute All Message
	});

 * 监听事件消息（关注和取消关注）
 
	pm.listener.onEvent(function(msg) {
        //TODO Execute Event Message
    });

 * 监听私信消息（包括文本，图片，地理位置，语音等）
 
	pm.listener.onMessage(function(msg) {
        //TODO Execute Text/Image/Vioce... Message
    });
    
 * 监听@消息
 
    pm.listener.onMention(function(msg) {
        //TODO Execute Mention Message
    });

### Start Listener 启动监听:

* 启动监听（每3分钟会重新建立HTTP连接）

    pm.listener.start();

### Rely Message 回复消息:

 * 需要回复的消息的id，类型和数据，详细参看文档
 
	pm.rely(msgId, type, data, function(rs) {
		//TODO Execute Result
	});
	
 * 文档：[http://open.weibo.com/wiki/2/messages/reply](http://open.weibo.com/wiki/2/messages/reply)

### Send Message 发送消息:

 * 用户id，类型和数据，详细参看文档 之可给粉丝发送私信
 
	pm.send(uid, type, data, function(rs) {
		//TODO Execute Result
	});

 * 文档：[http://open.weibo.com/wiki/2/messages/send](http://open.weibo.com/wiki/2/messages/send)

## Advanced API 高级接口:

### Message Model 消息类：

 * 在每次回复和发送私信的过程中，都可以新建一个消息实体

    var message = new pm.Message();    

 * 设置需要回复的消息的id或者用户的id
 
    message.setId('msg id');
    message.setUid('user id');

 * 设置文本，将发出文本消息
 
    message.setText('message text');

 * 添加图文信息，将发出图文消息，展示为Card
 
    message.addArticle('title', 'summary', 'image', 'url');

 * 设置地理位置，将发出地理位置的消息
 
	message.setPosition('longitude', 'latitude');
    
 * 设置图片（上传所得的id），将发出带有图片的消息
 
    message.setImage(vfid, tovfid);
    
 * 成功回调
 
    message.success(function(rs) {
        // Execute Success RS
    });

 * 失败错误回调
 
    message.error(function(rs) {
        // Execute Error RS
    });

 * 开始发送
 
    message.send();

 * 简单示例
 
    new Message()
        .setUid('1908736117')
        .setText('Hello World!')
        .success(function(rs){alert('success')})
        .error(function(rs){alert('error')})
        .send();
    
### Reply Manager 回复管理器:
