/**
 * Fetcher functionality
 */
module.require(['template', 'parser-verselink'], function(template, VerseLinkParser) {
   'use strict';

   var Controller;


   Controller = function(fetcher, template) {
      var self = this;

      this.fetcher = fetcher;
      this.template = template;
      this.languages = [];

      this.fetcher.listLanguages().then(function(languages) {
         self.languages = languages;
      });
   };



   Controller.prototype.addView = function() {
      var self = this;

      this.fetcher.listLanguages().then(function() {
         var view = self.__getView(),
             context = self.__buildContext(view);

         $('#content').append(view);

         rivets.bind(view, context);
         context.state.edition = 'http://www.jw.org/en/publications/bible/nwt/books/json/';
         context.view.find('.sel-lang').change();
      });
   };


   Controller.prototype.changeBook = function(e, c) {
      e.preventDefault();
      var bookID = parseInt(c.state.book, 10),
          book, count, i;

      book = _.find(c.state.books, function(b) {
         return b.bookNum === bookID;
      }) || _.first(c.state.books);

      c.state.book = book.bookNum;

      count = parseInt(book.chapterCount, 10);
      c.state.chapters = [];
      for (i = 0; i < count; i++) {
         c.state.chapters.push({
            chapterNum: (i + 1)
         });
      }

      c.state.chapter = 1;
      c.view.find('.sel-chapter').change();
   };


   Controller.prototype.changeChapter = function(e, c) {
      e.preventDefault();

      c.state.isLoading = true;
      c.controller.fetcher.getChapter(c.state.edition, c.state.book, c.state.chapter).then(function(chap) {
         chap = VerseLinkParser.parse(chap);
         c.state.title = chap.citation;
         c.state.content = chap.html;
         c.state.isLoading = false;
      });

      c.state.isLastChapter = (c.state.book >= c.state.books.length && c.state.chapter >= c.state.chapters.length);
   };

   Controller.prototype.showLang = function(e, c) {
      e.preventDefault();
      c.view.find('.langContainer').toggleClass('visible');
   };


   Controller.prototype.changeLanguage = function(e, c) {
      e.preventDefault();

      c.state.isLoading = true;
      c.controller.fetcher.listBooks(c.state.edition).then(function(books) {
         c.state.isLoading = false;
         c.state.books = books;
         c.view.find('.sel-book').change();
      });
   };

   Controller.prototype.prevChapter = function(e, c) {
      e.preventDefault();

      c.state.chapter--;

      c.controller.changeChapter(e, c);
   };

   Controller.prototype.nextChapter = function(e, c) {
      e.preventDefault();

      if (c.state.chapter >= c.state.chapters.length) {
         c.state.chapter = 1;
         c.state.book++;
      } else {
         c.state.chapter++;
      }

      c.controller.changeChapter(e, c);
   };


   Controller.prototype.__buildContext = function(view) {
      var context = {
         view: view,
         controller: this,
         state: {
            isLoading: true,
            isExpanding: true,
            isFirstChapter: false,
            isLastChapter: false,
            edition: '',
            book: 1,
            chapter: 1,
            books: [],
            chapters: [],
            title: null,
            content: null
         }
      };

      return context;
   };


   Controller.prototype.__getView = function() {
      return template.clone();
   };


   module.define('Controller', Controller);

});
