// chart vars
var UtcTimezone = "T00:00:00+00:00"

// style
var primaryLineColor = "#4f52aa";
var sbiLineColor = "#00c000"
var volumeColor = "#51cda0";

var eventBandColor = "#f2f2f2";
var eventBandFontColor = "#999999"; // recommend to have same or close color as yGridLineColor for visual clarity
var xGridLineColor = "#bbbbbb";
var yGridLineColor = "#aaaaaa";
var yGridLineColorLighter = "#dddddd";
var axisLabelColor = "#444444";
var crosshairColor = "#222222";

var chartFont = "arial";

function UtcIsoDateToMillis(dateStr) {
    return (new Date(dateStr + UtcTimezone)).getTime();
}

function eventBand(IsoStrFrom, IsoStrTo, labelText) {
    return {
        from: UtcIsoDateToMillis(IsoStrFrom),
        to: UtcIsoDateToMillis(IsoStrTo),
        color: eventBandColor,
        label: {
            text: labelText,
            rotation: 270,
            textAlign: 'right',
            y: 5, // pixels from top of chart
            x: 4, // fix slight centering issue
            style: {
                color: eventBandFontColor,
                fontWeight: 'bold',
                fontSize: '13px',
                fontFamily: 'Trebuchet MS',
            },
        },
    }
}

var volumeWarningLabelBand = {
    from: UtcIsoDateToMillis('2005-01-01'),
    to: UtcIsoDateToMillis('2021-11-30'),
    color: 'rgba(0,0,0,0)',
    label: {
        text: 'Volume data not available before Dec 1, 2021',
        textAlign: 'center',
        verticalAlign: 'bottom',
        y: 50,
        x: 0,
        style: {
            color: eventBandFontColor,
            fontSize: '12px',
            fontFamily: 'Trebuchet MS',
        },
    },
}

var eventBands = [volumeWarningLabelBand]; // keep this plotband at beginning of array
eventDates.forEach(event => eventBands.push(eventBand(event[0], event[1], event[2])));

