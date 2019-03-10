let $numInput = $('[data-num]');
let $error = $('.convert-form__error');
let $btcInput = $('[data-btc]');
let $resultInput = $('[data-convert-result]');
let $result;

// Change or replace by Ajax
let currentCourse = 3873;

for (let i = 0; i < $numInput.length; i++) {
	$numInput.eq(i).on('keypress', function(e) {
		var theEvent = e || window.event;
		var key = theEvent.keyCode || theEvent.which;
		key = String.fromCharCode(key);
		var regex = /^[0-9]+$/;
		if (!regex.test(key)) {
			theEvent.returnValue = false;
			TweenMax.to($(e.currentTarget).siblings($error), 0.15, { alpha: 1 });

			if (theEvent.preventDefault) {
				theEvent.preventDefault();
			}
		} else {
			TweenMax.to($(e.currentTarget).siblings($error), 0.15, { alpha: 0 });
		}
	});

	$numInput.eq(i).on('blur', function(e) {
		TweenMax.to($(e.currentTarget).siblings($error), 0.15, { alpha: 0 });
	});
}

$btcInput.on('input', function() {
	let $value = $(this).val();
	$result = $value * currentCourse;
	$resultInput.val($result);
});

$resultInput.on('input', function() {
	let $value = $(this).val();
	$result = $value / currentCourse;
	$btcInput.val($result);
});
