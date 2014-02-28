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
   var Layout = function() {
      var divContent = $('#content');
      var divAddNew = $('#addNew');
      var divAdjWidth = $('#jsWidth');

      this.bindEvents = function(events) {
         divAddNew.click(function() {
            events.layoutAddView();
         });
         divAdjWidth.click(function() {
            events.layoutAdjWidth();
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

   };

   var view_count = 0;
   var View = function() {
      this.id = ++view_count;

      var divTemplate = $('#template').children();

      this.divView = divTemplate.clone();
      this.adjWidth = this.divView.find('#jsWidth');
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

         this.adjWidth.click(function() {
            if ($(this).hasClass('small-16')) {
               $(this).removeClass('small-16');
               $(this).addClass('small-8');
            }
            else {
               $(this).removeClass('small-8');
               $(this).addClass('small-16');
            }
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
         layoutAdjWidth: function() {
            layout.adjWidth();
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

