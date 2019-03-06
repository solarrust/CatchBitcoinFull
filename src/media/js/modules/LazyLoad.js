const Callback = require('../classes/Callback');

const IS_RETINA = window.devicePixelRatio > 1;
const LOADING = '_loading';
const env = require('../utils/ENV');

function LazyLoad() {
	this.onLoad = new Callback();
}

LazyLoad.prototype = {
	start() {
		this.update();
	},

	update() {
		let $elements = $('[data-src]');
		let totalElements = $elements.length;
		for (let k = 0; k < totalElements; k++) {
			this._manageElement($elements.eq(k));
		}
	},

	_manageElement($element) {
		let src = $element.attr('data-src');
		if (!src || src == '') {
			return;
		}

		let srcValues = src.split('|');
		let nonRetinaSrc = srcValues[0];
		let retinaSrc = srcValues[1] || nonRetinaSrc;

		let useSrc = IS_RETINA ? retinaSrc : nonRetinaSrc;

		let tagName = $element[0].tagName.toLowerCase();
		if (tagName == 'img') {
			this._loadImage($element, useSrc);
		} else if (tagName == 'video') {
			let videoSrc = env.isDesktop ? srcValues[0] : srcValues[1];
			videoSrc = videoSrc || srcValues[0];
			let $parent = $element.parent();
			$element.append('<source src="' + videoSrc + '">').attr('src', videoSrc);
			/*$element
				.attr('src', useSrc)
				.remove()
				.appendTo($parent);*/

			$element.remove().appendTo($parent);

			try {
				$element[0].play();
			} catch (e) {
				//
			}
		} else {
			this._loadBackground($element, useSrc);
		}

		$element.removeAttr('data-src');
	},

	_loadImage($element, src) {
		$element.addClass(LOADING);
		$element.on('load', () => {
			TweenMax.fromTo($element.removeClass(LOADING), 0.5, { alpha: 0 }, { alpha: 1, delay: Math.random() / 4 });
			this.onLoad.call();
		});

		$element.attr('src', src);
	},

	_loadBackground($element, src) {
		$element.addClass(LOADING);

		let image = new Image();
		image.onload = function() {
			$element.css({
				backgroundImage: 'url(' + src + ')',
			});
			TweenMax.fromTo($element.removeClass(LOADING), 0.5, { alpha: 0 }, { alpha: 1, delay: Math.random() / 2 });
		};

		image.src = src;
	},
};

module.exports = new LazyLoad();
