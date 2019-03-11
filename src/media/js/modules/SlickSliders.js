const dom = require('../utils/DOM');
const env = require('../utils/ENV');

const ACTIVE = '_active';

const OPTIONS_BY_TYPE = {
	autoplay: {
		autoplay: true,
		autoplaySpeed: 10000,
		fade: true,
		draggable: false,
	},
	header: {
		autoplay: true,
		autoplaySpeed: 3500,
		fade: true,
		infinite: true,
		draggable: false,
		slidesToScroll: 1,
		slidesToShow: 1,
		dots: true,
		arrows: true,
		zIndex: 0,
		responsive: [
			{
				breakpoint: 1025,
				settings: {
					arrows: false,
				},
			},
		],
	},
	solutionsSlider: {
		fade: true,
		infinite: false,
		draggable: true,
		slidesToScroll: 1,
		slidesToShow: 1,
		arrows: true,
		zIndex: 0,
		responsive: [
			{
				breakpoint: 1025,
				settings: {
					dots: true,
					arrows: false,
				},
			},
		],
	},
	opinions: {
		autoplay: true,
		autoplaySpeed: 10000,
		fade: true,
		infinite: false,
		draggable: true,
		slidesToScroll: 1,
		slidesToShow: 1,
		dots: true,
		zIndex: 0,
		responsive: [
			{
				breakpoint: 1025,
				settings: {
					dots: true,
					arrows: false,
				},
			},
		],
	},
};

const CUSTOM_SETTINGS_BY_TYPE = {
	exhibition: {
		moveSliderOnArrowHover: true,
	},
};

function SlickSliders() {
	var self = this;
	self.rebuild();
	dom.$window.on('resize orientationchange', function() {
		setTimeout(function() {
			self.update();
		}, 300);
	});
}

