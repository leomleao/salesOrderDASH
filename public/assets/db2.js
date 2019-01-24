/**
 * @class mApp  Metronic App class
 */

var mApp = (function() {
	/**
	 * Initializes bootstrap tooltip
	 */
	var initTooltip = function(el) {
		var skin = el.data('skin') ? 'm-tooltip--skin-' + el.data('skin') : '';
		var width = el.data('width') == 'auto' ? 'm-tooltop--auto-width' : '';
		var triggerValue = el.data('trigger') ? el.data('trigger') : 'hover';

		el.tooltip({
			trigger: triggerValue,
			template:
				'<div class="m-tooltip ' +
				skin +
				' ' +
				width +
				' tooltip" role="tooltip">\
                <div class="arrow"></div>\
                <div class="tooltip-inner"></div>\
            </div>',
		});
	};

	/**
	 * Initializes bootstrap tooltips
	 */
	var initTooltips = function() {
		// init bootstrap tooltips
		$('[data-toggle="m-tooltip"]').each(function() {
			initTooltip($(this));
		});
	};

	/**
	 * Initializes metronic portlet
	 */
	var initPortlet = function(el, options) {
		// init portlet tools
		el.mPortlet(options);
	};

	/**
	 * Initializes metronic portlets
	 */
	var initPortlets = function() {
		// init portlet tools
		$('[data-portlet="true"]').each(function() {
			var el = $(this);

			if (el.data('portlet-initialized') !== true) {
				initPortlet(el, {});
				el.data('portlet-initialized', true);
			}
		});
	};

	/**
	 * Initializes scrollable contents
	 */
	var initScrollables = function() {
		$('[data-scrollable="true"]').each(function() {
			var maxHeight;
			var height;
			var el = $(this);

			if (mUtil.isInResponsiveRange('tablet-and-mobile')) {
				if (el.data('mobile-max-height')) {
					maxHeight = el.data('mobile-max-height');
				} else {
					maxHeight = el.data('max-height');
				}

				if (el.data('mobile-height')) {
					height = el.data('mobile-height');
				} else {
					height = el.data('height');
				}
			} else {
				maxHeight = el.data('max-height');
				height = el.data('max-height');
			}

			if (maxHeight) {
				el.css('max-height', maxHeight);
			}
			if (height) {
				el.css('height', height);
			}

			mApp.initScroller(el, {});
		});
	};

	/**
	 * Update Map Data
	 */
	var getDB2Data = function() {
		console.info('getting data');
		$.getJSON('customers/db2data', function(data) {
			if (data.length === 0) return;
			console.info('got data');

			mApp.db2Data = data;
			initDB2Chart();
		});
	};

	/**
	 * Initializes websockets services
	 */
	var initDB2Chart = function() {
		// Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		var chart = am4core.create('db2Chart', am4charts.XYChart);

		var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
		valueAxisX.renderer.ticks.template.disabled = true;
		valueAxisX.renderer.axisFills.template.disabled = true;

		var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxisY.renderer.ticks.template.disabled = true;
		valueAxisY.renderer.axisFills.template.disabled = true;

		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.valueX = 'sales';
		series.dataFields.valueY = 'db2';
		series.dataFields.value = 'sales';
		series.strokeOpacity = 0;
		series.sequencedInterpolation = true;
		series.tooltip.pointerOrientation = 'vertical';

		var bullet = series.bullets.push(new am4charts.CircleBullet());
		bullet.fill = am4core.color('#8BB63B');
		// bullet.propertyFields.fill = 'color';
		bullet.strokeOpacity = 0;
		bullet.strokeWidth = 2;
		bullet.fillOpacity = 0.5;
		bullet.stroke = am4core.color('#ffffff');
		bullet.hiddenState.properties.opacity = 0;
		bullet.circle.tooltipText =
			'[bold]{name}:[/]\nVendedor: {area}\nVendas: {valueX.value}\nMargin DB2: {valueY.value}';

		var outline = chart.plotContainer.createChild(am4core.Circle);
		outline.fillOpacity = 0;
		outline.strokeOpacity = 0.8;
		outline.stroke = am4core.color('#ff0000');
		outline.strokeWidth = 2;
		outline.hide(0);

		var blurFilter = new am4core.BlurFilter();
		outline.filters.push(blurFilter);

		bullet.events.on('over', function(event) {
			var target = event.target;
			chart.cursor.triggerMove({ x: target.pixelX, y: target.pixelY }, 'hard');
			chart.cursor.lineX.y = target.pixelY;
			chart.cursor.lineY.x = target.pixelX - chart.plotContainer.pixelWidth;
			valueAxisX.tooltip.disabled = false;
			valueAxisY.tooltip.disabled = false;

			outline.radius = target.circle.pixelRadius + 2;
			outline.x = target.pixelX;
			outline.y = target.pixelY;
			outline.show();
		});

		bullet.events.on('out', function(event) {
			chart.cursor.triggerMove(event.pointer.point, 'none');
			chart.cursor.lineX.y = 0;
			chart.cursor.lineY.x = 0;
			valueAxisX.tooltip.disabled = true;
			valueAxisY.tooltip.disabled = true;
			outline.hide();
		});

		var hoverState = bullet.states.create('hover');
		hoverState.properties.fillOpacity = 1;
		hoverState.properties.strokeOpacity = 1;

		series.heatRules.push({
			target: bullet.circle,
			min: 2,
			max: 60,
			property: 'radius',
		});

		bullet.circle.adapter.add('tooltipY', function(tooltipY, target) {
			return -target.radius;
		});

		chart.cursor = new am4charts.XYCursor();
		chart.cursor.behavior = 'zoomXY';

		let cursorPosition = {
			x: null,
			y: null,
		};
		chart.cursor.events.on('cursorpositionchanged', function(ev) {
			let xAxis = ev.target.chart.xAxes.getIndex(0);
			let yAxis = ev.target.chart.yAxes.getIndex(0);
			cursorPosition.x = xAxis.positionToValue(
				xAxis.toAxisPosition(ev.target.xPosition),
			);
			cursorPosition.y = yAxis.positionToValue(
				yAxis.toAxisPosition(ev.target.yPosition),
			);
		});

		chart.events.on('doublehit', function(ev) {
				// now let's do whatever we want to do on double-click
				console.info(cursorPosition);
				valueAxisX.axisRanges.clear();
				valueAxisY.axisRanges.clear();

				let range = valueAxisX.axisRanges.create();
				range.value = cursorPosition.x;
				range.grid.stroke = am4core.color('#396478');
				range.grid.strokeWidth = 2;
				range.grid.strokeOpacity = 1;
				range.label.inside = true;
				range.label.text = 'Sales target';
				range.label.fill = range.grid.stroke;
				//range.label.align = "right";
				range.label.verticalCenter = 'bottom';

				let range2 = valueAxisY.axisRanges.create();
				range2.value = cursorPosition.y;
				range2.grid.stroke = am4core.color('#A96478');
				range2.grid.strokeWidth = 2;
				range2.grid.strokeOpacity = 1;
				range2.label.inside = true;
				range2.label.text = 'Margin target';
				range2.label.fill = range2.grid.stroke;
				//range2.label.align = "right";
				range2.label.verticalCenter = 'bottom';
		});

		chart.scrollbarX = new am4core.Scrollbar();
		chart.scrollbarY = new am4core.Scrollbar();
		console.info(mApp.db2Data);
		chart.data = mApp.db2Data;
	};

	var hideTouchWarning = function() {
		jQuery.event.special.touchstart = {
			setup: function(_, ns, handle) {
				if (typeof this === 'function')
					if (ns.includes('noPreventDefault')) {
						this.addEventListener('touchstart', handle, { passive: false });
					} else {
						this.addEventListener('touchstart', handle, { passive: true });
					}
			},
		};
		jQuery.event.special.touchmove = {
			setup: function(_, ns, handle) {
				if (typeof this === 'function')
					if (ns.includes('noPreventDefault')) {
						this.addEventListener('touchmove', handle, { passive: false });
					} else {
						this.addEventListener('touchmove', handle, { passive: true });
					}
			},
		};
		jQuery.event.special.wheel = {
			setup: function(_, ns, handle) {
				if (typeof this === 'function')
					if (ns.includes('noPreventDefault')) {
						this.addEventListener('wheel', handle, { passive: false });
					} else {
						this.addEventListener('wheel', handle, { passive: true });
					}
			},
		};
	};

	return {
		/**
		 * Main class initializer
		 */
		init: function() {
			mApp.initComponents();
		},

		/**
		 * Initializes components
		 */
		initComponents: function() {
			getDB2Data();
			hideTouchWarning();
			initScrollables();
			initPortlets();
			// initDB2Chart();
		},

		// /**
		//  * Init Sales History Chart
		//  */
		// initDB2Chart: function() {
		// 	initDB2Chart();
		// },

		/**
		 * Init Sales History Chart
		 */
		getDB2Data: function() {
			getDB2Data();
		},

		/**
		 *
		 * @param {object} el jQuery element object
		 */
		// wrJangoer function to scroll(focus) to an element
		initTooltips: function() {
			initTooltips();
		},

		/**
		 *
		 * @param {object} el jQuery element object
		 */
		// wrJangoer function to scroll(focus) to an element
		initTooltip: function(el) {
			initTooltip(el);
		},

		/**
		 *
		 * @param {object} el jQuery element object
		 */
		// wrJangoer function to scroll(focus) to an element
		initPopover: function(el) {
			initPopover(el);
		},

		/**
		 *
		 * @param {object} el jQuery element object
		 */
		// function to init portlet
		initPortlet: function(el, options) {
			initPortlet(el, options);
		},

		/**
		 *
		 * @param {object} el jQuery element object
		 */
		// function to init portlets
		initPortlets: function() {
			initPortlets();
		},

		/**
		 * Scrolls to an element with animation
		 * @param {object} el jQuery element object
		 * @param {number} offset Offset to element scroll position
		 */
		scrollTo: function(target, offset) {
			el = $(target);

			var pos = el && el.length > 0 ? el.offset().top : 0;
			pos = pos + (offset ? offset : 0);

			jQuery('html,body').animate(
				{
					scrollTop: pos,
				},
				'slow',
			);
		},

		/**
		 * Scrolls until element is centered in the viewport
		 * @param {object} el jQuery element object
		 */
		// wrJangoer function to scroll(focus) to an element
		scrollToViewport: function(el) {
			var elOffset = $(el).offset().top;
			var elHeight = el.height();
			var windowHeight = mUtil.getViewPort().height;
			var offset = elOffset - (windowHeight / 2 - elHeight / 2);

			jQuery('html,body').animate(
				{
					scrollTop: offset,
				},
				'slow',
			);
		},

		/**
		 * Scrolls to the top of the page
		 */
		// function to scroll to the top
		scrollTop: function() {
			mApp.scrollTo();
		},

		/**
		 * Initializes scrollable content using mCustomScrollbar plugin
		 * @param {object} el jQuery element object
		 * @param {object} options mCustomScrollbar plugin options(refer: http://manos.malihu.gr/jquery-custom-content-scroller/)
		 */
		initScroller: function(el, options, doNotDestroy) {
			if (mUtil.isMobileDevice()) {
				el.css('overflow', 'auto');
			} else {
				if (doNotDestroy !== true) {
					mApp.destroyScroller(el);
				}
				el.mCustomScrollbar({
					scrollInertia: 0,
					autoDraggerLength: true,
					autoHideScrollbar: true,
					autoExpandScrollbar: false,
					alwaysShowScrollbar: 0,
					axis: el.data('axis') ? el.data('axis') : 'y',
					mouseWheel: {
						scrollAmount: 120,
						preventDefault: true,
					},
					setHeight: options.height ? options.height : '',
					theme: 'minimal-dark',
				});
			}
		},

		/**
		 * Destroys scrollable content's mCustomScrollbar plugin instance
		 * @param {object} el jQuery element object
		 */
		destroyScroller: function(el) {
			el.mCustomScrollbar('destroy');
			el.removeClass('mCS_destroyed');
		},

		/**
		 * Shows bootstrap alert
		 * @param {object} options
		 * @returns {string} ID attribute of the created alert
		 */
		alert: function(options) {
			options = $.extend(
				true,
				{
					container: '', // alerts parent container(by default placed after the page breadcrumbs)
					place: 'append', // "append" or "prepend" in container
					type: 'success', // alert's type
					message: '', // alert's message
					close: true, // make alert closable
					reset: true, // close all previouse alerts first
					focus: true, // auto scroll to the alert after shown
					closeInSeconds: 0, // auto close after defined seconds
					icon: '', // put icon before the message
				},
				options,
			);

			var id = mUtil.getUniqueID('App_alert');

			var html =
				'<div id="' +
				id +
				'" class="custom-alerts alert alert-' +
				options.type +
				' fade in">' +
				(options.close
					? '<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>'
					: '') +
				(options.icon !== ''
					? '<i class="fa-lg fa fa-' + options.icon + '"></i>  '
					: '') +
				options.message +
				'</div>';

			if (options.reset) {
				$('.custom-alerts').remove();
			}

			if (!options.container) {
				if ($('.page-fixed-main-content').size() === 1) {
					$('.page-fixed-main-content').prepend(html);
				} else if (
					($('body').hasClass('page-container-bg-solid') ||
						$('body').hasClass('page-content-white')) &&
					$('.page-head').size() === 0
				) {
					$('.page-title').after(html);
				} else {
					if ($('.page-bar').size() > 0) {
						$('.page-bar').after(html);
					} else {
						$('.page-breadcrumb, .breadcrumbs').after(html);
					}
				}
			} else {
				if (options.place == 'append') {
					$(options.container).append(html);
				} else {
					$(options.container).prepend(html);
				}
			}

			if (options.focus) {
				mApp.scrollTo($('#' + id));
			}

			if (options.closeInSeconds > 0) {
				setTimeout(function() {
					$('#' + id).remove();
				}, options.closeInSeconds * 1000);
			}

			return id;
		},

		/**
		 * Blocks element with loading indiciator using http://malsup.com/jquery/block/
		 * @param {object} target jQuery element object
		 * @param {object} options
		 */
		block: function(target, options) {
			var el = $(target);

			options = $.extend(
				true,
				{
					opacity: 0.03,
					overlayColor: '#000000',
					state: 'brand',
					type: 'loader',
					size: 'lg',
					centerX: true,
					centerY: true,
					message: '',
					shadow: true,
					width: 'auto',
				},
				options,
			);

			var skin;
			var state;
			var loading;

			if (options.type == 'spinner') {
				skin = options.skin ? 'm-spinner--skin-' + options.skin : '';
				state = options.state ? 'm-spinner--' + options.state : '';
				loading = '<div class="m-spinner ' + skin + ' ' + state + '"></div';
			} else {
				skin = options.skin ? 'm-loader--skin-' + options.skin : '';
				state = options.state ? 'm-loader--' + options.state : '';
				size = options.size ? 'm-loader--' + options.size : '';
				loading =
					'<div class="m-loader ' + skin + ' ' + state + ' ' + size + '"></div';
			}

			if (options.message && options.message.length > 0) {
				var classes =
					'm-blockui ' +
					(options.shadow === false ? 'm-blockui-no-shadow' : '');

				html =
					'<div class="' +
					classes +
					'"><span>' +
					options.message +
					'</span><span>' +
					loading +
					'</span></div>';
				options.width = mUtil.realWidth(html) + 10;
				if (target == 'body') {
					html =
						'<div class="' +
						classes +
						'" style="margin-left:-' +
						options.width / 2 +
						'px;"><span>' +
						options.message +
						'</span><span>' +
						loading +
						'</span></div>';
				}
			} else {
				html = loading;
			}

			var params = {
				message: html,
				centerY: options.centerY,
				centerX: options.centerX,
				css: {
					top: '30%',
					left: '50%',
					border: '0',
					padding: '0',
					backgroundColor: 'none',
					width: options.width,
				},
				overlayCSS: {
					backgroundColor: options.overlayColor,
					opacity: options.opacity,
					cursor: 'wait',
					zIndex: '10',
				},
				onUnblock: function() {
					if (el) {
						el.css('position', '');
						el.css('zoom', '');
					}
				},
			};

			if (target == 'body') {
				params.css.top = '50%';
				$.blockUI(params);
			} else {
				var el = $(target);
				el.block(params);
			}
		},

		/**
		 * Un-blocks the blocked element
		 * @param {object} target jQuery element object
		 */
		unblock: function(target) {
			if (target && target != 'body') {
				$(target).unblock();
			} else {
				$.unblockUI();
			}
		},

		/**
		 * Blocks the page body element with loading indicator
		 * @param {object} options
		 */
		blockPage: function(options) {
			return mApp.block('body', options);
		},

		/**
		 * Un-blocks the blocked page body element
		 */
		unblockPage: function() {
			return mApp.unblock('body');
		},

		/**
		 * Enable loader progress for button and other elements
		 * @param {object} target jQuery element object
		 * @param {object} options
		 */
		progress: function(target, options) {
			var skin = options && options.skin ? options.skin : 'light';
			var alignment =
				options && options.alignment ? options.alignment : 'right';
			var size = options && options.size ? 'm-spinner--' + options.size : '';
			var classes =
				'm-loader ' +
				'm-loader--' +
				skin +
				' m-loader--' +
				alignment +
				' m-loader--' +
				size;

			mApp.unprogress(target);

			$(target).addClass(classes);
			$(target).data('progress-classes', classes);
		},

		/**
		 * Disable loader progress for button and other elements
		 * @param {object} target jQuery element object
		 */
		unprogress: function(target) {
			$(target).removeClass($(target).data('progress-classes'));
		},
	};
})();

