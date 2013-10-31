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

	pm.listener(function(msg) {
		//TODO Execute Message
	});

### Rely Message :

	var msgid = 'received message id',
		type = 'sended message type',
		data = {}; // Message Content
	
	pm.rely(msgid, type, data, function(rs) {
		//TODO Execute Result
	});

### Send Message :

	var uid = 'user id',
		type = 'sended message type',
		data = {}; // Message Content
	
	pm.send(uid, type, data, function(rs) {
		//TODO Execute Result
	});
	
