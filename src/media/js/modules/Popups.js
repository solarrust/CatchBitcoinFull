const Callback = require('../classes/Callback');
const dom = require('../utils/DOM');
const BodyLocker = require('./BodyLocker');

// TODO: Add effects
const EFFECTS = {
	default: function($popup, showFlag, immediate, comleteHandler) {
		if (showFlag) {
			TweenMax.fromTo(
				$popup,
				immediate ? 0 : 0.35,
				{ autoAlpha: 0, scale: 0.98 },
				{ autoAlpha: 1, scale: 1, onComplete: comleteHandler }
			);
		} else {
			TweenMax.to($popup, immediate ? 0 : 0.35, {
				autoAlpha: 0,
				scale: 0.98,
				display: 'none',
				onComplete: comleteHandler,
			});
		}
	},

	'bottom-up': function($popup, showFlag, immediate, comleteHandler) {
		if (showFlag) {
			TweenMax.fromTo(
				$popup,
				immediate ? 0 : 0.35,
				{ autoAlpha: 0, y: 100 },
				{ autoAlpha: 1, y: 0, onComplete: comleteHandler }
			);
		} else {
			TweenMax.to($popup, immediate ? 0 : 0.35, {
				autoAlpha: 0,
				y: 100,
				display: 'none',
				onComplete: comleteHandler,
			});
		}
	},

	'right-in': function($popup, showFlag, immediate, comleteHandler) {
		if (showFlag) {
			TweenMax.fromTo(
				$popup,
				immediate ? 0 : 0.35,
				{ x: '100%', autoAlpha: 1 },
				{ x: '0%', onComplete: comleteHandler }
			);
		} else {
			TweenMax.to($popup, immediate ? 0 : 0.35, {
				x: '100%',
				display: 'none',
				onComplete: comleteHandler,
			});
		}
	},

	'scale-in': function($popup, showFlag, immediate, comleteHandler) {
		if (showFlag) {
			TweenMax.fromTo(
				$popup,
				immediate ? 0 : 0.35,
				{ autoAlpha: 0, scale: 0.98 },
				{ autoAlpha: 1, scale: 1, ease: Circ.easeOut, onComplete: comleteHandler }
			);
		} else {
			TweenMax.to($popup, immediate ? 0 : 0.35, {
				autoAlpha: 0,
				scale: 0.98,
				display: 'none',
				onComplete: comleteHandler,
			});
		}
	},
};

function Popups() {
	this.onOpen = new Callback();
	this.onClose = new Callback();
	this.onCloseStart = new Callback();

	this.opened = false;

	this.$wrapper = $('.popups-wrapper')
		.nope(true)
		.hide();
	this.$popups = $('[data-popup]').hide();

	this.$activePopup = null;
	this.activePopupName = '';

	var self = this;

	dom.$body.on('click', '[data-popup-opener]', function(e) {
		e.preventDefault();
		self.open($(this).attr('data-popup-opener'));
	});

	$('[data-popup-closer]').click(function(e) {
		e.preventDefault();
		self.close();
	});

	this.$wrapper.click(function(e) {
		if (self.opened) {
			var $target = $(e.target);
			if (!(self.$activePopup.has($target).length || self.$activePopup.is($target))) {
				self.close();
			}
		}
	});

	dom.$window.on('keydown', function(e) {
		if (self.opened && e.keyCode == 27) {
			self.close();
		}
	});

	TweenMax.set(
		$('[data-popup]').css({
			'will-change': 'transform',
		}),
		{ force3D: true }
	);
}

Popups.prototype = {
	getActivePopup: function() {
		if (this.opened) {
			return this.$activePopup;
		} else {
			return null;
		}
	},

	isOpened: function() {
		return this.opened;
	},

	open: function(name) {
		if (this.activePopupName == name) {
			return;
		}

		if (this.opened) {
			this.close(true);
		}

		var $popup = $('[data-popup="' + name + '"]');
		if (!$popup.length) {
			console.warn('No popup for ' + name + ' opener');
			return;
		}

		this.opened = true;
		this.$activePopup = $popup.show().nope(false);
		this.activePopupName = name;

		this.$wrapper.addClass('_' + name);

		TweenMax.to(this.$wrapper.show().nope(false), 0.35, {
			autoAlpha: 1,
			overwrite: true,
		});

		TweenMax.killTweensOf(this.$activePopup);
		var effect = this._getEffect(this.$activePopup.attr('data-popup-effect'));
		effect(this.$activePopup, true);

		BodyLocker.lock();

		dom.$html.addClass('_popup-opened');
		dom.$html.removeClass('_popup-closing');

		const $autoFocus = this.$activePopup.find('[data-popup-autofocus]').first();
		if ($autoFocus.length) {
			$autoFocus.delayedFocus();
		}

		this.onOpen.call(name);
	},

	close: function(immediate) {
		if (this.opened) {
			this.$wrapper.removeClass('_' + this.activePopupName);

			this.activePopupName = '';

			this.onCloseStart.call();
			this.opened = false;

			var self = this;

			TweenMax.to(this.$wrapper, 0.15, { autoAlpha: 0, display: 'none' });

			BodyLocker.unlock();

			dom.$html.addClass('_popup-closing');
			dom.$html.removeClass('_popup-opened');

			TweenMax.killTweensOf(this.$activePopup);
			var effect = this._getEffect(this.$activePopup.attr('data-popup-effect'));
			effect(this.$activePopup.nope(true), false, immediate, function() {
				self.onClose.call();

				self.$wrapper.nope(true);

				dom.$html.removeClass('_popup-closing');
			});
		}
	},

	_getEffect: function(name) {
		var effect = EFFECTS[name];
		return typeof effect == 'undefined' ? EFFECTS['default'] : effect;
	},
};

var instance = (module.exports = new Popups());
instance.version = 1;
