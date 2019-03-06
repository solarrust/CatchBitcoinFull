var dom = require('../utils/DOM');
import ScrollToPlugin from 'gsap/ScrollToPlugin'; // eslint-disable-line

function ScrollHelper() {
	this.$scrollTarget = dom.$window;
	this.$lockTarget = dom.$body;

	this.$widthLockTarget = dom.$body;

	var self = this;

	$('[data-scroll-to]').mousedown(function(e) {
		e.preventDefault();

		var scrollTo = $(this).attr('data-scroll-to');
		self.scrollTo(isNaN(parseInt(scrollTo)) ? scrollTo : parseInt(scrollTo));
	});
}

ScrollHelper.prototype = {
	scrollTo: function(value, time, completeHandler, skipOnScrolling) {
		if (this._busy) {
			if (skipOnScrolling) {
				return;
			}
		}

		if (isNaN(Number(value))) {
			var $target = $(value).first();
			if (!$target.length) {
				return;
			}

			value = $target.offset().top - 80;
		}

		value = value < 0 ? 0 : value;

		var maxScroll = dom.$document.height() - dom.$window.height();
		value = value > maxScroll ? maxScroll : value;

		if (typeof time != 'number') {
			var current = this.$scrollTarget.scrollTop();
			var distance = Math.abs(current - value);
			time = distance / 1000;
			time = time < 0.25 ? 0.25 : time;
			time = time > 1.3 ? 1.3 : time;
		}

		if (Math.abs(this.$scrollTarget.scrollTop() - value) <= 20) {
			time = 0.1;
		}

		this._busy = true;

		var self = this;
		TweenMax.to(this.$scrollTarget, time, {
			scrollTo: { y: value, autoKill: false },
			ease: time < 0.75 ? Power3.easeOut : Circ.easeInOut,
			onComplete: function() {
				self._busy = false;
				if (typeof completeHandler == 'function') {
					completeHandler();
				}
			},
		});
	},
};

var instance = new ScrollHelper();
instance.version = 1;
