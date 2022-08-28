/**
 * Generate a true random 48bit number represented as a 12 character hex string
 * @returns Cryptographically random 12 character hex string
 */
function uid() {
    return '000000000000'.replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}