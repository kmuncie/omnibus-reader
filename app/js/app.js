module.require(['Controller', 'fetcher'], function(Controller, fetcher) {
   'use strict';
   var controller;

   // Boot up application
   controller = new Controller(fetcher);
   controller.addView();

   // Color mode
   $('.colorMode').click(function() {
      $('.entirePage').toggleClass('darkMode');
      $('.colorMode').toggleClass('lightButton');
   });

   // Reading mode
   $('.readingMode').click(function() {
      $('.entirePage').toggleClass('readingMode');
   });

});
