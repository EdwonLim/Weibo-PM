![logo](https://cdn2.iconfinder.com/data/icons/fatcow/32/beer.png) beer ![npm](https://badge.fury.io/js/beer.png)
======

a useful warpper of request. have a drink and waiting for results callback.

### How to install 

````
$ npm install beer
````

### Sample code

````javascript
var beer = require('beer');

beer.get("http://google/com",{
    query: {
        param: 1,
        param2: 2
    }
},function(err,result){
    if (!err) {
        // enjoy !
        console.log(result)
    } else {
        console.log('Opps !!');
    }
});
````

### API

#### beer.get(url,params,callback)

- `url` [String]
- `params` [Object]
    - `query`
        - `key` : `value` : params will join `URL` as `?key=value`
- `callback` [Funtion]
    - error : null or error object
    - result : fetch result

#### beer.post(url,params,callback)

- `url` [String]
- `params` [Object] sent as `form`
    - `key` : `value`
- `callback` [Funtion]
    - error : null or error object
    - result : fetch result

### Run unit-test (Mocha)

````
$ git clone https://github.com/turingou/beer.git
$ cd beer
$ npm install // will install mocha localy
$ npm test
````