//== Initialize mApp class on document ready
$(document).ready(function() {
	mApp.init();
});
/**
 * @class mUtil  Metronic base utilize class that privides helper functions
 */

var mUtil = (function() {
	var resizeHandlers = [];

	/** @type {object} breakpoints The device width breakpoints **/
	var breakpoints = {
		sm: 544, // Small screen / phone
		md: 768, // Medium screen / tablet
		lg: 992, // Large screen / desktop
		xl: 1200, // Extra large screen / wide desktop
	};

	/** @type {object} colors State colors **/
	var colors = {
		brand: '#716aca',
		metal: '#c4c5d6',
		light: '#ffffff',
		accent: '#00c5dc',
		primary: '#5867dd',
		success: '#34bfa3',
		info: '#36a3f7',
		warning: '#ffb822',
		danger: '#f4516c',
	};

	/**
	 * Handle window resize event with some
	 * delay to attach event handlers upon resize complete
	 */
	var _windowResizeHandler = function() {
		var _runResizeHandlers = function() {
			// reinitialize other subscribed elements
			for (var i = 0; i < resizeHandlers.length; i++) {
				var each = resizeHandlers[i];
				each.call();
			}
		};

		var timeout = false; // holder for timeout id
		var delay = 250; // delay after event is "complete" to run callback

		window.addEventListener('resize', function() {
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				_runResizeHandlers();
			}, delay); // wait 50ms until window resize finishes.
		});
	};

	return {
		/**
		 * Class main initializer.
		 * @param {object} options.
		 * @returns null
		 */
		//main function to initiate the theme
		init: function(options) {
			if (options && options.breakpoints) {
				breakpoints = options.breakpoints;
			}

			if (options && options.colors) {
				colors = options.colors;
			}

			_windowResizeHandler();
		},

		/**
		 * Adds window resize event handler.
		 * @param {function} callback function.
		 */
		addResizeHandler: function(callback) {
			resizeHandlers.push(callback);
		},

		/**
		 * Trigger window resize handlers.
		 */
		runResizeHandlers: function() {
			_runResizeHandlers();
		},

		/**
		 * Get GET parameter value from URL.
		 * @param {string} paramName Parameter name.
		 * @returns {string}
		 */
		getURLParam: function(paramName) {
			var searchString = window.location.search.substring(1),
				i,
				val,
				params = searchString.split('&');

			for (i = 0; i < params.length; i++) {
				val = params[i].split('=');
				if (val[0] == paramName) {
					return unescape(val[1]);
				}
			}

			return null;
		},

		/**
		 * Checks whether current device is mobile touch.
		 * @returns {boolean}
		 */
		isMobileDevice: function() {
			return this.getViewPort().width < this.getBreakpoint('lg') ? true : false;
		},

		/**
		 * Checks whether current device is desktop.
		 * @returns {boolean}
		 */
		isDesktopDevice: function() {
			return mUtil.isMobileDevice() ? false : true;
		},

		/**
		 * Gets browser window viewport size. Ref: http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
		 * @returns {object}
		 */
		getViewPort: function() {
			var e = window,
				a = 'inner';
			if (!('innerWidth' in window)) {
				a = 'client';
				e = document.documentElement || document.body;
			}

			return {
				width: e[a + 'Width'],
				height: e[a + 'Height'],
			};
		},

		/**
		 * Checks whether given device mode is currently activated.
		 * @param {string} mode Responsive mode name(e.g: desktop, desktop-and-tablet, tablet, tablet-and-mobile, mobile)
		 * @returns {boolean}
		 */
		isInResponsiveRange: function(mode) {
			var breakpoint = this.getViewPort().width;

			if (mode == 'general') {
				return true;
			} else if (
				mode == 'desktop' &&
				breakpoint >= this.getBreakpoint('lg') + 1
			) {
				return true;
			} else if (
				mode == 'tablet' &&
				(breakpoint >= this.getBreakpoint('md') + 1 &&
					breakpoint < this.getBreakpoint('lg'))
			) {
				return true;
			} else if (mode == 'mobile' && breakpoint <= this.getBreakpoint('md')) {
				return true;
			} else if (
				mode == 'desktop-and-tablet' &&
				breakpoint >= this.getBreakpoint('md') + 1
			) {
				return true;
			} else if (
				mode == 'tablet-and-mobile' &&
				breakpoint <= this.getBreakpoint('lg')
			) {
				return true;
			} else if (
				mode == 'minimal-desktop-and-below' &&
				breakpoint <= this.getBreakpoint('xl')
			) {
				return true;
			}

			return false;
		},

		/**
		 * Generates unique ID for give prefix.
		 * @param {string} prefix Prefix for generated ID
		 * @returns {boolean}
		 */
		getUniqueID: function(prefix) {
			return prefix + Math.floor(Math.random() * new Date().getTime());
		},

		/**
		 * Gets window width for give breakpoint mode.
		 * @param {string} mode Responsive mode name(e.g: xl, lg, md, sm)
		 * @returns {number}
		 */
		getBreakpoint: function(mode) {
			if ($.inArray(mode, breakpoints)) {
				return breakpoints[mode];
			}
		},

		/**
		 * Checks whether object has property matchs given key path.
		 * @param {object} obj Object contains values paired with given key path
		 * @param {string} keys Keys path seperated with dots
		 * @returns {object}
		 */
		isset: function(obj, keys) {
			var stone;

			keys = keys || '';

			if (keys.indexOf('[') !== -1) {
				throw new Error('Unsupported object path notation.');
			}

			keys = keys.split('.');

			do {
				if (obj === undefined) {
					return false;
				}

				stone = keys.shift();

				if (!obj.hasOwnProperty(stone)) {
					return false;
				}

				obj = obj[stone];
			} while (keys.length);

			return true;
		},

		/**
		 * Gets highest z-index of the given element parents
		 * @param {object} el jQuery element object
		 * @returns {number}
		 */
		getHighestZindex: function(el) {
			var elem = $(el),
				position,
				value;

			while (elem.length && elem[0] !== document) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css('position');

				if (
					position === 'absolute' ||
					position === 'relative' ||
					position === 'fixed'
				) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt(elem.css('zIndex'), 10);
					if (!isNaN(value) && value !== 0) {
						return value;
					}
				}
				elem = elem.parent();
			}
		},

		/**
		 * Checks whether the element has given classes
		 * @param {object} el jQuery element object
		 * @param {string} Classes string
		 * @returns {boolean}
		 */
		hasClasses: function(el, classes) {
			var classesArr = classes.split(' ');

			for (var i = 0; i < classesArr.length; i++) {
				if (el.hasClass(classesArr[i]) == false) {
					return false;
				}
			}

			return true;
		},

		/**
		 * Gets element actual/real width
		 * @param {object} el jQuery element object
		 * @returns {number}
		 */
		realWidth: function(el) {
			var clone = $(el).clone();
			clone.css('visibility', 'hidden');
			clone.css('overflow', 'hidden');
			clone.css('height', '0');
			$('body').append(clone);
			var width = clone.outerWidth();
			clone.remove();

			return width;
		},

		/**
		 * Checks whether the element has any parent with fixed position
		 * @param {object} el jQuery element object
		 * @returns {boolean}
		 */
		hasFixedPositionedParent: function(el) {
			var result = false;

			el.parents().each(function() {
				if ($(this).css('position') == 'fixed') {
					result = true;
					return;
				}
			});

			return result;
		},

		/**
		 * Simulates delay
		 */
		sleep: function(milliseconds) {
			var start = new Date().getTime();
			for (var i = 0; i < 1e7; i++) {
				if (new Date().getTime() - start > milliseconds) {
					break;
				}
			}
		},

		/**
		 * Gets randomly generated integer value within given min and max range
		 * @param {number} min Range start value
		 * @param {number} min Range end value
		 * @returns {number}
		 */
		getRandomInt: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},

		/**
		 * Gets state color's hex code by color name
		 * @param {string} name Color name
		 * @returns {string}
		 */
		getColor: function(name) {
			return colors[name];
		},

		/**
		 * Checks whether Angular library is included
		 * @returns {boolean}
		 */
		isAngularVersion: function() {
			return window.Zone !== undefined ? true : false;
		},
	};
})();

