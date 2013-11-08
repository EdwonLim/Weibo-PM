# Weibo-PM

## Introduction :

SDK for Weibo Private Message Open API ，Only Authenticated User （V）.

## Use :

	npm install weibo-pm

## API :

### Include :
	
	var pm = require("weibo-pm");

### Initialize :

	pm.init(username, uid, password, appkey);
	
### Receive Message :

	pm.listener.on(function(msg) {
		//TODO Execute All Message
	});

	pm.listener.onEvent(function(msg) {
        //TODO Execute Event Message
    });

	pm.listener.onMessage(function(msg) {
        //TODO Execute Text/Image/Vioce... Message
    });

    pm.listener.onMention(function(msg) {
        //TODO Execute Mention Message
    });

### Start Listener

    pm.listener.start();

### Rely Message :

	var msgId = 'received message id',
		type = 'send message type',
		data = {}; // Message Content
	
	pm.rely(msgId, type, data, function(rs) {
		//TODO Execute Result
	});

### Send Message :

	var uid = 'user id',
		type = 'send message type',
		data = {}; // Message Content
	
	pm.send(uid, type, data, function(rs) {
		//TODO Execute Result
	});

### Message Model

    var message = new pm.Message();

    // Set MsgId or UserId

    message.setId('msg id');

    message.setUid('user id');

	// For text type

    message.setText('message text');

    // For article type

    message.addArticle('title', 'summary', 'image', 'url');

    // For position type

    message.setPosition('longitude', 'latitude');

    // Success Callback

    message.success(function(rs) {
        // Execute Success RS
    });

    // Error Callback

    message.error(function(rs) {
        // Execute Error RS
    });

    // Send

    message.send();

    // For Example

    new Message()
        .setUid('1908736117')
        .setText('Hello World!')
        .success(function(rs){alert('success')})
        .error(function(rs){alert('error')})
        .send();