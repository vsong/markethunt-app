function getWatchlistObjKey() {
    return 'watchlistv2';
}

// gets saved watchlist
function getWatchlistObj() {
    if (localStorage.watchlistv2 === undefined) {
        var watchlist = importWatchlistObjV1();
    } else {
        var watchlist = JSON.parse(localStorage.watchlistv2);
    }
    return watchlist;
}

function setWatchlistObj(watchlistObj) {
    localStorage.watchlistv2 = JSON.stringify(watchlistObj);
}

// gets saved date ranges of stock chart
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

// import function for legacy watchlists
function importWatchlistObjV1() {
    if (localStorage.watchlistv1 === undefined) {
        var watchlistv1 = [];
    } else {
        var watchlistv1 = JSON.parse(localStorage.watchlistv1);
    }

    var watchlistv2 = [newWatchlistObject("Default Watchlist")];

    watchlistv1.forEach(entry => {
        watchlistv2[0].watches.push(newWatchlistItem(
            Number(entry.item_id),
            entry.comment,
            entry.mark == null ? null : "gold",
            entry.mark,
        ));
    });

    localStorage.watchlistv2 = JSON.stringify(watchlistv2);
    return watchlistv2;
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * Helper function to create a watchlist object in the correct format. Returns an object in the following format:
 *  {
 *      uid: <str>
 *      date_created: <Unix millis>
 *      date_modified: <Unix millis>
 *      item_id: <int>
 *      mark_type: enum "gold", "sb", or null
 *      mark: <float> or null
 *      comment: <str>
 *      alert_date: <Unix millis> or null
 *      alert_price: <float> or null
 *  }
 * @param {int} item_id 
 * @param {string} comment
 * @param {string|null} mark_type Must be "gold", "sb", or null
 * @param {float|null} mark Must be float if mark_type is "gold" or "sb", or null otherwise
 * @param {int|null} alert_date Must be a millisecond Unix timestamp
 * @param {float|null} alert_price
 * @return {Object}
 */
function newWatchlistItem(item_id, comment = '', mark_type = null, mark = null, alert_date = null, alert_price = null) {
    return {
        'uid': "watch-" + uuidv4(),
        'date_created': Date.now(),
        'date_modified': Date.now(),
        'item_id': Number(item_id),
        'mark_type': mark_type,
        'mark': (mark_type == null) ? null : Number(mark),
        'comment': comment,
        'alert_date': (alert_date == null) ? null : Number(alert_date),
        'alert_price': (alert_price == null) ? null : Number(alert_price),
    };
}

function newWatchlistObject(name) {
    return {
        'name': name,
        'uid': 'watchlist-' + uuidv4(),
        'watches': [],
    }
}