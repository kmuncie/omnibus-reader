module.require(['Controller', 'fetcher'], function(Controller, fetcher) {
   'use strict';
   var doc = $(document),
       controller;


   // TODO: What is this?
   doc.ready(function() {
      doc.foundation();
   });


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

   // Add more readers
   $('#addNew').click(function() {
      controller.addView();
   });
});
