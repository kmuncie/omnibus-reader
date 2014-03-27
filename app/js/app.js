module.require(['Layout', 'Controller', 'fetcher'], function(Layout, Controller, fetcher) {
   'use strict';
   var doc = $(document),
       layout, controller;

   // Color mode
   $('.colorMode').click(function() {
      $('.entirePage').toggleClass('darkMode');
      $('.colorMode').toggleClass('lightButton');
   });


   // TODO: What is this?
   doc.ready(function() {
      doc.foundation();
   });


   // Boot up application
   layout = new Layout(),
   controller = new Controller(layout, fetcher);
   controller.ready(function() {
      controller.layoutAddView();
   });
});
