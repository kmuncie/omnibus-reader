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
         return this.__makeRequest('http://www.jw.org/en/publications/bible/json/').then(function(data) {
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
         var promise;

         path = path + '?callback=?';
         debug.log('Requesting ' + path);

         promise = $.getJSON(path);
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