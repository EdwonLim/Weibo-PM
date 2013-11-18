/**
 * Debug
 * @author Edwon Lim
 * @email Edwon.Lim@gmail.com
 */
(function(module) {

    var debug = false;

    module.exports = {
        open : function() {
            debug = true;
        },
        log : function() {
            var args = [].slice.call(arguments, 0);
            args.unshift('[Debug]');
            debug && console.log.apply({}, args);
        }
    }

})(module)