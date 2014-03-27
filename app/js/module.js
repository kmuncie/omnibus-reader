window.module = (function() {
   var promises = {},
       getPromise;

   getPromise = function(name) {
      if (!promises[name]) {
         promises[name] = new $.Deferred();
      }

      return promises[name];
   };

   return {
      define: function(name, obj) {
         getPromise(name).resolve(obj);
      },

      require: function(deps, fn) {
         var p = _.map(deps, getPromise);

         $.when.apply($, p).then(fn);
      }
   };
}());
