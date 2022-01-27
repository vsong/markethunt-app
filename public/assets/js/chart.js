// chart vars
var primaryLineColor = "#4f52aa";
var volumeColor = "#51cda0";
var UtcTimezone = "T00:00:00+00:00"

// style
var eventBandColor = "#f2f2f2";
var eventBandFontColor = "#888888"; // recommend to have same or close color as yGridLineColor for visual clarity
var xGridLineColor = "#bbbbbb";
var yGridLineColor = "#aaaaaa";
var yGridLineColorLighter = "#dddddd";
var axisLabelColor = "#444444";
var crosshairColor = "#555555";

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

var eventData = [
    eventBand('2020-08-18', '2020-09-08', 'Ronza 2020'),
    eventBand('2020-10-14', '2020-11-03', 'Halloween 2020'),
    eventBand('2020-12-08', '2021-01-06', 'GWH 2020'),
    eventBand('2021-02-09', '2021-02-23', 'LNY 2021'),
    eventBand('2021-03-02', '2021-03-23', 'Birthday 2021'),
    eventBand('2021-03-30', '2021-04-27', 'SEH 2021'),
    eventBand('2021-05-25', '2021-06-08', 'KGA 2021'),
    eventBand('2021-06-29', '2021-07-13', 'Jaq 2021'),
    eventBand('2021-07-27', '2021-08-17', 'Ronza 2021'),
    eventBand('2021-10-13', '2021-11-02', 'Halloween 2021'),
    eventBand('2021-12-07', '2022-01-05', 'GWH 2021'),
]

function renderChartWithItemId(itemId, chartHeaderText) {
    document.getElementById('chartHeader').innerHTML = chartHeaderText;

    // get saved daterange preferences
    try {
        var currentDateMinimum = getChartDateRangesObj()[itemId]['min'];
    } catch (e) {
        var currentDateMinimum = 1;
    }
    
    // get entries on watchlist that matches itemId
    try {
        var filteredEntries = getWatchlistObj().filter(entry => entry.item_id == itemId).map(function(entry) {
            return {
                value: entry.mark, 
                label: {
                    text: entry.comment,
                    style: {
                        color: 'red',
                    },
                    x: 0, // remove left padding
                },
                color: 'red', 
                dashStyle: 'dash',
                zIndex: 6,
            };
        });
    } catch (e) {
        var filteredEntries = [];
    }
    
    $.getJSON("api/stock_data/getjson.php?item_id=" + itemId, function (response) {
        var daily_prices = [];
        var daily_trade_volume = [];
        for (var i = 0; i < response.data.length; i++) {
            daily_prices.push([
                UtcIsoDateToMillis(response.data[i].date),
                Number(response.data[i].price)
            ]);
            daily_trade_volume.push([
                UtcIsoDateToMillis(response.data[i].date),
                Number(response.data[i].volume)
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
                        enabled: false
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
                }
                }
            }
        });

        // Create the chart
        var chart = new Highcharts.stockChart('chartContainer', {
            chart: {
                animation: false, // disable range selector zooming animation
                events: {
                    click: function() {
                        onClickDatapoint(parseInt(this.hoverPoints[0].y));
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
                width: '40%',
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
                    name: 'Daily average price',
                    id: 'dailyPrice',
                    data: daily_prices,
                    lineWidth: 1.5,
                    states: {
                        hover: {
                            lineWidthPlus: 0,
                            halo: false, // disable translucent halo on marker hover
                        }
                    },
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
                                onClickDatapoint(parseInt(this.y));
                            },
                        },
                    },
                    tooltip: {
                        pointFormatter: function() {
                            return `<span style="color:${this.color}">\u25CF</span>`
                                + ` ${this.series.name}:`
                                + ` <b>${this.y.toLocaleString()}</b><br/>`;
                        },
                    },
                }, {
                    name: 'Volume',
                    type: 'column',
                    data: daily_trade_volume,
                    pointPadding: 0, // disable point and group padding to simulate column area chart
                    groupPadding: 0,
                    yAxis: 1,
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
                },
            ],
            yAxis: [{
                height: '80%',
                // lineWidth: 1,
                plotLines: filteredEntries,
                labels: {
                    formatter: function() {
                        return Number(this.value).toLocaleString() + 'g';
                    }
                },
                showLastLabel: true, // show label at top of chart
                crosshair: {
                    dashStyle: 'Dot',
                    color: crosshairColor,
                },
                opposite: false,
                resize: {
                    enabled: true,
                },
            }, {
                top: '82%',
                height: '18%',
                offset: 0,
                opposite: false,
                // gridLineColor: yGridLineColorLighter,
                tickPixelInterval: 35,
            }],
            xAxis: {
                type: 'datetime',
                ordinal: false, // show continuous x axis if dates are missing
                plotBands: eventData,
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
                        var chartDateRanges = getChartDateRangesObj();
                        chartDateRanges[itemId] = {'min': parseInt(event.min)};
                        setChartDateRangesObj(chartDateRanges);
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
    });
}