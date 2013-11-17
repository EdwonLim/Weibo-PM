var http = require('http');

http.createServer(function(req, resp) {

    var postData = '';

    req.addListener('data', function(chunk) {
        postData += chunk
    });

    req.addListener('end', function() {
        console.log(postData);
        resp.end('{success:true}');
    });

}).listen(8080);