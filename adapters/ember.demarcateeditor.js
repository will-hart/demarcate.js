Ember.DemarcateEditor = Em.View.extend({
	tagName: 'div',
	attributeBindings: ['contenteditable'],

	// Variables:
	editable: false,
	isUserTyping: false,
	plaintext: false,

	// Properties:
	contenteditable: (function() {
		var editable = this.get('editable');
		return editable ? 'true' : undefined;
	}).property('editable'),

	// Observers:
	valueObserver: (function() {
		if (!this.get('isUserTyping') && this.get('value')) {
			this.get('controller').set('markdown', demarcate.parse());
			return this.setContent();
		}
	}).observes('value'),

	// Events:
	didInsertElement: function() {
		demarcate.enable(this.$().get(0));
		return this.setContent();
	},

	focusOut: function() {
		return this.set('isUserTyping', false);
	},

	keyDown: function(event) {
		if (!event.metaKey) {
			return this.set('isUserTyping', true);
		}
	},

	keyUp: function(event) {
		var val; 
		if (this.get('plaintext')) {
			val = this.set('value', this.$().text());
		} else {
			val = this.set('value', this.$().html());
		}
		
		this.set('markdown', demarcate.parse());
		return val;
	},

	setContent: function() {
		return this.$().html(this.get('value'));
	},
	
	getMarkdown: function () {
		return demarcate.parse();
	}
});