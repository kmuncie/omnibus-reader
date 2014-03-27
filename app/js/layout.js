/**
 * Fetcher functionality
 */
(function() {
   'use strict';

   var Layout,
       view_count = 0;


   Layout = function() {
      var divContent = $('#content');
      var divAddNew = $('#addNew');


      this.bindEvents = function(events) {
         divAddNew.click(function() {
            events.layoutAddView();

            if (view_count === 2) {
               $('.aView').removeClass('small-centered');
            } else if (view_count === 1) {
               $('.aView').addClass('small-centered');
            }
         });
      };


      this.addView = function(view) {
         view_count++;

         divContent.append(view.divView);
      };

      this.removeView = function(view) {
         view_count--;

         view.divView.remove();
         if (view_count === 1) {
            $('.aView').addClass('small-centered');
         }
      };
   };


   module.define('Layout', Layout);

}());