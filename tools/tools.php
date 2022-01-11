<?php
/**
 * Validates that a date string is a valid ISO-8601 date and clamps the datestring
 * within the minimum and maximum date bounds. Note: does not validate if $default_datestring is valid or
 * within bounds, nor does it validate that max >= min.
 *
 * @param string $datestring The datestring to check
 * @param string $default The default return value if $datestring is not a valid date
 * @param string|null $min_datestring The minimum value for $datestring in ISO format.
 * If $datestring is below this date, $min_datestring will be returned instead
 * @param string|null $max_datestring The maximum value for $datestring in ISO format.
 * If $datestring is above this date, $max_datestring will be returned instead
 * @return string A valid ISO-8601 datestring in ISO format
 */
function validateISODate(string $datestring, string $default, ?string $min_datestring = null, ?string $max_datestring = null): string
{
    // check datestring is an actual date in ISO format
    $parsed_date = date_parse_from_format('Y-m-d', $datestring);
    if ($parsed_date['error_count'] > 0 || !checkdate((int)$parsed_date['month'], (int)$parsed_date['day'], (int)$parsed_date['year'])) {
        return $default;
    }

    // check datestring is within min and max bounds
    $date = date_create_from_format('Y-m-d', $datestring);

    if (!empty($min_datestring)) {
        $min_date = date_create_from_format('Y-m-d', $min_datestring);
        if ($date < $min_date) {
            return $min_datestring;
        }
    }

    if (!empty($max_datestring)) {
        $max_date = date_create_from_format('Y-m-d', $max_datestring);
        if ($date > $max_date) {
            return $max_datestring;
        }
    }

    return $datestring;
}

/**
 * Validates that the date represented by $fromstring does not exceed $tostring
 *
 * @param string $fromstring A valid datestring in ISO format
 * @param string $tostring A valid datestring in ISO format
 * @return boolean Returns true if $fromstring does not exceed $tostring
 */
function isValidISODateRange(string $fromstring, string $tostring): bool
{
    $from = date_create_from_format('Y-m-d', $fromstring);
    $to = date_create_from_format('Y-m-d', $tostring);

    return $from <= $to;
}

/**
 * Returns array containing a datestring range in ISO format beginning from a specified offset and ending
 * at yesterday.
 *
 * @param string $modify How much the date range should be separated by. Must be negative only, or if you
 * want no offset at all, pass '0 days' as the value. See https://www.php.net/manual/en/datetime.modify.php
 * for more details.
 * @return array Returns tuple with 'from' datestring and 'to' datestring in ISO format. The 'to' datestring
 * will always be yesterday and the 'from' datestring will be offset relative to that date as specified
 * in $modify
 */
function createISODateRangeYesterday(string $modify): array
{
    return ['from'=>date_create()->modify('-1 day')->modify($modify)->format('Y-m-d'),
        'to'=>date_create()->modify('-1 day')->format('Y-m-d')];
}

function yesterdayAsISODate(): string
{
    return date_create()->modify('-1 day')->format('Y-m-d');
}