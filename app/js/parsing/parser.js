/**
 * Parser functionality
 */
module.require(['debug'], function(debug) {
   'use strict';

   var BasicParser;

   BasicParser = function() {};
   BasicParser.prototype = {
      parse: function(object) {
         debug.log('WARNING: parse(object) has not been overridden');
         return object;
      }
   };

   module.define('parser', BasicParser);
});
