// gets saved watchlist
function getWatchlistObj() {
    if (localStorage.watchlistv1 === undefined) {
        var watchlist = [];
    } else {
        var watchlist = JSON.parse(localStorage.watchlistv1);
        // watchlist = watchlist.filter(item => item.item_id && item.mark);
    }
    return watchlist;
}

function setWatchlistObj(watchlistObj) {
    localStorage.watchlistv1 = JSON.stringify(watchlistObj);
}

function savedWatchlistExists() {
    if (localStorage.watchlistv1 === undefined) {
        return false;
    } else {
        return true;
    }
}

// gets saved date ranges
function getChartDateRangesObj() {
    if (localStorage.chartDateRanges === undefined) {
        var chartDateRanges = {};
    } else {
        var chartDateRanges = JSON.parse(localStorage.chartDateRanges);
    }
    return chartDateRanges;
}

function setChartDateRangesObj(dateRangesObj) {
    localStorage.chartDateRanges = JSON.stringify(dateRangesObj);
}