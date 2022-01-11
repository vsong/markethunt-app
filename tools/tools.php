<?php
/**
 * Validates that a date string is a valid ISO-8601 date in the format yyyy-mm-dd and clamps the datestring
 * within the minimum and maximum date bounds. Note: does not validate if $default_datestring is valid or
 * within bounds, nor does it validate that max >= min.
 *
 * @param string $datestring The datestring to check
 * @param string $default The default return value if $datestring is not a valid date
 * @param string|null $min_datestring The minimum value for $datestring in the format yyyy-mm-dd.
 * If $datestring is below this date, $min_datestring will be returned instead
 * @param string|null $max_datestring The maximum value for $datestring in the format yyyy-mm-dd.
 * If $datestring is above this date, $max_datestring will be returned instead
 * @return string A valid ISO-8601 datestring in the format yyyy-mm-dd
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
 * @param string $fromstring A valid datestring in the format yyyy-mm-dd
 * @param string $tostring A valid datestring in the format yyyy-mm-dd
 * @return boolean Returns true if $fromstring does not exceed $tostring
 */
function isValidISODateRange(string $fromstring, string $tostring): bool
{
    $from = date_create_from_format('Y-m-d', $fromstring);
    $to = date_create_from_format('Y-m-d', $tostring);

    return $from <= $to;
}