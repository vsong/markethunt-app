// chart vars
var primaryLineColor = "#4f52aa";

// prepare data
var timezone = "T00:00:00"
var daily_prices = [];
var daily_trade_volume = [];

// get saved date range
if (localStorage.chartDateRanges === undefined) {
    var chartDateRanges = {};
} else {
    var chartDateRanges = JSON.parse(localStorage.chartDateRanges);
}

function renderChartWithItemId(itemId, chartHeaderText, markLines = []) {
    try {
        var currentDateMinimum = chartDateRanges[itemId]['min'];
    } catch (e) {
        var currentDateMinimum = 1;
    }

    var stockChart = new CanvasJS.StockChart("chartContainer", {
        theme: "light2",
        exportEnabled: false,
        rangeChanged: function(e){
            chartDateRanges[itemId] = {'min': e.minimum};
            localStorage.chartDateRanges = JSON.stringify(chartDateRanges);
        },
        charts: [{
            toolTip: {
                shared: true
            },
            axisX: {
                lineThickness: 3,
                tickLength: 0,
                stripLines: eventData,
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true,
                    label: "", //disable axis tooltop
                }
            },
            axisY: {
                suffix: "g",
                stripLines: markLines,
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true,
                    label: "", //disable axis tooltop
                }
            },
            legend: {
                verticalAlign: "top"
            },
            data: [{
                showInLegend: true,
                name: "Daily marketplace price",
                color: primaryLineColor,
                yValueFormatString: "#,###",
                type: "line",
                lineThickness: 1.5,
                click: onClickDatapoint,
                dataPoints: daily_prices
            }]
        }, {
            height: 120,
            toolTip: {
                shared: true
            },
            axisY: {
                prefix: "",
                labelFormatter: addSymbols
            },
            legend: {
                verticalAlign: "top"
            },
            data: [{
                showInLegend: true,
                name: "Volume",
                color: "#51cda0",
                yValueFormatString: "#,###.##",
                dataPoints: daily_trade_volume
            }]
        }],
        navigator: {
            enabled: true,
            height: 50,
            data: [{
                color: primaryLineColor,
                dataPoints: daily_prices
            }],
            slider: {
                minimum: new Date(currentDateMinimum),
                // maximum: new Date(2099, 08, 01)
            }
        }
    });

    document.getElementById('chartHeader').innerHTML = chartHeaderText;

    $.getJSON("api/stock_data/getjson.php?item_id=" + itemId, function(retval) {
        daily_prices = []; daily_trade_volume = [];
        for (var i = 0; i < retval.data.length; i++) {
            stockChart.options.charts[0].data[0].dataPoints.push({
                x: new Date(retval.data[i].date + timezone),
                y: Number(retval.data[i].price)
            });
            stockChart.options.charts[1].data[0].dataPoints.push({
                x: new Date(retval.data[i].date + timezone),
                y: Number(retval.data[i].volume)
            });
        }
        stockChart.render();
    });
}

//calculateMovingAverage(stockChart);

function addSymbols(e) {
    var suffixes = ["", "K", "M", "B"];
    var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
    if (order > suffixes.length - 1)
        order = suffixes.length - 1;
    var suffix = suffixes[order];
    return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
}

function calculateMovingAverage(chart) {
    var numOfDays = 7;
    // return if there are insufficient dataPoints
    if (chart.options.charts[0].data[0].dataPoints.length <= numOfDays) {
        return;
    } else {
        // Add a new line series for  Moving Averages
        chart.options.charts[0].data.push({
            visible: true,
            showInLegend: true,
            type: "line",
            markerSize: 0,
            name: "7 day trailing average",
            yValueFormatString: "#,###",
            dataPoints: []
        });
        var total;
        for (var i = numOfDays; i < chart.options.charts[0].data[0].dataPoints.length; i++) {
            total = 0;
            for (var j = (i - numOfDays); j < i; j++) {
                total += chart.options.charts[0].data[0].dataPoints[j].y;
            }
            chart.options.charts[0].data[1].dataPoints.push({
                x: chart.options.charts[0].data[0].dataPoints[i].x,
                y: total / numOfDays
            });
        }
    }
}