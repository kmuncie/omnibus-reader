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

// END FRAMEWORK
(function() {
   'use strict';
   var Layout = function() {
      var divContent = $('#content');
      var divAddNew = $('#addNew');

      this.bindEvents = function(events) {
         divAddNew.click(function() {
            events.layoutAddView();
         });
      };

      this.addView = function(view) {
         // console.log('addView ' + view.id);
         divContent.append(view.divView);
      };

      this.removeView = function(view) {
         // console.log('removeView ' + view.id);
         view.divView.remove();
      };
   };

   var Fetcher = function() {
      this.listBooks = function() {
         var BASE_URL = 'http://www.jw.org/en/publications/bible/nwt/books/json/';
         var url = BASE_URL + '?callback=?',
         gettingContent = $.getJSON(url);
         return gettingContent.then(function (data) {
            return data.editionData.books;
         });
      };


      /* Gets the entire chapter from the book id and chapter id

         Sample output:


      */
      this.getChapter = function(bid, cid) {
         // console.log('getChapter ' + bid + ', ' + cid);

         var BOOKS_URL = 'http://www.jw.org/en/publications/bible/nwt/books/json/';
         var bcid = ('00'+bid).slice(-2) + ('00'+cid).slice(-3),
             range = bcid + '001-' + bcid + '999',
             url = BOOKS_URL + 'html/' + range + '?callback=?',
             gettingContent = $.getJSON(url);

         return gettingContent.then(function (data) {
            // returns the first range element
            return data.ranges[Object.keys(data.ranges)[0]];
         });

      };

      // this.getMediaAPI = function(bid,cid) {
      //    var MEDIA_URL = 'http://www.jw.org/apps/E_GETPUBMEDIALINKS?pub=bi12',
      //       url = MEDIA_URL + '&booknum=' + bid + '&track=' + cid + '&langwritten=E';
      //       gettingContent = $.getJSON(url);

      //    gettingContent.done(function(data) {
      //       //
      //    });
      // };
   };

   var view_count = 0;
   var View = function() {
      this.id = ++view_count;

      var divTemplate = $('#template').children();

      this.divView = divTemplate.clone();
      this.selectBooks = this.divView.find('.sel-book');
      this.selectChapter = this.divView.find('.sel-chapter');
      this.divLoading = this.divView.find('.loading');
      this.divVerses = this.divView.find('.verses');
      this.viewTitle = this.divView.find('.viewTitle');
      this.buttonClose = this.divView.find('.viewDestroy');

      // var self = this;

      /*
      this.divLoading = $('<div></div>');
      this.divLoading.html('Please Wait...Loading Data');
      this.divLoading.hide();

      this.buttonClose = $('<input type=button></input>');
      this.buttonClose.prop('value', 'Close');
      */
   };

   View.prototype = {
      bindEvents: function(events) {
         var self = this;
         this.selectBooks.change(function() {
            var bid = self.selectBooks.val();
            events.viewSelectBook(self, bid);
         });

         this.buttonClose.click(function() {
            events.viewDestroy(self);
         });

         this.selectChapter.change(function() {
            var bid = self.selectBooks.val();
            var cid = self.selectChapter.val();
            events.viewSelectChapter(self, bid, cid);
         });
      },

      populateBookList: function(books) {
         this.selectBooks.empty();
         for (var id in books) {
            var book = books[id];
            this.selectBooks.append('<option value=' + id + '>' + book.standardName + '</option>');
         }
      },

      populateChapterList: function(lastchapter) {
         this.selectChapter.empty();
         for (var i=1;i<lastchapter;i++)
         {
            this.selectChapter.append('<option value=\"' + i + '\">' + i + '</option>');
         }
      },

      showChapter: function(chapter) {
         // console.log('showChapter');
         // console.log(chapter);
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
         //this.divView.html('test');
         // console.log('destroy');
      }
   };

   var Controller = function(layout, fetcher) {
      var views = [],
         booklist;

      var gettingBooks = fetcher.listBooks().done(function(books) {
         // console.log('listBooks done');
         booklist = books;
      });

      this.ready = function(fn) {
         gettingBooks.done(function() {
            fn();
         });
      };

      var events = {
         layoutAddView: function() {
            var view = new View();
            views.push(view);

            view.populateBookList(booklist);

            events.viewSelectBook(view, 1, 1);

            view.bindEvents(events);

            layout.addView(view);
         },
         viewDestroy: function(view) {
            layout.removeView(view);
            delete views[views.indexOf(view)];
         },
         viewDuplicate: function(view) {
            var copy = new View();
            views.push(copy);
            view.bindEvents(events);

            copy.populateBookSelect(booklist);

            events.viewSelectBook(copy, view.getSelectedBook(), view.getSelectChapter());

            layout.addView(copy);
         },
         viewSelectBook: function(view, bid, cid) {
            view.populateChapterList(booklist[bid].chapterCount);
            events.viewSelectChapter(view, bid, cid || 1);
         },
         viewSelectChapter: function(view, bid, cid) {
            view.setLoadingIndicator(true);
            fetcher.getChapter(bid, cid).done(function(chapter) {
               // console.log('getChapter done');
               view.showChapter(chapter);
               view.setLoadingIndicator(false);
            });
         }
      };

      layout.bindEvents(events);

      this.layoutAddView = events.layoutAddView;
   };

   Controller.prototype = {};

   var layout = new Layout(),
      fetcher = new Fetcher(),
      controller = new Controller(layout, fetcher);

   controller.ready(function() {
      controller.layoutAddView();
   });

}());

