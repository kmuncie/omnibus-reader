/**
 * Fetcher functionality
 */
module.require(['debug'], function(debug) {
   'use strict';

   var BasicFetcher;


   BasicFetcher = function() {};
   BasicFetcher.prototype = {
      getChapter: function(editionAPI, bookNum, chapterNum) {
         var range = this.__getRangeID(bookNum, chapterNum),
             url = editionAPI + 'html/' + range;

         return this.__makeRequest(url).then(function (d) {
            return d.ranges[Object.keys(d.ranges)[0]];
         });
      },


      listBooks: function(editionAPI) {
         return this.__makeRequest(editionAPI).then(function(data) {
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


      listLanguages: function() {
         return this.__makeRequest('https://www.jw.org/en/publications/bible/json/').then(function(data) {
            var langs = _.map(data.langs, function(lang) {
               lang.editions = _.filter(lang.editions, function(edition) {
                  return edition.contentAPI && edition.contentAPI.length > 0;
               });
               return lang;
            });

            langs =  _.filter(langs, function(lang) {
               return lang.editions.length > 0;
            });

            return _.sortBy(langs, function(lang) {
               return lang.lang.vernacularName;
            });
         });
      },


      __getRangeID: function(bookNum, chapterNum) {
         var range;

         bookNum = bookNum || 1;
         chapterNum = chapterNum || 1;

         range = ('00' + bookNum).slice(-2) + ('00' + chapterNum).slice(-3);
         return range + '001-' + range + '999';
      },


      __makeRequest: function(path) {
         if (!path) {
            debug.log('Trying to access a falsey path');
            return null;
         }

         /**
          * ABOUT THE FOLLOWING REQUEST IMPLEMENTATION:
          * In order to cache the ajax calls, we need to have a way to generate
          * a callback param value that is unique to the call but won't change on
          * repeated calls. Additionally instead of making multiple requests to the
          * same endpoint, we can bundle these together.
          *
          * There are probably improvements to be made here. Even though this does
          * work, please don't reuse without understanding what the implications
          * of requesting like this are.
          */

         var promise = $.Deferred(),
             /**
              * We need to use a consistant callback for each path in order to
              * take advantage of caching. Might as well just use the app name
              * with a key for the requested path.
              */
             callbackName = 'omnibusReader_' + path.replace(/\W+/g, ''),
             previousCallback = window[callbackName];

         /**
          * If we already have made a request for the url there will be a callback
          * set for it. Since we are waiting for that request, let's just tag along
          * for those results. No need to make more requests.
          */
         if (!previousCallback) {
            debug.log('Requesting ' + path);
            $.ajax({
               url: path,
               cache: true,
               jsonpCallback: callbackName,
               dataType: 'jsonp',
            });
         }

         /**
          * We have to create a callback on the window that will be
          * called once the ajax response is received. This overwrites
          * the last callback created for the given name. Therefore
          * there is some interesting handling we have to perform so
          * the old callbacks will still be called.
          */
         debug.log('Applying callback for ' + callbackName);
         window[callbackName] = function(json, depth) {
            // Depth is used for logging how many callbacks we have chained
            if (typeof depth === 'undefined') {
               depth = 0;
            }

            /**
             * This is crucial to support the chaining of requests.
             * Since we are overwriting the last callback and we want
             * the last callback to be called, make sure to call it.
             */
            if (previousCallback) {
               previousCallback(json, depth + 1);
            }

            debug.log('Resolve ' + callbackName + ' for depth: ' + depth);
            promise.resolve(json);

            /**
             * Once we have ran the callback, go ahead and remove it. This
             * way it doesn't get called again on the next request.
             */
            window[callbackName] = null;
         };

         /**
          * Not needed for functionality, but it does give reassurance
          * that the promise did run properly.
          */
         promise.done(function() {
            debug.log('Response ' + path);
         });

         return promise;
      }
   };



   module.define('fetcher', (function() {
      return new BasicFetcher();
   }()));

});