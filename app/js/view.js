/**
 * Fetcher functionality
 */
(function() {

   var View;


   View = function() {
      this.id = Math.floor(Math.random() * 10000);

      var divTemplate = $('#template').children();

      this.divView = divTemplate.clone();
      this.selectBooks = this.divView.find('.sel-book');
      this.selectChapter = this.divView.find('.sel-chapter');
      this.divLoading = this.divView.find('.loading');
      this.divVerses = this.divView.find('.verses');
      this.viewTitle = this.divView.find('.viewBookName');
      this.buttonExpand = this.divView.find('.viewExpand');
      this.iconResize = this.divView.find('.iconResize');
      this.buttonClose = this.divView.find('.viewDestroy');
      this.nextChapter = this.divView.find('.nextChapter');
   };



   View.prototype = {


      bindEvents: function(events) {
         var self = this;
         var isExpanding = true;

         this.selectBooks.change(function() {
            var bid = self.selectBooks.val();
            events.viewSelectBook(self, bid);
         });

         this.buttonExpand.click(function() {
            if (self.divView.hasClass('medium-8 large-4')) {
               self.divView.removeClass('large-4');
               return;
            }
            if (self.divView.hasClass('medium-8') && isExpanding) {
               self.divView.removeClass('medium-8');
               self.iconResize.removeClass('icon-expand');
               self.iconResize.addClass('icon-contract');
               isExpanding = false;
               return;
            }
            if (self.divView.hasClass('medium-8')) {
               self.divView.addClass('large-4');
               isExpanding = true;
            }
            self.divView.addClass('medium-8');

            if (!isExpanding) {
               self.iconResize.removeClass('icon-expand');
               self.iconResize.addClass('icon-contract');
            } else {
               self.iconResize.addClass('icon-expand');
               self.iconResize.removeClass('icon-contract');
            }
         });

         this.buttonClose.click(function() {
            events.viewDestroy(self);
         });

         this.selectChapter.change(function() {
            var bid = self.selectBooks.val();
            var cid = self.selectChapter.val();

            events.viewSelectChapter(self, bid, cid);
         });

         this.nextChapter.click(function() {
            var bid = self.selectBooks.val();
            var cid = self.selectChapter.val();

            cid++; // Next Chapter
            events.viewNextChapter(self, bid, cid);
            self.selectChapter.val(cid); // Set select to new chapter
            $('html, body').animate({ scrollTop: 0 }, 'slow');
         });
      },


      populateBookList: function(books) {
         var book, i;
         this.selectBooks.empty();

         for (i = 0; i < books.length; i++) {
            book = books[i];
            this.selectBooks.append('<option value="' + book.bookNum + '">' + book.standardAbbreviation + '</option>');
         }
      },


      populateChapterList: function(lastChapter) {
         this.selectChapter.empty();
         for (var i = 1; i <= lastChapter; i++) {
            this.selectChapter.append('<option value="' + i + '">' + i + '</option>');
         }
      },


      showChapter: function(chapter) {
         this.divVerses.html(chapter.html);
         this.viewTitle.html(chapter.citation);
      },


      setLoadingIndicator: function(visible) {
         if (visible) {
            this.divLoading.fadeIn();
            return;
         }

         this.divLoading.fadeOut();
      },


      destroyView: function() {
         this.divView.fadeOut();
      }
   };


   module.define('View', View);

}());