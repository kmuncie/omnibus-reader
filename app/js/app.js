(function() {
   'use strict';

   // Color mode
   $('.colorMode').click(function() {
      $('.entirePage').toggleClass('darkMode');
      $('.colorMode').toggleClass('lightButton');
   });

   // Local Storage
      // TODO

   var doc = $(document);

   doc.ready(function() {
      doc.foundation();

   });

}());
