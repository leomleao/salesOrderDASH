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
	 * Initializes bootstrap popover
	 */
	var initPopover = function(el) {
		var skin = el.data('skin') ? 'm-popover--skin-' + el.data('skin') : '';
		var triggerValue = el.data('trigger') ? el.data('trigger') : 'hover';

		el.popover({
			trigger: triggerValue,
			template:
				'\
            <div class="m-popover ' +
				skin +
				' popover" role="tooltip">\
                <div class="arrow"></div>\
                <h3 class="popover-header"></h3>\
                <div class="popover-body"></div>\
            </div>',
		});
	};

	/**
	 * Initializes bootstrap popovers
	 */
	var initPopovers = function() {
		// init bootstrap popover
		$('[data-toggle="m-popover"]').each(function() {
			initPopover($(this));
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
	 * Initializes bootstrap alerts
	 */
	var initAlerts = function() {
		// init bootstrap popover
		$('body').on('click', '[data-close=alert]', function() {
			$(this)
				.closest('.alert')
				.hide();
		});
	};

	/**
	 * Initializes Metronic custom tabs
	 */
	var initCustomTabs = function() {
		// init bootstrap popover
		// $('[data-tab-target]').each(function() {
		//     if ($(this).data('tabs-initialized') == true ) {
		//         return;
		//     }
		var next = 1;

		// Set a timeout
		var timeOut = setTimeout(nextTab, 10000);

		// $("#m_widget11_tab" + 2 + "_content").fadeOut(300);
		// $("#m_widget11_tab" + 1 + "_content").fadeIn("slow",function(){
		// });

		// pause on hover
		$('#recentFactsPortlet').hover(
			function() {
				clearTimeout(timeOut);
			},
			function() {
				timeOut = setTimeout(nextTab, 10000);
			},
		);

		var flag = true;
		function nextTab(event) {
			if (!flag) {
				return false;
			}
			clearTimeout(timeOut);

			flag = false;

			if (next == 1) {
				//New data array
				$('#recentFacts').fadeOut(200, function() {
					$(this)
						.html('Ultimas Ordens de Venda')
						.fadeIn('slow');
				});
				$('#m_widget11_tab' + 2 + '_content').fadeOut(300);
				$('#m_widget11_tab' + 1 + '_content').fadeIn('slow', function() {
					flag = true;
				});
				next = 2;
				timeOut = setTimeout(nextTab, 10000);
			} else {
				$('#recentFacts').fadeOut(200, function() {
					$(this)
						.html('Ultimos faturamentos')
						.fadeIn('slow');
				});
				$('#m_widget11_tab' + 1 + '_content').fadeOut(300);
				$('#m_widget11_tab' + 2 + '_content').fadeIn('slow', function() {
					flag = true;
				});
				next = 1;
				timeOut = setTimeout(nextTab, 10000);
			}
			return false;
		}
	};

	/**
	 * Initializes data populate
	 */
	var initPopulateData = function() {
		$.ajax({
			type: 'GET',
			url: 'dash/update',
			success: function(data) {
				console.info(data);
				for (var i = data.length - 1; i >= 0; i--) {
					if (data[i].field === 'chartData') {
						initSalesHistoryChart(data[i].value);
					} else if (data[i].field === 'pastOrdersChart') {
						initDailySalesChart(data[i].value);
					} else if (data[i].field === 'lastFiveInvoices') {
						updateTabData(data[i].value, 'invoices');
					} else if (data[i].field === 'lastFiveSalesOrders') {
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
	 * Initializes Sales in São paulo heat map
	 */
	var initSalesStateHeatMap = function() {
		// Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		// Create chart instance
		mApp.salesStateHeatMap = am4core.create(
			'm_chart_sales_state_heatmap',
			am4maps.MapChart,
		);

		mApp.salesStateHeatMap.titles.create().text;
		mApp.salesStateHeatMap.geodataSource.url =
			'../assets/vendors/myjsonfile.json';
		mApp.salesStateHeatMap.geodataSource.events.on('parseended', function(ev) {
			var data = [];
			console.info(ev.target.data.features.length);
			for (var i = 0; i < ev.target.data.features.length; i++) {
				data.push({
					id: ev.target.data.features[i].id,
					value: Math.round(Math.random() * 10000),
				});
			}
			polygonSeries.data = data;
		});

		// Set projection
		mApp.salesStateHeatMap.projection = new am4maps.projections.Miller();

		// Create map polygon series
		var polygonSeries = mApp.salesStateHeatMap.series.push(
			new am4maps.MapPolygonSeries(),
		);

		//Set min/max fill color for each area
		polygonSeries.heatRules.push({
			property: 'fill',
			target: polygonSeries.mapPolygons.template,
			min: mApp.salesStateHeatMap.colors.getIndex(1).brighten(1),
			max: mApp.salesStateHeatMap.colors.getIndex(1).brighten(-0.3),
		});

		// Make map load polygon data (state shapes and names) from GeoJSON
		polygonSeries.useGeodata = true;

		// Set up heat legend
		let heatLegend = mApp.salesStateHeatMap.createChild(am4maps.HeatLegend);
		heatLegend.series = polygonSeries;
		heatLegend.align = 'right';
		heatLegend.width = am4core.percent(25);
		heatLegend.marginRight = am4core.percent(4);
		heatLegend.minValue = 0;
		heatLegend.maxValue = 40000000;

		// Set up custom heat map legend labels using axis ranges
		var minRange = heatLegend.valueAxis.axisRanges.create();
		minRange.value = heatLegend.minValue;
		minRange.label.text = 'Little';
		var maxRange = heatLegend.valueAxis.axisRanges.create();
		maxRange.value = heatLegend.maxValue;
		maxRange.label.text = 'A lot!';

		// Blank out internal heat legend value axis labels
		heatLegend.valueAxis.renderer.labels.template.adapter.add('text', function(
			labelText,
		) {
			return '';
		});

		// Configure series tooltip
		var polygonTemplate = polygonSeries.mapPolygons.template;
		polygonTemplate.tooltipText = '{name}: {value}';

		// Create hover state and set alternative fill color
		var hs = polygonTemplate.states.create('hover');
		hs.properties.fill = mApp.salesStateHeatMap.colors
			.getIndex(1)
			.brighten(-0.5);
	};

	/**
	 * Initializes Sales in Brazil heat map
	 */
	var initSalesCountryHeatMap = function() {
		// Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		// Create chart instance
		mApp.salesCountryHeatMap = am4core.create(
			'm_chart_sales_country_heatmap',
			am4maps.MapChart,
		);

		mApp.salesCountryHeatMap.titles.create().text;
		mApp.salesCountryHeatMap.geodataSource.url =
			'../assets/vendors/brazilLow.json';
		mApp.salesCountryHeatMap.geodataSource.events.on('parseended', function(
			ev,
		) {
			var data = [];
			for (var i = 0; i < ev.target.data.features.length; i++) {
				data.push({
					id: ev.target.data.features[i].id,
					value: Math.round(Math.random() * 10000),
				});
			}
			polygonSeries.data = data;
		});

		// Set projection
		mApp.salesCountryHeatMap.projection = new am4maps.projections.Miller();

		// Create map polygon series
		var polygonSeries = mApp.salesCountryHeatMap.series.push(
			new am4maps.MapPolygonSeries(),
		);

		//Set min/max fill color for each area
		polygonSeries.heatRules.push({
			property: 'fill',
			target: polygonSeries.mapPolygons.template,
			min: mApp.salesCountryHeatMap.colors.getIndex(1).brighten(1),
			max: mApp.salesCountryHeatMap.colors.getIndex(1).brighten(-0.3),
		});

		// Make map load polygon data (state shapes and names) from GeoJSON
		polygonSeries.useGeodata = true;

		// Set up heat legend
		let heatLegend = mApp.salesCountryHeatMap.createChild(am4maps.HeatLegend);
		heatLegend.series = polygonSeries;
		heatLegend.align = 'right';
		heatLegend.width = am4core.percent(25);
		heatLegend.marginRight = am4core.percent(4);
		heatLegend.minValue = 0;
		heatLegend.maxValue = 40000000;

		// Set up custom heat map legend labels using axis ranges
		var minRange = heatLegend.valueAxis.axisRanges.create();
		minRange.value = heatLegend.minValue;
		minRange.label.text = 'Little';
		var maxRange = heatLegend.valueAxis.axisRanges.create();
		maxRange.value = heatLegend.maxValue;
		maxRange.label.text = 'A lot!';

		// Blank out internal heat legend value axis labels
		heatLegend.valueAxis.renderer.labels.template.adapter.add('text', function(
			labelText,
		) {
			return '';
		});

		// Configure series tooltip
		var polygonTemplate = polygonSeries.mapPolygons.template;
		polygonTemplate.tooltipText = '{name}: {value}';

		// Create hover state and set alternative fill color
		var hs = polygonTemplate.states.create('hover');
		hs.properties.fill = mApp.salesCountryHeatMap.colors
			.getIndex(1)
			.brighten(-0.5);
	};

	/**
	 * Initializes Sales History Chart
	 */
	var initSalesHistoryChart = function(data) {
		// Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		// Create chart instance
		mApp.salesHistoryChart = am4core.create(
			'm_chart_sales_history',
			am4charts.XYChart,
		);

		mApp.salesHistoryChart.language.locale = am4lang_pt_BR;

		/* Create axes */
		var categoryAxis = mApp.salesHistoryChart.xAxes.push(
			new am4charts.CategoryAxis(),
		);
		categoryAxis.dataFields.category = 'month';
		categoryAxis.renderer.minGridDistance = 30;

		/* Create value axis */
		var valueAxis = mApp.salesHistoryChart.yAxes.push(
			new am4charts.ValueAxis(),
		);

		/* Create series */
		var columnSeries = mApp.salesHistoryChart.series.push(
			new am4charts.ColumnSeries(),
		);
		columnSeries.name = '2018';
		columnSeries.dataFields.valueY = 'salesPast';
		columnSeries.dataFields.categoryX = 'month';

		columnSeries.columns.template.tooltipText =
			'[#fff font-size: 15px]{name} em {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]';
		columnSeries.columns.template.propertyFields.fillOpacity = 'fillOpacity';
		columnSeries.columns.template.propertyFields.stroke = 'stroke';
		columnSeries.columns.template.propertyFields.strokeWidth = 'strokeWidth';
		columnSeries.columns.template.propertyFields.strokeDasharray = 'columnDash';
		columnSeries.tooltip.label.textAlign = 'middle';

		/* Create series */
		var columnSeries2 = mApp.salesHistoryChart.series.push(
			new am4charts.ColumnSeries(),
		);
		columnSeries2.name = '2019';
		columnSeries2.dataFields.valueY = 'sales';
		columnSeries2.dataFields.categoryX = 'month';

		columnSeries2.columns.template.tooltipText =
			'[#fff font-size: 15px]{name} em {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]';
		columnSeries2.columns.template.propertyFields.fillOpacity = 'fillOpacity';
		columnSeries2.columns.template.propertyFields.stroke = 'stroke';
		columnSeries2.columns.template.propertyFields.strokeWidth = 'strokeWidth';
		columnSeries2.columns.template.propertyFields.strokeDasharray =
			'columnDash';
		columnSeries2.tooltip.label.textAlign = 'middle';

		var lineSeries = mApp.salesHistoryChart.series.push(
			new am4charts.LineSeries(),
		);
		lineSeries.name = 'Meta';
		lineSeries.dataFields.valueY = 'meta';
		lineSeries.dataFields.categoryX = 'month';

		lineSeries.stroke = am4core.color('#fdd400');
		lineSeries.strokeWidth = 3;
		lineSeries.propertyFields.strokeDasharray = 'lineDash';
		lineSeries.tooltip.label.textAlign = 'middle';

		mApp.salesHistoryChart.legend = new am4charts.Legend();
		mApp.salesHistoryChart.legend.position = 'bottom';
		mApp.salesHistoryChart.legend.valign = 'bottom';
		// chart.legend.margin(5,5,20,5);

		var bullet = lineSeries.bullets.push(new am4charts.Bullet());
		bullet.fill = am4core.color('#fdd400'); // tooltips grab fill from parent by default
		bullet.tooltipText =
			'[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]';
		var circle = bullet.createChild(am4core.Circle);
		circle.radius = 4;
		circle.fill = am4core.color('#fff');
		circle.strokeWidth = 3;

		mApp.salesHistoryChart.data = data;
	};

	/**
	 * Initializes dailySalesChart
	 */
	var initDailySalesChart = function(data) {
		var chartContainer = $('#m_chart_daily_sales');

		if (chartContainer.length == 0) {
			return;
		}

		const chartData = treatDataDailySalesChart(data);

		mApp.DailySalesChart = new Chart(chartContainer, {
			type: 'bar',
			data: chartData,
			options: {
				title: {
					display: false,
				},
				tooltips: {
					intersect: false,
					mode: 'nearest',
					xPadding: 10,
					yPadding: 10,
					caretPadding: 10,
				},
				legend: {
					display: false,
					position: 'bottom',
				},
				responsive: true,
				maintainAspectRatio: false,
				barRadius: 4,
				scales: {
					xAxes: [
						{
							gridLines: false,
							stacked: true,
							ticks: {
								padding: 15,
								autoSkip: true,
								autoSkipPadding: 15,
							},
						},
					],
					yAxes: [
						{
							display: false,
							stacked: true,
							gridLines: false,
						},
					],
				},
				layout: {
					padding: {
						left: 0,
						right: 0,
						top: 0,
						bottom: 10,
					},
				},
			},
		});
	};

	/**
	 * Initializes bootstrap collapse for Metronic's accordion feature
	 */
	var initAccordions = function(el) {};

	/**
	 * Treats data for Daily Sales Chart
	 */
	var treatDataDailySalesChart = function(data) {
		var today = new Date();

		const labels = [];
		const datasets = [
			{
				label: 'Ordens de Venda',
				backgroundColor: mUtil.getColor('success'),
				data: [],
			},
			{
				label: 'Cotacoes',
				backgroundColor: '#f3f3fb',
				data: [],
			},
		];

		for (let index = 12; index >= 0; index--) {
			var day = today.getDate() - index;
			var month = today.getMonth() + 1;
			// console.info("teste: ", data.find(x => (x.day === day && x.month === month && x.type === "9210")).count);

			if (
				data.find(x => x.day === day && x.month === month && x.type === '9210')
			) {
				datasets[0].data.push(
					data.find(
						x => x.day === day && x.month === month && x.type === '9210',
					).count,
				);
			} else {
				datasets[0].data.push(0);
			}
			if (
				data.find(x => x.day === day && x.month === month && x.type === '9050')
			) {
				datasets[1].data.push(
					data.find(
						x => x.day === day && x.month === month && x.type === '9050',
					).count,
				);
			} else {
				datasets[1].data.push(0);
			}
			labels.push(day + '/' + month);
		}
		datasets[0].data.push(20);
		datasets[1].data.push(20);

		console.info({ labels, datasets });

		return { labels, datasets };
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
		} else if (data.new_val.field === 'pastOrdersChart') {
			updateDailySalesChartData(data.new_val.value);
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
		mApp.salesHistoryChart.data = newData;
		//Updating the graph to show the new data
		mApp.salesHistoryChart.validateData();
	};

	/**
	 * Updates Sales History Chart
	 */
	var updateDailySalesChartData = function(newData) {
		mApp.DailySalesChart.data = treatDataDailySalesChart(newData);
		//Updating the graph to show the new data
		// mApp.salesHistoryChart.validateData();
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

	/**
	 * Update tabs of last Sales
	 */
	var updateTabData = function(newData, type) {
		console.info('data', newData);
		console.info('type', type);

		if (type === 'invoices') {
			$('#m_widget11_tab2_content')
				.find('tbody')
				.find('tr')
				.each(function(index) {
					const postDate = new Date(newData[index].postDate);
          const totalValue = numeral(newData[index].totalValue).format();;
					$(this)
						.children()
						.first()
						.children()
						.first()
						.html(newData[index].Name);
					$(this)
						.children()
						.first()
						.children()
						.first()
						.next()
						.html(newData[index].partnerID);
					$(this)
						.children()
						.first()
						.next()
						.html(
							  postDate.getDate() +
								'/' +
								(postDate.getMonth() + 1) +
								'/' +
								postDate.getFullYear(),
						);
					$(this)
						.children()
						.first()
						.next()
						.next()
						.html(totalValue);
				});
		} else if (type === 'salesOrders') {
			$('#m_widget11_tab1_content')
				.find('tbody')
				.find('tr')
				.each(function(index) {
          const creationDate = new Date(newData[index].creationDate);
					const totalValue = numeral(newData[index].totalValue).format();
					$(this)
						.children()
						.first()
						.children()
						.first()
						.html(newData[index].name);
					$(this)
						.children()
						.first()
						.children()
            .first()
						.next()
						.html(newData[index].customer);
					$(this)
						.children()
						.first()
						.next()
						.html(
              creationDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
						);
					$(this)
						.children()
						.first()
						.next()
						.next()
						.html(totalValue);
				});
		}
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
			initPopovers();
			initAlerts();
			initPortlets();
			initAccordions();
			initCustomTabs();
			initPopulateData();
			// initDailySalesChart();
			// initSalesBySegmentChart();
			// initSalesHistoryChart();
			initSalesStateHeatMap();
			initSalesCountryHeatMap();
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
		initSalesStateHeatMap: function() {
			initSalesStateHeatMap();
		},

		/**
		 * Init Sales History Chart
		 */
		initSalesCountryHeatMap: function() {
			initSalesCountryHeatMap();
		},
		/**
		 * Init Daily Sales Chart
		 */
		// initDailySalesChart: function() {
		// 	initDailySalesChart();
		// },
		/**
		 * Init Sales History Chart
		 */
		// initSalesHistoryChart: function() {
		//     initSalesHistoryChart();
		// },
		/**
		 * Init Sales by Segment Chart
		 */
		initSalesBySegmentChart: function() {
			initSalesBySegmentChart();
		},
		/**
		 * Init Populate Data
		 */
		initPopulateData: function() {
			initPopulateData();
		},

		/**
		 * Init custom tabs
		 */
		initCustomTabs: function() {
			initCustomTabs();
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
		initPopovers: function() {
			initPopovers();
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
//== Set defaults

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

Chart.elements.Rectangle.prototype.draw = function() {
	var ctx = this._chart.ctx;
	var vm = this._view;
	var left, right, top, bottom, signX, signY, borderSkipped, radius;
	var borderWidth = vm.borderWidth;

	// Set Radius Here
	// If radius is large enough to cause drawing errors a max radius is imposed
	var cornerRadius = this._chart.options.barRadius
		? this._chart.options.barRadius
		: 0;

	if (!vm.horizontal) {
		// bar
		left = vm.x - vm.width / 2;
		right = vm.x + vm.width / 2;

		if (vm.y > 2 * cornerRadius) {
			top = vm.y - cornerRadius;
		} else {
			top = vm.y;
		}

		bottom = vm.base;
		signX = 1;
		signY = bottom > top ? 1 : -1;
		borderSkipped = vm.borderSkipped || 'bottom';
		//console.log(vm.base + '-' + vm.y);
	} else {
		// horizontal bar
		left = vm.base;
		right = vm.x;
		top = vm.y - vm.height / 2;
		bottom = vm.y + vm.height / 2;
		signX = right > left ? 1 : -1;
		signY = 1;
		borderSkipped = vm.borderSkipped || 'left';
	}

	// Canvas doesn't allow us to stroke inside the width so we can
	// adjust the sizes to fit if we're setting a stroke on the line
	if (borderWidth) {
		// borderWidth shold be less than bar width and bar height.
		var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
		borderWidth = borderWidth > barSize ? barSize : borderWidth;
		var halfStroke = borderWidth / 2;
		// Adjust borderWidth when bar top position is near vm.base(zero).
		var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
		var borderRight =
			right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
		var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
		var borderBottom =
			bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
		// not become a vertical line?
		if (borderLeft !== borderRight) {
			top = borderTop;
			bottom = borderBottom;
		}
		// not become a horizontal line?
		if (borderTop !== borderBottom) {
			left = borderLeft;
			right = borderRight;
		}
	}

	ctx.beginPath();
	ctx.fillStyle = vm.backgroundColor;
	ctx.strokeStyle = vm.borderColor;
	ctx.lineWidth = borderWidth;

	// Corner points, from bottom-left to bottom-right clockwise
	// | 1 2 |
	// | 0 3 |
	var corners = [[left, bottom], [left, top], [right, top], [right, bottom]];

	// Find first (starting) corner with fallback to 'bottom'
	var borders = ['bottom', 'left', 'top', 'right'];
	var startCorner = borders.indexOf(borderSkipped, 0);
	if (startCorner === -1) {
		startCorner = 0;
	}

	function cornerAt(index) {
		return corners[(startCorner + index) % 4];
	}

	// Draw rectangle from 'startCorner'
	var corner = cornerAt(0);
	ctx.moveTo(corner[0], corner[1]);

	for (var i = 1; i < 4; i++) {
		corner = cornerAt(i);
		nextCornerId = i + 1;
		if (nextCornerId == 4) {
			nextCornerId = 0;
		}

		nextCorner = cornerAt(nextCornerId);

		width = corners[2][0] - corners[1][0];
		height = corners[0][1] - corners[1][1];
		x = corners[1][0];
		y = corners[1][1];

		var radius = cornerRadius;

		// Fix radius being too large
		if (radius > height / 2) {
			radius = height / 2;
		}
		if (radius > width / 2) {
			radius = width / 2;
		}

		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
	}

	ctx.fill();
	if (borderWidth) {
		ctx.stroke();
	}
};
