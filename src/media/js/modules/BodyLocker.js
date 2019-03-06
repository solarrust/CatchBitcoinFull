const dom = require('../utils/DOM');
const env = require('../utils/ENV');

/* eslint-disable */
function BodyLocker() {
	this.$widthTestElements = dom.$body;
	this.$lockElements = dom.$body;

	let self = this;
	dom.$window.resize(function(e) {
		self._update();
	});

	dom.$window
		.add(dom.$body)
		.add(dom.$html)
		.on('scroll', function(e) {
			self.locked && e.preventDefault();
		});
}

BodyLocker.prototype = {
	_update() {
		if (this.locked) {
			dom.$body.width(window.innerWidth - this.scrollWidth).css({
				overflow: 'hidden',
			});
		}
	},

	lock() {
		if (!this.locked) {
			this.locked = true;
			this._scrollTop = window.pageYOffset; // remember the current position from the top
			this.$lockElements.css({ position: 'fixed', width: '100%', top: -this._scrollTop + 'px' });
		}
	},

	unlock() {
		if (this.locked) {
			this.locked = false;
			this.$lockElements.css({ position: '', width: '', top: '' });
			window.scroll(0, this._scrollTop);
		}
	},
};

module.exports = new BodyLocker();
/* eslint-enable */
