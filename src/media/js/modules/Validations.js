const env = require('../utils/ENV');
// const Connector = require('../helpers/Connector');
const ScrollHelper = require('../helpers/ScrollHelper');
const Inputmask = require('inputmask');
const intlTelInput = require('intl-tel-input');
const utils = require('intl-tel-input/build/js/utils.js');
import { intlTelInputUtils } from 'intl-tel-input/build/js/utils.js';

function Validations() {
	if (!env.isMobile) {
		let countryCode;
		let countryData = window.intlTelInputGlobals.getCountryData();
		let $phone = document.querySelector('#phone');
		for (let i = 0; i < countryData.length; i++) {
			let country = countryData[i];
			country.name = country.name.replace(/.+\((.+)\)/, '$1');
		}

		// eslint-disable-next-line
		let iti = intlTelInput($phone, {
			utilsScript: utils,
			initialCountry: 'auto',
			geoIpLookup: function(success, failure) {
				$.get('https://ipinfo.io', function() {}, 'jsonp').always(function(resp) {
					var countryCode = resp && resp.country ? resp.country : '';
					success(countryCode);
				});
			},
			preferredCountries: ['us', 'ru', 'th'],
			autoPlaceholder: 'aggressive',
			customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
				return selectedCountryPlaceholder;
			},
			separateDialCode: true,
		});

		$($phone).on('keypress click', () => {
			let mask = $($phone).attr('placeholder');

			if (mask !== 'undefined') {
				mask = mask.replace(/[0-9]/g, '9');
			}

			let telMask = new Inputmask({ mask: mask });
			telMask.mask($phone);

			countryCode = $('.selected-dial-code').text();

			$('.country-code-field').val(countryCode);
		});
	}

	this.$allInput = $('input[data-input]');

	// this.$parent = '[data-form-group]';
	this.$allInput.on('focusout change', e => {
		const $this = $(e.currentTarget);
		const $form = $this.closest('[data-form-validation]');
		const $check = $('input[type="checkbox"]');
		var checked = $check.is(':checked');

		const willSubmit = this.test($form, checked);
		if (willSubmit) {
			$form.find('[data-form-submit]').attr('disabled', false);
		} else {
			$form.find('[data-form-submit]').attr('disabled', true);
		}
	});

	this.$allInput.on('focus', e => {
		const $this = $(e.currentTarget);
		$this.parent('[data-form-group]').removeClass('_error');
		$this.parent('[data-form-group]').removeClass('_valid');
	});

	$('form[data-form-validation]').on('submit', e => {
		e.preventDefault();
		const $form = $(e.currentTarget);
		const $check = $('input[type="checkbox"]');
		var checked = $check.is(':checked');
		const willSubmit = this.test($form, checked);

		if (willSubmit) {
			//const $data = $form.serialize();
			this.send($form /*, $data*/);
		} else {
			ScrollHelper.scrollTo($form);
		}
	});
}

Validations.prototype = {
	isName: function(string) {
		// eslint-disable-next-line
		const re = /^[а-яё]|[a-z]$/;
		return re.test(string);
	},
	isEmail: function(string) {
		// eslint-disable-next-line
		const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(string);
	},
	isPhone: function(string) {
		// eslint-disable-next-line
		const re = /[0-9]/;
		return re.test(string);
	},
	isRobot: function(string) {
		if (string) {
			return true;
		}

		return false;
	},
	testInput: function($input, lightMode) {
		$input.parent('[data-form-group]').removeClass('_error');
		$input.parent('[data-form-group]').removeClass('_valid');

		const value = $.trim($input.val());

		const isRequired = typeof $input.attr('data-required') != 'undefined';
		if (!isRequired) {
			if (value.length == 0) {
				// !lightMode && $input.closest('[data-form-group]').addClass('_error');
				return true;
			}
		}

		var isName = typeof $input.attr('data-name') != 'undefined';
		if (isName) {
			if (!this.isName(value)) {
				!lightMode && $input.parent('[data-form-group]').addClass('_error');
				return false;
			} else {
				!lightMode && $input.parent('[data-form-group]').addClass('_valid');
				return true;
			}
		}

		var isEmail = typeof $input.attr('data-email') != 'undefined';
		if (isEmail) {
			if (!this.isEmail(value)) {
				!lightMode && $input.parent('[data-form-group]').addClass('_error');
				return false;
			} else {
				!lightMode && $input.parent('[data-form-group]').addClass('_valid');
				return true;
			}
		}

		var isPhone = typeof $input.attr('data-phone') != 'undefined';
		if (isPhone) {
			var testPhone = this.isPhone(value);
			if (!this.isPhone(value) || !testPhone) {
				!lightMode && $input.parent('[data-form-group]').addClass('_error');
				return false;
			} else {
				!lightMode && $input.parent('[data-form-group]').addClass('_valid');
				return true;
			}
		}
	},

	test: function($form, checked, lightMode) {
		const $inputs = $form.find('input,textarea'); // .outline( false );

		let willSubmit = true;
		const totalInputs = $inputs.length;
		if (checked === true) {
			for (let k = 0; k < totalInputs; k++) {
				const inputCheck = this.testInput($inputs.eq(k), lightMode);
				if (inputCheck === false) {
					willSubmit = false;
				}
			}
		} else {
			willSubmit = false;
		}

		return willSubmit;
	},
	error($form) {
		ScrollHelper.scrollTo($form);
	},
	send($form /*, $data*/) {
		let action = $form.attr('action');
		if (!action || action == '') {
			console.error('No form action attribute!');
			return;
		}

		$form.addClass('_loading');

		let formData = new FormData($form[0]);

		$form.trigger('beforeSend', [formData]);

		let $formMain = $form.find('[data-form-main]');
		let $formComplete = $form.find('[data-form-complete]');
		let $formError = $form.find('[data-form-error]');
		let $formReset = $form.find('[data-form-reset]');

		let request = new XMLHttpRequest();
		request.open('POST', action, true);
		request.onload = function() {
			// TweenMax.to($formMain.nope(), 0.15, { alpha: 0.5 });

			if (request.status == 200) {
				$formComplete.slideDown();
			} else {
				$formError.slideDown();
			}

			$formReset.slideDown();

			$form.removeClass('_loading');
			$formMain.slideUp();
		};

		request.send(formData);

		$formReset.on('click', e => {
			e.preventDefault();
			$formReset.slideUp();
			// TweenMax.to($formMain.nope(false), 0.15, { alpha: 1 });
			$formMain.slideDown('fast').nope(false);
			TweenMax.set($formMain, { alpha: 1 });

			$formComplete.slideUp('fast');

			$form.find('input:not([type="submit"]), textarea').val('');
		});

		TweenMax.to($formMain.nope(), 0.15, { alpha: 0 });
	},
};

module.exports = new Validations();
