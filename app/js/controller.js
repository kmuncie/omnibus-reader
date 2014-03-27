/**
 * Fetcher functionality
 */
module.require(['View'], function(View) {

   var Controller;


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


         viewSelectBook: function(view, bid, cid) {
            bid = parseInt(bid, 10);
            cid = parseInt(cid, 10);

            var book = booklist.filter(function(b) {
               return b.bookNum === bid;
            })[0];

            view.populateChapterList(book.chapterCount);
            events.viewSelectChapter(view, bid, cid || 1);
         },


         viewSelectChapter: function(view, bid, cid) {
            bid = parseInt(bid, 10);
            cid = parseInt(cid, 10);

            view.setLoadingIndicator(true);
            fetcher.getChapter(bid, cid).done(function(chapter) {
               view.showChapter(chapter);
               view.setLoadingIndicator(false);
            });
         },

         viewNextChapter: function(view, bid, cid) {
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


   module.define('Controller', Controller);

});