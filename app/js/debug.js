/**
 * Debug functionality
 */
(function() {
   'use strict';

   var DEBUG = false;

   module.define('debug', {

      /**
       * Log a debug statement
       */
      log: function(obj) {
         if (DEBUG) {
            console.log(obj);
         }
      }

   });

}());