function renderChartWithItemId(itemId, chartHeaderText, jsonData = null) {
    itemId = Number(itemId);

    // set up header elements
    const chartTitleElem = document.getElementById('chartHeader');
    const externalMhLinkElem = document.getElementById('chart-external-mh-link');
    const priceElem = document.getElementById('chart-header-price');
    const changeElem = document.getElementById('chart-header-change');
    const sbPriceElem = document.getElementById('chart-header-sb-index');
    const loadingElem = document.getElementsByClassName('chart-loading')[0];

    chartTitleElem.innerHTML = chartHeaderText;
    externalMhLinkElem.href = 'https://www.mousehuntgame.com/i.php?id=' + itemId;
    priceElem.innerHTML = "-- g";
    changeElem.innerHTML = "-- (-- %)";
    changeElem.className = '';
    sbPriceElem.innerHTML = "-- SB";
    loadingElem.style.display = "flex";

    // get saved daterange preferences
    try {
        var currentDateMinimum = getChartDateRangesObj()[itemId]['min'];
    } catch (e) {
        var currentDateMinimum = 1;
    }
    
    // get entries on watchlist that matches itemId
    var filteredEntries = [];
    try {
        getWatchlistObj().forEach(function(watchlist) {
            watchlist.watches.forEach(function(entry) {
                if (entry.item_id === itemId && entry.mark_type === 'gold') {
                    filteredEntries.push({
                        value: entry.mark, 
                        label: {
                            text: watchlist.name + ": " + entry.comment,
                            style: {
                                color: 'red',
                            },
                            x: 0, // remove left padding
                        },
                        color: 'red', 
                        dashStyle: 'dash',
                        zIndex: 6,
                    });
                }
            });
        });
    } catch (e) {
        console.log(e.stack);
        console.error('Failed to filter watchlist entries for item ' + itemId);
    }
    
    function renderChart(response) {
        var daily_prices = [];
        var daily_trade_volume = [];
        var sbi = [];
        for (var i = 0; i < response.data.length; i++) {
            daily_prices.push([
                UtcIsoDateToMillis(response.data[i].date),
                Number(response.data[i].price)
            ]);
            daily_trade_volume.push([
                UtcIsoDateToMillis(response.data[i].date),
                Number(response.data[i].volume)
            ]);
            sbi.push([
                UtcIsoDateToMillis(response.data[i].date),
                Number(response.data[i].sb_index)
            ]);
        }

        Highcharts.setOptions({
            chart: {
                style: {
                    fontFamily: chartFont,
                },
            },
            plotOptions: {
                series: {
                    animation: false,
                    dataGrouping: {
                        enabled: (itemId == 114114) ? true : false,
                        units: [['day', [1]], ['week', [1]]],
                        groupPixelWidth: 2,
                    },
                    showInLegend: true,
                },
            },
            xAxis: {
                // lineColor: '#555',
                tickColor: xGridLineColor,
                // gridLineWidth: 1,
                gridLineColor: xGridLineColor,
                labels: {
                    style: {
                        color: axisLabelColor,
                        fontSize: '12px',
                    }
                }
            },
            yAxis: {
                gridLineColor: yGridLineColor,
                labels: {
                    style: {
                        color: axisLabelColor,
                        fontSize: '12px',
                    },
                    y: 3,
                }
            }
        });

        // Create the chart
        var chart = new Highcharts.stockChart('chartContainer', {
            chart: {
                animation: false, // disable range selector zooming animation
                events: {
                    click: function() {
                        addToWatchlistModal(parseInt(this.hoverPoints[0].y));
                    },
                },
            },
            // must keep scrollbar enabled for dynamic scrolling, so hide the scrollbar instead
            scrollbar: {
                height: 0,
                buttonArrowColor: "#ffffff00",
            },
            title: {
                enabled: false,
            },
            rangeSelector: {
                buttons: [
                    {
                        type: 'month',
                        count: 1,
                        text: '1M'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3M'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6M'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1Y'
                    }, {
                        type: 'all',
                        text: 'All'
                    },
                ],
                inputEnabled: false,
                labelStyle: {
                    color: axisLabelColor,
                }
            },
            legend: {
                enabled: true,
                align: 'right',
                verticalAlign: 'top',
                width: '35%',
                y: -28,
                padding: 0,
                itemStyle: {
                    color: '#000000',
                    fontSize: "13px",
                },
            },
            tooltip: {
                animation: false,
                shared: true,
                split: false,
                headerFormat: '<span style="font-size: 13px">{point.key}</span><br/>',
                xDateFormat: '%b %e, %Y',
                backgroundColor: 'rgba(255, 255, 255, 1)',
                hideDelay: 0, // makes tooltip feel more responsive when crossing gap between plots
                style: {
                    color: '#000000',
                    fontSize: '13px',
                }
            },
            series: [
                {
                    name: 'Daily price',
                    id: 'dailyPrice',
                    data: daily_prices,
                    lineWidth: 1.5,
                    states: {
                        hover: {
                            lineWidthPlus: 0,
                            halo: false, // disable translucent halo on marker hover
                        }
                    },
                    yAxis: 0,
                    color: primaryLineColor,
                    marker: {
                        states: {
                            hover: {
                                lineWidth: 0,
                            }
                        },
                    },
                    point: {
                        events: {
                            click: function() {
                                addToWatchlistModal(parseInt(this.y));
                            },
                        },
                    },
                    tooltip: {
                        pointFormatter: function() {
                            return `<span style="color:${this.color}">\u25CF</span>`
                                + ` ${this.series.name}:`
                                + ` <b>${this.y.toLocaleString()}g</b><br/>`;
                        },
                    },
                }, {
                    name: 'Volume',
                    type: 'column',
                    data: daily_trade_volume,
                    pointPadding: 0, // disable point and group padding to simulate column area chart
                    groupPadding: 0,
                    yAxis: 2,
                    color: volumeColor,
                    tooltip: {
                        pointFormatter: function() {
                            if (this.y !== 0){
                                var suffixes = ["", "K", "M", "B"];
                                var order = Math.max(Math.floor(Math.log(this.y) / Math.log(1000)), 0);
                                if (order > suffixes.length - 1) {
                                    order = suffixes.length - 1;
                                }
                                var significand = this.y / Math.pow(1000, order);
                                var volumeText = significand.toFixed(1).replace(/\.0+$/,'') + suffixes[order];
                            } else {
                                var volumeText = 'n/a';
                            }
                            return `<span style="color:${this.color}">\u25CF</span>`
                                + ` ${this.series.name}:`
                                + ` <b>${volumeText}</b><br/>`;
                        },
                    },
                }, {
                    name: 'SBI',
                    id: 'sbi',
                    data: sbi,
                    visible: false,
                    lineWidth: 1.5,
                    states: {
                        hover: {
                            lineWidthPlus: 0,
                            halo: false, // disable translucent halo on marker hover
                        }
                    },
                    yAxis: 1,
                    color: sbiLineColor,
                    marker: {
                        states: {
                            hover: {
                                lineWidth: 0,
                            }
                        },
                    },
                    tooltip: {
                        pointFormatter: function() {
                            if (this.y >= 1000) {
                                var sbiText = Math.round(this.y).toLocaleString();
                            } else if (this.y >= 100) {
                                var sbiText = this.y.toFixed(1).toLocaleString();
                            } else if (this.y >= 10) {
                                var sbiText = this.y.toFixed(2).toLocaleString();
                            } else {
                                var sbiText = this.y.toFixed(3).toLocaleString();
                            }
                            return `<span style="color:${this.color}">\u25CF</span>`
                                + ` SB Index:`
                                + ` <b>${sbiText} SB</b><br/>`;
                        },
                    },
                },
            ],
            yAxis: [
                {
                    height: '80%',
                    // lineWidth: 1,
                    plotLines: filteredEntries,
                    labels: {
                        formatter: function() {
                            return this.value.toLocaleString() + 'g';
                        }
                    },
                    showLastLabel: true, // show label at top of chart
                    crosshair: {
                        dashStyle: 'Dot',
                        color: crosshairColor,
                    },
                    opposite: false,
                    alignTicks: false, // disabled, otherwise autoranger will create too large a Y-window
                }, {
                    height: '80%',
                    gridLineWidth: 0,
                    labels: {
                        formatter: function() {
                            return this.value.toLocaleString() + ' SB';
                        }
                    },
                    showLastLabel: true, // show label at top of chart
                    opposite: true,
                    alignTicks: false,
                }, {
                    top: '82%',
                    height: '18%',
                    offset: 0,
                    opposite: false,
                    tickPixelInterval: 35,
                    allowDecimals: false
            }],
            xAxis: {
                type: 'datetime',
                ordinal: false, // show continuous x axis if dates are missing
                plotBands: eventBands,
                range: Date.now() - currentDateMinimum,
                crosshair: {
                    dashStyle: 'Dot',
                    color: crosshairColor,
                },
                dateTimeLabelFormats:{
                    day: '%b %e',
                    week: '%b %e, \'%y',
                    month: '%b %Y',
                    year: '%Y'
                },
                events: {
                    setExtremes: function(event) {
                        // save navigator min range
                        const chartDateRanges = getChartDateRangesObj();
                        chartDateRanges[itemId] = {'min': parseInt(event.min)};
                        setChartDateRangesObj(chartDateRanges);

                        // hide/unhide volume data warning based on current plotband pixel width
                        const volumeWarningBand = this.plotLinesAndBands[0];

                        if (volumeWarningBand.label !== undefined) {
                            const from = Math.max(this.toPixels(volumeWarningBand.options.from), this.chart.plotLeft);
                            const to = Math.min(this.toPixels(volumeWarningBand.options.to), this.chart.plotLeft + this.chart.plotWidth);
                            const show = volumeWarningBand.label.getBBox().width < to - from;
                            volumeWarningBand.label.css({ opacity: (show ? 1 : 0) });
                        }
                    },
                },
                tickPixelInterval: 120,
            },
            navigator: {
                height: 45,
                margin: 5,
                maskInside: false,
            }
        });

        loadingElem.style.display = "none";

        if (response.data.length > 0) {
            var latest = response.data[response.data.length - 1];
            priceElem.innerHTML = latest.price.toLocaleString() + 'g';
            
            try {
                sbPriceElem.innerHTML = latest.sb_index.toLocaleString("en-US", {maximumFractionDigits: 2}) + ' SB';
            } catch (e) {
                sbPriceElem.innerHTML = 'SB price not available';
            }

            if ((response.data.length > 1) && (Date.now() - UtcIsoDateToMillis(latest.date) < 2 * 86400 * 1000)) {
                var secondLatest = response.data[response.data.length - 2];
                var goldDiff = latest.price - secondLatest.price;
                var diffClass = "";
                var prefix = "";

                if (goldDiff > 0) {
                    prefix = '+';
                    diffClass = 'gains-text';
                } else if (goldDiff < 0) {
                    prefix = '-';
                    diffClass = 'loss-text';
                }

                changeElem.innerHTML = prefix 
                    + Math.abs(goldDiff).toLocaleString() + 'g'
                    + ' (' + Math.abs((latest.price / secondLatest.price - 1) * 100).toFixed(1) + '%)';
                    changeElem.className = diffClass;
            } else {
                changeElem.innerHTML = "<i>No recent activity</i>";
            }
        }
    }
    
    if (jsonData == null) {
        $.getJSON("api/stock_data/getjson.php?item_id=" + itemId, function (response) {
            renderChart(response);
        });
    } else {
        renderChart(jsonData);
    }
}