SlickSliders.prototype = {
	rebuild: function() {
		var $sliders = $('[data-slider]');
		var totalSliders = $sliders.length;
		for (var k = 0; k < totalSliders; k++) {
			this._initSlider($sliders.eq(k));
		}
	},
	_initSlider: function($container) {
		var type = $container.attr('data-slider');
		var $slides = $container.find('[data-slider-slides]');
		var totalSlides = $slides.children().length;
		var $total = $container.find('[data-slider-total]');
		var $prev = $container.find('[data-slider-prev]');
		var $next = $container.find('[data-slider-next]');
		var $whenActives = $container.find('[data-slider-when-active]');
		var $dotsContainer = $container.find('[data-slider-dots]');
		var $controlsContainer = $container.find('[data-slider-controls]');
		var currentSlideId = 0;

		var $subSlides = $container.find('[data-slider-sub-slides]').children();
		var $previews = $container.find('[data-slider-previews]').children();

		if ($total) {
			$total.text(totalSlides + 1);
		}

		if (totalSlides > 0) {
			$container.find('[data-slider-total]').text(totalSlides);

			var options = {
				nextArrow: $next,
				prevArrow: $prev,
			};
			var typeOptions = OPTIONS_BY_TYPE[type];
			if (typeof typeOptions != 'undefined') {
				for (var i in typeOptions) {
					options[i] = typeOptions[i];

					if (i == 'asNavFor') {
						if (typeOptions[i] == 'data-nav-for-popup') {
							this.nav = $container.attr('data-nav-for-popup');
							options[i] = $('[data-nav-for-page="' + this.nav + '"]').find('[data-slider-slides]');
						} else {
							this.nav = $container.attr('data-nav-for-page');
							options[i] = $('[data-nav-for-popup="' + this.nav + '"]').find('[data-slider-slides]');
						}
					}
				}
			}

			var customSettings = CUSTOM_SETTINGS_BY_TYPE[type] || {};

			$slides.slick(options);

			if ($dotsContainer.length) {
				var $dotModel = $dotsContainer
					.children()
					.first()
					.removeClass(ACTIVE);
				$dotsContainer.empty();

				for (var k = 0; k < totalSlides; k++) {
					if (k < 9) {
						$dotsContainer.append($dotModel.clone().text(`0${k + 1}`));
					} else {
						$dotsContainer.append($dotModel.clone().text(k + 1));
					}
				}

				var $dots = $dotsContainer.children();
				$dots.click(e => {
					e.preventDefault();
					$slides.slick('slickGoTo', $(e.currentTarget).index());
				});

				dom.$document.keydown(e => {
					const code = e.keyCode;
					if (code === 39) {
						$slides.slick('slickGoTo', currentSlideId + 1);
					} else if (code === 37) {
						$slides.slick('slickGoTo', currentSlideId - 1);
					}
				});

				$slides.on('beforeChange', function(e, slick, currentSlide, nextSlide) {
					currentSlideId = nextSlide;
					$dots.removeClass('_active');
					for (let k = 0; k < $dotsContainer.length; k++) {
						let $currentDotsContainer = $dotsContainer.eq(k);
						let $currentDot = $currentDotsContainer
							.children()
							.eq(nextSlide)
							.addClass(ACTIVE);

						let $scrollTarget = $currentDotsContainer.parent();
						let scrollLeft = $scrollTarget.scrollLeft();

						let dotWidth = $currentDot.outerWidth(true);
						let x = $currentDot.position().left;
						let containerWidth = $currentDotsContainer.width();

						if (x > containerWidth - dotWidth * 2) {
							TweenMax.to($scrollTarget, 0.35, {
								scrollTo: { x: dotWidth + scrollLeft + (x - (containerWidth - dotWidth)) },
							});
						} else if (x < dotWidth) {
							TweenMax.to($scrollTarget, 0.35, { scrollTo: { x: scrollLeft - Math.abs(x) - dotWidth } });
						}
					}
				});

				for (let k = 0; $dotsContainer.length > k; k++) {
					$dotsContainer
						.eq(k)
						.children()
						.first()
						.addClass(ACTIVE);
				}
			}

			if ($controlsContainer.length) {
				$controlsContainer
					.children()
					.first()
					.removeClass(ACTIVE);

				let $originalControls = $controlsContainer.children();

				if (typeof $controlsContainer.attr('data-title-hide') !== 'undefined') {
					$controlsContainer.closest('.slider-titles').css({
						left:
							-(
								$controlsContainer
									.children()
									.first()
									.width() + 150
							) + 'px',
					});

					for (let i = 0; i < $originalControls.length; i++) {
						$controlsContainer.append($originalControls.eq(i).clone());
					}
				}

				var $controls = $controlsContainer.children();

				$controls.click(e => {
					e.preventDefault();

					let slideIndex = $(e.currentTarget).index();

					if ($(e.currentTarget).index() > $originalControls.length - 1) {
						slideIndex -= $originalControls.length;
					}

					$slides.slick('slickGoTo', slideIndex);
				});

				dom.$document.keydown(e => {
					const code = e.keyCode;
					if (code === 39) {
						$slides.slick('slickGoTo', currentSlideId + 1);
					} else if (code === 37) {
						$slides.slick('slickGoTo', currentSlideId - 1);
					}
				});

				$slides.on('beforeChange', function(e, slick, currentSlide, nextSlide) {
					currentSlideId = nextSlide;
					$controls.removeClass('_active');
					for (let k = 0; k < $controlsContainer.length; k++) {
						let $currentControlContainer = $controlsContainer.eq(k);
						let $controlWidth = $currentControlContainer
							.children()
							.eq(nextSlide)
							.width();
						let $controlLeftPosition = $controlsContainer
							.children()
							.eq(nextSlide)
							.position().left;

						$currentControlContainer
							.children()
							.eq(nextSlide)
							.addClass(ACTIVE);

						if (typeof $controlsContainer.attr('data-title-hide') !== 'undefined') {
							$controlsContainer
								.closest('.slider-titles')
								.css({ left: -($controlLeftPosition + $controlWidth + 150) + 'px' });
						}
					}
				});

				for (let k = 0; $controlsContainer.length > k; k++) {
					$controlsContainer
						.eq(k)
						.children()
						.first()
						.addClass(ACTIVE);
				}
			}

			var $current = $container.find('[data-slider-current]');
			if ($current.length) {
				$slides.on('beforeChange', function(e, slick, currentSlide, nextSlide) {
					$current.text(`0${nextSlide + 1}`);
					TweenMax.fromTo($current, 0.35, { alpha: 0 }, { alpha: 1 });
				});

				$current.text(`01`);
			}

			if ($subSlides.length) {
				var index = 0;
				$slides.on('beforeChange', function(e, slick, currentSlide, nextSlide) {
					if (index != nextSlide) {
						index = nextSlide;
						$subSlides
							.stop()
							.hide()
							.eq(nextSlide)
							.fadeIn();
					}
				});

				$subSlides
					.hide()
					.first()
					.show();
			}

			if ($previews.length) {
				$previews.click(e => {
					e.preventDefault();
					$slides.slick('slickGoTo', $(e.currentTarget).index());
				});

				$slides.on('beforeChange', function(e, slick, currentSlide, nextSlide) {
					$previews
						.removeClass(ACTIVE)
						.eq(nextSlide)
						.addClass(ACTIVE);
				});
			}

			TweenMax.to($whenActives, 0.35, { alpha: 1 });

			if (customSettings.moveSliderOnArrowHover) {
				this.movePower = 50;

				// function moveSlider(direction) {
				// 	TweenMax.to($slides, 0.35, {x: direction * movePower});
				// }

				$slides.on('beforeChange', function(e, slick, currentSlide, nextSlide) {
					this.moveSlider(0);
				});

				$prev
					.mouseenter(function(e) {
						this.moveSlider(1);
					})
					.mouseleave(function(e) {
						this.moveSlider(0);
					});
				$next
					.mouseenter(function(e) {
						this.moveSlider(-1);
					})
					.mouseleave(function(e) {
						this.moveSlider(0);
					});
			}
		} else {
			$whenActives.remove();
		}
	},
	update: function() {
		$('[data-slider-slides]').slick('setPosition');
	},
	scrollTo: function(slider, position) {
		$(slider).slick('setPosition');
		$(slider).slick('slickGoTo', parseInt(position));
	},
	add: function(slider, template) {
		$(slider).slick('slickAdd', template);
	},
	remove: function(slider) {
		var length = slider.find('.slick-slide').length + 3;
		for (var k = 0; k < length; k++) {
			var i = slider.find('.slick-slide').attr('data-slick-index');
			slider.slick('slickRemove', i);
			var j = 0;
			slider.find('.slick-slide').each(function() {
				$(this).attr('data-slick-index', j);
				j++;
			});
		}
	},
};

module.exports = new SlickSliders();
