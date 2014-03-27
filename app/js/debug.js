/**
 * Debug functionality
 */
(function() {
   var DEBUG = true;

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