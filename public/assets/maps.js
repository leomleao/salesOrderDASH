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
	 * Initializes data populate
	 */
	var initPopulateData = function() {
		$.ajax({
			type: 'GET',
			url: 'dash/update',
			success: function(data) {
				for (var i = data.length - 1; i >= 0; i--) {
					if (data[i].field === 'lastFiveInvoices') {
						updateTabData(data[i].value, 'invoices');
					} else if (data[i].field === 'lastFivesSalesOrders') {
						updateTabData(data[i].value, 'salesOrders');
					} else {
						updateField(data[i].field, data[i].value);
					}
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				console.error(xhr.status);
				console.error(thrownError);
			},
		});
	};

	/**
	 * Initializes the country heat MAP
	 */
	var initHeatMap = function() {
		mapboxgl.accessToken =
			'pk.eyJ1IjoibGVvbWxlYW8iLCJhIjoiY2pyM2pyeWg1MTN3NjQ1cWxjNTVxdGRidCJ9.iNrfjj-G6EUjrv4adzWNRg';
		mApp.salesHeatMap = new mapboxgl.Map({
			container: 'salesHeatMap', // container id
			style: 'mapbox://styles/mapbox/light-v9',
			center: [-46.97, -23.19], // starting position
			zoom: 3, // starting zoom
		});

		// Add zoom and rotation controls to the map.
		mApp.salesHeatMap.addControl(new mapboxgl.NavigationControl());

		var maxValue = 3052785;
		var data = [
			{ NOME: 'Americana', sales: 37364.560000000005 },
			{ NOME: 'Amparo', sales: 6369.150000000001 },
			{ NOME: 'Américo Brasiliense', sales: 886.75 },
			{ NOME: 'Araraquara', sales: 4683.130000000001 },
			{ NOME: 'Araras', sales: 6158.91 },
			{ NOME: 'Araçatuba', sales: 1143.32 },
			{ NOME: 'Atibaia', sales: 819.71 },
			{ NOME: 'Barueri', sales: 3655.3700000000003 },
			{ NOME: 'Bauru', sales: 28472.04 },
			{ NOME: 'Birigui', sales: 102623.66 },
			{ NOME: 'Boituva', sales: 240213.21000000002 },
			{ NOME: 'Botucatu', sales: 3144.6099999999997 },
			{ NOME: 'Bragança Paulista', sales: 3864.67 },
			{ NOME: 'Cabreuva', sales: 1785.46 },
			{ NOME: 'Cabreúva', sales: 25042.989999999994 },
			{ NOME: 'Campinas', sales: 38760.740000000005 },
			{ NOME: 'Capivari', sales: 387.66 },
			{ NOME: 'Caraguatatuba', sales: 14690.6 },
			{ NOME: 'Cerquilho', sales: 2908.81 },
			{ NOME: 'Cordeirópolis', sales: 776.17 },
			{ NOME: 'Cosmópolis', sales: 244.81 },
			{ NOME: 'Cotia', sales: 54804.299999999996 },
			{ NOME: 'Cruzeiro', sales: 12558.78 },
			{ NOME: 'Descalvado', sales: 1839 },
			{ NOME: 'Diadema', sales: 39609.52999999999 },
			{ NOME: 'Elias Fausto', sales: 879.58 },
			{ NOME: 'Embu Das Artes', sales: 3800.64 },
			{ NOME: 'Franco da Rocha', sales: 738.06 },
			{ NOME: 'Garça', sales: 26762.83 },
			{ NOME: 'Guaratinguetá', sales: 5934.76 },
			{ NOME: 'Guarulhos', sales: 60994.060000000005 },
			{ NOME: 'Holambra', sales: 576.68 },
			{ NOME: 'Hortolandia', sales: 6211.66 },
			{ NOME: 'Indaiatuba', sales: 9932.4 },
			{ NOME: 'Iracemápolis', sales: 5893.2300000000005 },
			{ NOME: 'Itapetininga', sales: 31983.71 },
			{ NOME: 'Itapira', sales: 2375.1 },
			{ NOME: 'Itaquaquecetuba', sales: 8093.58 },
			{ NOME: 'Itatiba', sales: 29484.350000000002 },
			{ NOME: 'Itu', sales: 491292.74 },
			{ NOME: 'Jaboticabal', sales: 6814.01 },
			{ NOME: 'Jacareí', sales: 10979.49 },
			{ NOME: 'Jaguariuna', sales: 3779.24 },
			{ NOME: 'Jaguariúna', sales: 12141.05 },
			{ NOME: 'Jandira', sales: 3269.55 },
			{ NOME: 'Jardim Stella', sales: 739.45 },
			{ NOME: 'Jundiaí', sales: 48656.920000000006 },
			{ NOME: 'Leme', sales: 1902.23 },
			{ NOME: 'Lençois Paulista', sales: 0 },
			{ NOME: 'Limeira', sales: 3001.9799999999996 },
			{ NOME: 'Lins', sales: 423.19 },
			{ NOME: 'Lorena', sales: 968.09 },
			{ NOME: 'Louveira', sales: 7588.53 },
			{ NOME: 'Mairiporã', sales: 5840.25 },
			{ NOME: 'Martinópolis', sales: 4102.67 },
			{ NOME: 'Marília', sales: 2411.73 },
			{ NOME: 'Mirassol', sales: 1590.1799999999998 },
			{ NOME: 'Mogi Guaçu', sales: 1304.26 },
			{ NOME: 'Mogi das Cruzes', sales: 31858.699999999997 },
			{ NOME: 'Monte Mor', sales: 7924.0599999999995 },
			{ NOME: 'Nazaré Paulista', sales: 675.73 },
			{ NOME: 'Nova Odessa', sales: 368.98 },
			{ NOME: 'Novo Horizonte', sales: 731.94 },
			{ NOME: 'Osasco', sales: 2503.92 },
			{ NOME: 'Ourinhos', sales: 7146.87 },
			{ NOME: 'Penápolis', sales: 737.32 },
			{ NOME: 'Pindamonhangaba', sales: 4743.6 },
			{ NOME: 'Piracicaba', sales: 9492.64 },
			{ NOME: 'Pirassununga', sales: 4363.0599999999995 },
			{ NOME: 'Porto Feliz', sales: 2838.33 },
			{ NOME: 'Porto Ferreira', sales: 2170.85 },
			{ NOME: 'Praia Grande', sales: 456.5 },
			{ NOME: 'Presidente Prudente', sales: 9576.75 },
			{ NOME: 'Presidente Venceslau', sales: 1027.78 },
			{ NOME: 'Ribeirão Pires', sales: 3909.5499999999997 },
			{ NOME: 'Ribeirão Preto', sales: 216645.09999999998 },
			{ NOME: 'Rinópolis', sales: 819.72 },
			{ NOME: 'Rio Claro', sales: 2062.62 },
			{ NOME: 'Sales Oliveira', sales: 7516.08 },
			{ NOME: 'Salto', sales: 2687.08 },
			{ NOME: 'Santana de Parnaíba', sales: 12976.88 },
			{ NOME: "Santa Barbara D'Oest", sales: 12340.659999999998 },
			{ NOME: 'Santos', sales: 4591.87 },
			{ NOME: 'Santo André', sales: 33631.45 },
			{ NOME: 'Sertãozinho', sales: 46297.45 },
			{ NOME: 'Socorro', sales: 2826.23 },
			{ NOME: 'Sorocaba', sales: 64314.91000000001 },
			{ NOME: 'Sumaré', sales: 6489.570000000001 },
			{ NOME: 'Suzano', sales: 1057.29 },
			{ NOME: 'São Bernardo do Camp', sales: 74844.38000000002 },
			{ NOME: 'São Bernardo do Campo', sales: 43235.7 },
			{ NOME: 'São Caetano do Sul', sales: 45057.89 },
			{ NOME: 'São Carlos', sales: 7515.15 },
			{ NOME: 'São José dos Campos', sales: 30455.26 },
			{ NOME: 'São José do Rio Preto', sales: 12870.42 },
			{ NOME: 'São Paulo', sales: 425882.22 },
			{ NOME: 'São Roque', sales: 225909.72000000003 },
			{ NOME: 'Taboão da Serra', sales: 866.64 },
			{ NOME: 'Taquaritinga', sales: 2055.14 },
			{ NOME: 'Taubaté', sales: 0 },
			{ NOME: 'Tietê', sales: 1362.33 },
			{ NOME: 'Tupã', sales: 5478.45 },
			{ NOME: 'Valinhos', sales: 101130.06 },
			{ NOME: 'Varzea Paulista', sales: 3094.78 },
			{ NOME: 'Vinhedo', sales: 110661 },
			{ NOME: 'Votuporanga', sales: 2203.08 },
			{ NOME: 'Várzea Paulista', sales: 22105.410000000003 },
		];

		var totalValue = 0;

		for (var i = data.length - 1; i >= 0; i--) {
			totalValue += data[i].sales;
		}
		totalValue = totalValue / data.length;

		var hoveredStateId = null;
		const zoomThreshold = 5;

		mApp.salesHeatMap.on('load', function() {
			// Add source for state polygons hosted on Mapbox, based on US Census Data:
			// https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html
			mApp.salesHeatMap.addSource('SP_cities', {
				type: 'geojson',
				data: '/assets/geodata/minified/SP.min.json',
			});

			mApp.salesHeatMap.addSource('states', {
				type: 'geojson',
				data: '/assets/geodata/minified/Brasil.min.json',
			});

			var expression = ['match', ['get', 'NOME']];

			// Calculate color for each state based on the unemployment rate
			data.forEach(function(row) {
				var opacity = (row['sales'] / totalValue) * 1;
				var color =
					'rgba(' + 139 + ', ' + 182 + ', ' + 59 + ', ' + opacity + ')';
				expression.push(row['NOME'], color);
			});

			// Last value is the default, used where there is no data
			expression.push('rgba(0,0,0,0)');

			// The feature-state dependent fill-opacity expression will render the hover effect
			// when a feature's hover state is set to true.
			mApp.salesHeatMap.addLayer({
				id: 'state-fills',
				type: 'fill',
				source: 'states',
				layout: {},
				maxzoom: zoomThreshold,
				paint: {
					'fill-color': '#8BB63B',
					'fill-opacity': [
						'case',
						['boolean', ['feature-state', 'hover'], false],
						1,
						0,
					],
				},
			});

			// mApp.salesHeatMap.addLayer({
			//   id: "state-borders",
			//   type: "line",
			//   source: "states",
			//   layout: {},
			//   paint: {
			//     "line-color": "#8BB63B",
			//     "line-width": 1.5,
			//     "line-opacity": 0.3
			//   }
			// });

			// Add layer from the vector tile source with data-driven style
			mApp.salesHeatMap.addLayer(
				{
					id: 'states-join',
					type: 'fill',
					source: 'SP_cities',
					minzoom: zoomThreshold,
					paint: { 'fill-color': expression },
				},
				'waterway-label',
			);

			// When the user moves their mouse over the state-fill layer, we'll update the
			// feature state for the feature under the mouse.
			mApp.salesHeatMap.on('mousemove', 'state-fills', function(e) {
				if (e.features.length > 0) {
					if (hoveredStateId) {
						mApp.salesHeatMap.setFeatureState(
							{ source: 'states', id: hoveredStateId },
							{ hover: false },
						);
					}
					hoveredStateId = e.features[0].id;
					mApp.salesHeatMap.setFeatureState(
						{ source: 'states', id: hoveredStateId },
						{ hover: true },
					);
				}
			});

			// When the mouse leaves the state-fill layer, update the feature state of the
			// previously hovered feature.
			mApp.salesHeatMap.on('mouseleave', 'state-fills', function() {
				if (hoveredStateId) {
					mApp.salesHeatMap.setFeatureState(
						{ source: 'states', id: hoveredStateId },
						{ hover: false },
					);
				}
				hoveredStateId = null;
			});
		});
	};

	/**
	 * Initializes websockets services
	 */
	var initWebSockets = function() {
		const socket = io('http://localhost');
		socket.on('connect', function() {
			console.log('Connected');
			socket.emit('identity', 0, response =>
				console.log('Identity:', response),
			);
		});
		socket.on('changes', function(data) {
			dataUpdate(data);
		});
		socket.on('exception', function(data) {
			console.log('event', data);
		});
		socket.on('disconnect', function() {
			console.log('Disconnected');
		});
	};

	/**
	 * Execute data update service
	 */
	var dataUpdate = function(data) {
		console.info('YAY', data);
		if (!data.new_val) return;

		if (data.new_val.field === 'graphData') {
			updateChartData(data.new_val.value);
		} else if (data.new_val.field === 'lastFiveInvoices') {
			updateTabData(data.new_val.value, 'invoices');
		} else if (data.new_val.field === 'lastFiveSalesOrders') {
			updateTabData(data.new_val.value, 'salesOrders');
		} else {
			updateField(data.new_val.field, data.new_val.value);
		}

		// $({someValue: 0}).animate({someValue: 110}, {
		//     duration: 1000,
		//     easing:'swing', // can be anything
		//     step: function() { // called on every step
		//         // Update the element's text with rounded-up value:
		//         $('#el').text(Math.ceil(this.someValue) + "%");
		//     }
		// });
	};

	/**
	 * Updates Sales History Chart
	 */
	var updateChartData = function(newData) {
		mApp.salesHistoryChart = newData;
		//Updating the graph to show the new data
		mApp.salesHistoryChart.validateData();
	};

	/**
	 * Update field
	 */
	var updateField = function(fieldName, value) {
		$('#' + fieldName).hide(0, function() {
			if ($(this).hasClass('currency_format')) {
				value = numeral(value).format();
			} else if ($(this).hasClass('percentage_format')) {
				value = numeral(value).format('0%');
			}

			$(this)
				.html(value)
				.fadeIn(1500);
		});
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
			hideTouchWarning();
			initScrollables();
			initPortlets();
			initPopulateData();
			initHeatMap();
			initWebSockets();
		},

		/**
		 * Init Sales History Chart
		 */
		initWebSockets: function() {
			initWebSockets();
		},

		/**
		 * Init Sales History Chart
		 */
		initHeatMap: function() {
			initHeatMap();
		},

		/**
		 * Init Populate Data
		 */
		initPopulateData: function() {
			initPopulateData();
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
