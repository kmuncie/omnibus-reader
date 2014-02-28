var app = (function() {

   'use strict';
   var privateVariable = 'app fired!',
       docElem = document.documentElement;

   return {
      publicFunction: function() {
         console.log(privateVariable);
      },
      userAgentInit: function() {
         docElem.setAttribute('data-useragent', navigator.userAgent);
      }
   };

})();

(function() {

   'use strict';

   //foundation init
   $(document).foundation();

   app.publicFunction();
   app.userAgentInit();

})();

$(document).ready(function() {
   'use strict';
   $(document).foundation();

   // Hack to get off-canvas .menu-icon to fire on iOS
   $('.menu-icon').click(false);
});

// END FRAMEWORK
