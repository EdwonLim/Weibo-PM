// 执行各个功能点测试
var main = require('./index'),
    should = require('should');

var fetch = function(type, url, params, cb) {
    main[type](url, params, cb)
}

describe('JOIN', function() {
    it('should join params to url', function() {
        var url = main.join({
            key: 'value',
            key2: 'value2'
        }, 'http://demo.com');
        url.should.equal('http://demo.com?key=value&key2=value2');
    });
    it('should ignore null params', function() {
        var url = main.join(null, 'http://demo.com');
        url.should.equal('http://demo.com');
    });
    it('should join Array params', function() {
        var url = main.join([1, 2], 'http://demo.com');
        url.should.equal('http://demo.com?0=1&1=2');
    });
});

describe('GET', function() {
    it('should return results/err', function(done) {
        fetch('get', 'http://baidu.com', {
            key1: 'value',
            key2: 'value2'
        }, function(err,result) {
            if (!err) {
                result.should.be.a('object')
                result.should.have.property('stat');
                result.should.have.property('response');
                result.should.have.property('body');
            } else {
                err.should.be.a('object')
            }
            done();
        });
    })
});

describe('POST', function() {
    it('should return results/err', function(done) {
        fetch('post', 'http://google.com', {
            key1: 'value'
        }, function(err,result) {
            if (!err) {
                result.should.be.a('object')
                result.should.have.property('stat');
                result.should.have.property('response');
                result.should.have.property('body');
            } else {
                err.should.be.a('object')
            }
            done();
        });
    })
});