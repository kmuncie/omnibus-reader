//    ___                      _     _
//   / _ \   _ __    _ _      (_)   | |__    _  _     ___
//  | (_) | | '  \  | ' \     | |   | '_ \  | +| |   (_-<
//   \___/  |_|_|_| |_||_|   _|_|_  |_.__/   \_,_|   /__/_
// _|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|
// "`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'
//
// A reader application
//    Created by:
//    Kevin Muncie, Joshua Steelman, Ruben Luna, Jonathan James, Evan Yu
(function() {
   'use strict';
   var Fetcher, Layout, View, Controller,
       view_count = 0;



   Fetcher = function() {}
   Fetcher.prototype = {
      BASE_URL: 'http://www.jw.org/en/publications/bible/nwt/books/json/',

      listBooks: function() {
         return this.__makeRequest('').then(function (data) {
            return data.editionData.books;
         });
      },


      getChapter: function(bid, cid) {
         var bcid = ('00' + bid).slice(-2) + ('00' + cid).slice(-3),
             range = bcid + '001-' + bcid + '999',
             url = 'html/' + range;

         return this.__makeRequest(url).then(function (data) {
            // returns the first range element
            return data.ranges[Object.keys(data.ranges)[0]];
         });
      },


      __makeRequest: (function() {
         var cache = {};

         return function(path) {
            path = this.BASE_URL + path + '?callback=?';

            if (!cache.hasOwnProperty(path)) {
               cache[path] = $.getJSON(path);
            }

            return cache[path];
         }
      }())
   };



   Layout = function() {
      var divContent = $('#content');
      var divAddNew = $('#addNew');


      this.bindEvents = function(events) {
         divAddNew.click(function() {
            events.layoutAddView();
         });
      };


      this.addView = function(view) {
         divContent.append(view.divView);
      };


      this.removeView = function(view) {
         view.divView.remove();
      };
   };



   View = function() {
      this.id = ++view_count;

      var divTemplate = $('#template').children();

      this.divView = divTemplate.clone();
      this.selectBooks = this.divView.find('.sel-book');
      this.selectChapter = this.divView.find('.sel-chapter');
      this.divLoading = this.divView.find('.loading');
      this.divVerses = this.divView.find('.verses');
      this.viewTitle = this.divView.find('.viewTitle');
      this.buttonClose = this.divView.find('.viewDestroy');

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
         var book;

         this.selectBooks.empty();
         for (var id in books) {
            if (books.hasOwnProperty(id)) {
               book = books[id];
               this.selectBooks.append('<option value="' + id + '">' + book.standardName + '</option>');
            }
         }
      },


      populateChapterList: function(lastChapter) {
         this.selectChapter.empty();
         for (var i = 1; i < lastChapter; i++) {
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



   Controller = function(layout, fetcher) {
      var views = [],
          booklist;

      var gettingBooks = fetcher.listBooks().done(function(books) {
         booklist = books;
      });


      this.ready = function(fn) {
         gettingBooks.done(fn);
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
               view.showChapter(chapter);
               view.setLoadingIndicator(false);
            });
         }
      };


      layout.bindEvents(events);
      this.layoutAddView = events.layoutAddView;
   };



   var layout = new Layout(),
       fetcher = new Fetcher(),
       controller = new Controller(layout, fetcher);

   controller.ready(function() {
      controller.layoutAddView();
   });

}());
