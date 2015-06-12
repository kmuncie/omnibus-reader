/**
 * Verse link parsing functionality
 */
module.require(['debug', 'parser'], function(debug, BasicParser) {
   'use strict';

   var VerseLinkParser = BasicParser;
   VerseLinkParser.prototype = {
      parse: function(object) {
         debug.log('Parsing verses in chapter: ' + object.citation);
         object.html = this.convertLinks($('<div></div>').append(object.html)).html();

         return object;
      },

      convertLinks: function(content) {
         var self = this;
         content.find('a').each(function() {
            self.adjustLink($(this));
         });

         return content;
      },

      adjustLink: function(link) {
         if (this.isVerseLink(link)) {
            link.attr('href', link.attr('data-anchor'));
         }
      },

      isVerseLink: function(link) {
         var attr = link.attr('data-anchor');
         var hasDataAnchor = (typeof attr !== typeof undefined && attr !== false);
         var notFootnote = !link.hasClass('footnoteLink');

         return hasDataAnchor && notFootnote;
      }
   };

   module.define('parser-verselink', (function() {
      return new VerseLinkParser();
   }()));
});
