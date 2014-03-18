//    ___                      _     _
//   / _ \   _ __    _ _      (_)   | |__    _  _     ___
//  | (_) | | '  \  | ' \     | |   | '_ \  | +| |   (_-<
//   \___/  |_|_|_| |_||_|   _|_|_  |_.__/   \_,_|   /__/_
// _|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|
// "`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'
//
// A reader application
//    Created by:
//    Kevin Muncie, Joshua Steelman, Craig Weber, Ruben Luna, Jonathan James, Evan Yu
(function() {
   'use strict';
   var BasicFetcher, IndexedDBFetcher,
       Layout,
       View,
       Controller,
       DEBUG = false,
       view_count = 0;


   // Normalize IndexedDB naming
   window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
   window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
   window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;



   function log(obj) {
      if (DEBUG) {
         console.log(obj);
      }
   }



   BasicFetcher = function() {};
   BasicFetcher.prototype = {
      BASE_URL: 'http://www.jw.org/en/publications/bible/nwt/books/json/',


      getChapter: function(bid, cid) {
         var range = this.__getRangeID(bid, cid),
             url = 'html/' + range;

         return this.__makeRequest(url).then(function (d) {
            var chapter = d.ranges[Object.keys(d.ranges)[0]];
            chapter.range = range;
            return chapter;
         });
      },


      listBooks: function() {
         return this.__makeRequest('').then(function(data) {
            var books = [],
                book, num;

            for (num in data.editionData.books) {
               if (data.editionData.books.hasOwnProperty(num)) {
                  book = data.editionData.books[num];
                  book.bookNum = parseInt(num, 10);
                  book.chapterCount = parseInt(book.chapterCount, 10);
                  books.push(book);
               }
            }

            return books;
         });
      },


      __getRangeID: function(bid, cid) {
         var bcid = ('00' + bid).slice(-2) + ('00' + cid).slice(-3),
             range = bcid + '001-' + bcid + '999';
         return range;
      },


      __makeRequest: (function() {
         var cache = {};

         return function(path) {
            path = this.BASE_URL + path + '?callback=?';

            if (!cache.hasOwnProperty(path)) {
               log('Requesting ' + path);
               cache[path] = $.getJSON(path);

               cache[path].done(function() {
                  log('Response ' + path);
               });
            }

            return cache[path];
         };
      }())
   };



   IndexedDBFetcher = function() {
      var gettingDB = new $.Deferred(),
          request = window.indexedDB.open(this.DATABASE, this.VERSION);

      request.onerror = function(event) {
         gettingDB.reject();
         window.alert('Could not open IndexedDB connection. Error: ' + event.target.errorCode);
      };

      request.onsuccess = function() {
         gettingDB.resolve(request.result);
      };

      request.onupgradeneeded = function(event) {
         var db = event.target.result,
             bookStore = db.createObjectStore('books', { keyPath: 'bookNum' }),
             chapterStore = db.createObjectStore('chapters', { keyPath: 'range' });

         bookStore.createIndex('urlSegment', 'urlSegment', { unique: true });
         chapterStore.createIndex('validRange', 'validRange', { unique: true });
      };

      this.gettingDB = gettingDB;

      // Start Mass Cache Fill
      this.__fillCache();
   };

   IndexedDBFetcher.prototype = new BasicFetcher();
   IndexedDBFetcher.prototype.DATABASE = 'BibleFetcher';
   IndexedDBFetcher.prototype.VERSION = 1;


   IndexedDBFetcher.prototype.getChapter = function(bid, cid) {
      var range = this.__getRangeID(bid, cid),
          getting = new $.Deferred(),
          self = this;

      this.__getByKey('chapters', range).done(function(chapter) {
         getting.resolve(chapter);
      }).fail(function() {
         self.__fillChapter(range).then(function() {
            return self.getChapter(bid, cid);
         }).then(function(chapter) {
            getting.resolve(chapter);
         });
      });

      return getting;
   };


   IndexedDBFetcher.prototype.listBooks = function() {
      var listing = this.__listObjectStore('books'),
          self = this;

      listing = listing.then(function(books) {
         if (books.length === 0) {
            return self.__fillBookStore().then(function() {
               return self.listBooks();
            });
         }

         return books;
      });

      return listing;
   };


   IndexedDBFetcher.prototype.__fillBookStore = function() {
      var self = this,
          listing;

      listing = this.__makeRequest('').then(function(data) {
         return data.editionData.books;
      });

      return listing.then(function(books) {
         var bookNums = Object.keys(books);

         (function insert(bookNum) {
            var book = books[bookNum];

            book.bookNum = parseInt(bookNum, 10);
            self.__insert('books', book).then(function() {
               if (bookNums.length) {
                  insert( bookNums.shift() );
               }
            });

         }( bookNums.shift() ));
      });
   };


   IndexedDBFetcher.prototype.__fillCache = function() {
      var self = this;

      this.listBooks().then(function(books) {
         (function load(i, j) {
            var book = books[i];
            var numChapters = parseInt(book.chapterCount, 10);

            self.getChapter(book.bookNum, j).then(function() {
               if (j < numChapters) {
                  j++;
               } else {
                  i++;
                  j = 1;
               }

               if (i < books.length) {
                  setTimeout(function() {
                     load(i, j);
                  }, 50);
               }
            });
         }(0, 1));
      });
   };


   IndexedDBFetcher.prototype.__fillChapter = function(range) {
      var url = 'html/' + range,
          self = this;

      return this.__makeRequest(url).then(function (d) {
         var chapter = d.ranges[Object.keys(d.ranges)[0]];
         chapter.range = range;
         return self.__insert('chapters', chapter);
      });
   };


   IndexedDBFetcher.prototype.__getByKey = function(name, key) {
      var getting = new $.Deferred();

      this.__getObjectStore(name).then(function(store) {
         var request = store.get(key);

         request.onsuccess = function(e) {
            var result = e.target.result;

            if (result !== undefined) {
               log('Found key ' + key + ' in ' + name + ' ObjectStore');
               getting.resolve(e.target.result);
               return;
            }

            log('Found nothing for key ' + key + ' in ' + name + ' ObjectStore');
            getting.reject();
         };
      });

      return getting;
   };


   IndexedDBFetcher.prototype.__getObjectStore = function(name) {
      return this.gettingDB.then(function(db) {
         var transaction = db.transaction([name], 'readwrite'),
             store = transaction.objectStore(name);
         return store;
      });
   };


   IndexedDBFetcher.prototype.__getRangeID = function(bid, cid) {
      var bcid = ('00' + bid).slice(-2) + ('00' + cid).slice(-3),
          range = bcid + '001-' + bcid + '999';
      return range;
   };


   IndexedDBFetcher.prototype.__insert = function(name, obj) {
      return this.__getObjectStore(name).then(function(store) {
         store.add(obj);
      });
   };


   IndexedDBFetcher.prototype.__listObjectStore = function(name, keyRange) {
      var listing = new $.Deferred();

      keyRange = keyRange || window.IDBKeyRange.lowerBound(0);

      this.__getObjectStore(name).then(function(store) {
         var cursorRequest = store.openCursor(keyRange),
             set = [];

         cursorRequest.onsuccess = function(e) {
            var cursor = e.target.result;

            if (cursor) {
               set.push(cursor.value);
               cursor.continue();
               return;
            }

            log('Found ' + set.length + ' rows in ' + name + ' ObjectStore');
            listing.resolve(set);
         };
      });

      return listing;
   };

   Layout = function() {
      var divContent = $('#content');
      var divAddNew = $('#addNew');


      this.bindEvents = function(events) {
         divAddNew.click(function() {
            events.layoutAddView();
            if (view_count === 2) {
               $('.aView').removeClass('small-centered');
            } else
            if (view_count === 1) {
               $('.aView').addClass('small-centered');
            }
         });
      };


      this.addView = function(view) {
         divContent.append(view.divView);
      };

      this.removeView = function(view) {
         view.divView.remove();
         if (view_count === 1) {
            $('.aView').addClass('small-centered');
         }
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
      this.viewTitle = this.divView.find('.viewBookName');
      this.buttonExpand = this.divView.find('.viewExpand');
      this.iconResize = this.divView.find('.iconResize');
      this.buttonClose = this.divView.find('.viewDestroy');

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
            console.log(view_count);
            layout.addView(view);
         },

         viewDestroy: function(view) {
            view_count = --view_count;
            console.log(view_count);
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
         }
      };


      layout.bindEvents(events);
      this.layoutAddView = events.layoutAddView;
   };



   var layout, fetcher, controller;

   layout = new Layout(),

   fetcher = (function() {
      if (!window.indexedDB) {
         return new BasicFetcher();
      }

      return new IndexedDBFetcher();
   }());

   controller = new Controller(layout, fetcher);
   controller.ready(function() {
      controller.layoutAddView();
   });

}());
