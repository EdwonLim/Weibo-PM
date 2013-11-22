/**
 * BtcQuery
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */

(function(module) {

    var btc = require('btc');

    var filter = {
        bitstamp : function(value) {
            var text = 'BitStamp : \n';
            text += 'High : $' + value.high + '\n';
            text += 'Low : $' + value.low + '\n';
            text += 'Ask : $' + value.ask + '\n';
            text += 'Bid : $' + value.bid + '\n';
            text += 'Last : $' + value.last + '\n';
            text += 'Volume : ' + value.volume + '\n';
            return text;
        },
        mtgox : function(value) {
            var ticker = value.data;
            var text = 'Mtgox : \n';
            text += 'High : ' + ticker.high.display + '\n';
            text += 'Low : ' + ticker.low.display + '\n';
            text += 'Avg : ' + ticker.avg.display + '\n';
            text += 'Vwap : ' + ticker.vwap.display + '\n';
            text += 'Last : ' + ticker.last.display + '\n';
            text += 'Volume : ' + ticker.vol.display + '\n';
            return text;
        },
        futures796 : function(value) {
            var ticker = value.ticker;
            var text = 'Futures796 : \n';
            text += 'High : $' + ticker.high + '\n';
            text += 'Low : $' + ticker.low + '\n';
            text += 'Buy : $' + ticker.buy + '\n';
            text += 'Sell : $' + ticker.sell + '\n';
            text += 'Last : $' + ticker.last + '\n';
            text += 'Volume : ' + ticker.vol + '\n';
            return text;
        },
        chbtc : function(value) {
            var ticker = value.ticker;
            var text = 'ChBtc : \n';
            text += 'High : ￥' + ticker.high + '\n';
            text += 'Low : ￥' + ticker.low + '\n';
            text += 'Buy : ￥' + ticker.buy + '\n';
            text += 'Sell : ￥' + ticker.sell + '\n';
            text += 'Last : ￥' + ticker.last + '\n';
            text += 'Volume : ' + ticker.vol + '\n';
            return text;
        },
        okcoin : function(value) {
            var ticker = value.ticker;
            var text = 'OKCoin : \n';
            text += 'High : ￥' + ticker.high + '\n';
            text += 'Low : ￥' + ticker.low + '\n';
            text += 'Buy : ￥' + ticker.buy + '\n';
            text += 'Sell : ￥' + ticker.sell + '\n';
            text += 'Last : ￥' + ticker.last + '\n';
            text += 'Volume : ' + ticker.vol + '\n';
            return text;
        },
        btcchina : function(value) {
            var ticker = value.ticker;
            var text = 'BtcChina : \n';
            text += 'High : ￥' + ticker.high + '\n';
            text += 'Low : ￥' + ticker.low + '\n';
            text += 'Buy : ￥' + ticker.buy + '\n';
            text += 'Sell : ￥' + ticker.sell + '\n';
            text += 'Last : ￥' + ticker.last + '\n';
            text += 'Volume : ' + ticker.vol + '\n';
            return text;
        },
        fxbtc : function(value) {
            var ticker = value.ticker;
            var text = 'FxBtc : \n';
            text += 'High : ￥' + ticker.high + '\n';
            text += 'Low : ￥' + ticker.low + '\n';
            text += 'Bid : ￥' + ticker.bid + '\n';
            text += 'Ask : ￥' + ticker.ask + '\n';
            text += 'Last : ￥' + ticker.last + '\n';
            text += 'Volume : ' + ticker.vol + '\n';
            return text;
        },
        btc100 : function(value) {
            var ticker = value.ticker;
            var text = 'BTC100 : \n';
            text += 'High : ￥' + ticker.high + '\n';
            text += 'Low : ￥' + ticker.low + '\n';
            text += 'Bid : ￥' + ticker.bid + '\n';
            text += 'Ask : ￥' + ticker.ask + '\n';
            text += 'Last : ￥' + ticker.last + '\n';
            text += 'Volume : ' + ticker.vol + '\n';
            return text;
        }
    };

    module.exports = {
        onMessage : function(msg, reply, floor) {
            if (floor == 'btc') {
                msg.text = msg.text.toLowerCase();
                if (!filter[msg.text]) {
                    msg.text = 'btcchina';
                }
                btc.price(msg.text, function(err, prices){
                    reply.setText(filter[msg.text](prices)).send();
                });
            }
        }
    };

})(module);