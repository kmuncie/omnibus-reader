/**
 * Fetcher functionality
 */
module.require(['template'], function(template) {
   'use strict';

   var Controller;


   Controller = function(fetcher, template) {
      var self = this;

      this.fetcher = fetcher;
      this.template = template;
      this.viewCount = 0;
      this.singleView = true;
      this.books = [];

      this.fetcher.listBooks().then(function(books) {
         self.books = books;
      });
   };



   Controller.prototype.addView = function() {
      var view = this.__getView(),
          context = this.__buildContext(view);

      $('#content').append(view);
      this.viewCount++;
      this.singleView = (this.viewCount === 1);

      rivets.bind(view, context);

      this.fetcher.listBooks().then(function() {
         context.view.find('.sel-book').change();
      });
   };


   Controller.prototype.changeBook = function(e, c) {
      e.preventDefault();
      var book, count, i;

      book = _.find(c.controller.books, function(b) {
         return b.bookNum === c.state.book;
      });

      count = parseInt(book.chapterCount, 10);

      c.state.chapters = [];
      for (i = 0; i < count; i++) {
         c.state.chapters.push({
            chapterNum: (i + 1)
         });
      }

      c.view.find('.sel-chapter').change();
   };


   Controller.prototype.changeChapter = function(e, c) {
      e.preventDefault();
      c.state.isLoading = true;
      c.controller.fetcher.getChapter(c.state.book, c.state.chapter).then(function(chap) {
         c.state.title = chap.citation;
         c.state.content = chap.html;
         c.state.isLoading = false;
      });

      c.state.isLastChapter = (c.state.book >= c.controller.books.length && c.state.chapter >= c.state.chapters.length);
   };


   Controller.prototype.changeSize = function(e, c) {
      var icon = c.view.find('.iconResize');

      if (c.view.hasClass('medium-8 large-4')) {
         c.view.removeClass('large-4');
         return;
      }

      if (c.view.hasClass('medium-8') && c.state.isExpanding) {
         c.view.removeClass('medium-8');
         icon.removeClass('icon-expand');
         icon.addClass('icon-contract');
         c.state.isExpanding = false;
         return;
      }

      if (c.view.hasClass('medium-8')) {
         c.view.addClass('large-4');
         c.state.isExpanding = true;
      }

      c.view.addClass('medium-8');

      if (!c.state.isExpanding) {
         icon.removeClass('icon-expand');
         icon.addClass('icon-contract');
      } else {
         icon.addClass('icon-expand');
         icon.removeClass('icon-contract');
      }
   };


   Controller.prototype.destroyView = function(e, c) {
      e.preventDefault();
      c.controller.viewCount--;
      c.controller.singleView = (c.controller.viewCount === 1);
      c.view.remove();
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
            isLastChapter: false,
            book: 1,
            chapter: 1,
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