define([
	'jquery',
	'backbone',
	'collections/dictionary',
	'views/word_view',
	'templates'
], function ($, Backbone, DictionaryCollection, WordView, JST) {
	'use strict';

	var GameView = Backbone.View.extend({
		id: 'game-wrapper',

		template: JST['app/scripts/templates/loop_game.ejs'],

		events: {
			'click #lg-remembered': "markWordRemembered",
			'click #lg-not-remembered': "markWordNotRemembered",
			'click #lg-next': "showNextWord"
		},

		initialize: function(options) {
			this.collections = new DictionaryCollection();
			var that = this;
			app.wordType = 'unremembered';
			this.collections.fetch({
				success: function() {
					that.wordPool = that.collections.models.filter(function(model) {
						return !model.get('remembered');
					});
					that.acceptAnswer(true);        // true when user can able to answer remembered/not remembered
					that.nextWordPool = [];
					if (!that.wordPool.length) {
						alert('There must be a word to start game!!');
					} else {
						that.renderWord();
					}
				}
			});
			this.render();
			this.$loopGame = this.$el.find('.loop-game');
			this.currentIndex = 0;
			this.$wordContainer = this.$el.find('.word-container');
			this.$gameButtons = this.$el.find('.game-option');
			this.$nextButton = this.$el.find('#lg-next');
			this.$overlay = this.$('.overlay');
		},

		render: function() {
			this.$el.html( this.template() );
		},

		renderWord: function() {
			var currentWord = this.wordPool[this.currentIndex];
			if (this.wordView) {
				this.wordView.close();
			}
			this.wordView = new WordView( {model: currentWord} );

			this.$wordContainer.html( this.wordView.render().$el );

			this.wordView.afterAppend();

			this.acceptAnswer(true);

			return this;
		},

		/**
		 * removes the word from the loop-game
		 */
		markWordRemembered: function() {
			if (!this.acceptAnswer()) { return; }
			this.acceptAnswer(false);

			this.wordPool.shift();
			checkWordPool(this);
			this.showNextWord();
		},

		/**
		 * move this word for the next loop
		 */
		markWordNotRemembered: function() {
			if (!this.acceptAnswer()) { return; }
			this.acceptAnswer(false);

			this.nextWordPool.push(this.wordPool.shift());
			checkWordPool(this);
			this.wordView.flip();
			this.$overlay.addClass('hide');
		},

		/**
		 *
		 */
		showNextWord: function() {
			if (!this.$nextButton.hasClass('active') || !this.wordPool.length) { return; }

			this.renderWord();
			this.$overlay.removeClass('hide');
		},

		acceptAnswer: function(canAnswer) {
			if (canAnswer !== undefined) {
				this.canAnswer = canAnswer;
				this.$gameButtons.toggleClass('active', canAnswer);
				this.$nextButton.toggleClass('active', !canAnswer);
			} else {
				return this.canAnswer;
			}
		},

		close: function() {
			if (this.wordView) {
				this.wordView.close();
			}

			this.remove();
		}

	});

	function checkWordPool(self) {
		if (!self.wordPool.length) {
			if (self.nextWordPool.length) {
				self.wordPool = self.nextWordPool;
				self.nextWordPool = [];
			} else {
				// Game finished
				alert('game finished');
			}
		}
	}

	return GameView;
});
