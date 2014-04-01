(function() {
   'use strict';

   $.get('template.html').then(function(html) {
      html = $(html);

      module.define('template', html);
   });
}());