//== Initialize mUtil class on document ready
$(document).ready(function() {
	mUtil.init();
});

moment.locale('pt-br');
numeral.register('locale', 'pt-br', {
	delimiters: {
		thousands: ' ',
		decimal: '.',
	},
	abbreviations: {
		thousand: 'mil',
		million: 'mi',
		billion: 'bi',
		trillion: 'tri',
	},
	currency: {
		symbol: 'R$',
	},
});
numeral.locale('pt-br');
numeral.defaultFormat('($ 0.00.00 a)');

// jquery extension to add animation class into element
jQuery.fn.extend({
	animateClass: function(animationName, callback) {
		var animationEnd =
			'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		jQuery(this)
			.addClass('animated ' + animationName)
			.one(animationEnd, function() {
				jQuery(this).removeClass('animated ' + animationName);
			});

		if (callback) {
			jQuery(this).one(animationEnd, callback);
		}
	},
	animateDelay: function(value) {
		var vendors = ['webkit-', 'moz-', 'ms-', 'o-', ''];
		for (var i = 0; i < vendors.length; i++) {
			jQuery(this).css(vendors[i] + 'animation-delay', value);
		}
	},
	animateDuration: function(value) {
		var vendors = ['webkit-', 'moz-', 'ms-', 'o-', ''];
		for (var i = 0; i < vendors.length; i++) {
			jQuery(this).css(vendors[i] + 'animation-duration', value);
		}
	},
});
