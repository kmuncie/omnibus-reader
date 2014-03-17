(function() {
   'use strict';

   // Color mode
   $('.colorMode').click(function() {
      $('.entirePage').toggleClass('darkMode');
      $('.colorMode').toggleClass('lightButton');
   });

   var doc = $(document);

   doc.ready(function() {
      doc.foundation();

      // Hack to get off-canvas .menu-icon to fire on iOS
      $('.menu-icon').click(false);

   });

}());
