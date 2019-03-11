let dom = require('../utils/DOM');
let env = require('../utils/ENV');

let $header = $('.header');

let windowHeight = dom.$window.height();

dom.$window.on('load resize', () => {
	if (env.isMobile) {
		$header.css({ height: windowHeight });
	}
});
