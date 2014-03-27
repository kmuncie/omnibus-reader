/**
 * Fetcher functionality
 */
module.require(['debug'], function(debug) {

   var BasicFetcher, IndexedDBFetcher;

   // Normalize IndexedDB naming
   if (!window.indexedDB) {
      window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
   }
   window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
   window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;



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
               debug.log('Requesting ' + path);
               cache[path] = $.getJSON(path);

               cache[path].done(function() {
                  debug.log('Response ' + path);
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
               debug.log('Found key ' + key + ' in ' + name + ' ObjectStore');
               getting.resolve(e.target.result);
               return;
            }

            debug.log('Found nothing for key ' + key + ' in ' + name + ' ObjectStore');
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

            debug.log('Found ' + set.length + ' rows in ' + name + ' ObjectStore');
            listing.resolve(set);
         };
      });

      return listing;
   };


   module.define('fetcher', (function() {
      if (!window.indexedDB) {
         return new BasicFetcher();
      }

      return new IndexedDBFetcher();
   }()));

});