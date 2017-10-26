// var crypto = require('crypto');
// var FLOAT_ENTROPY_BYTES = 7;

// /**
//  * Given a buffer containing bytes of entropy, generate a double-precision
//  * 64-bit float.
//  *
//  * @param {Buffer} buf a buffer of bytes
//  * @returns {Number} a float
//  */
// function floatFromBuffer(buf) {
//     if (buf.length < FLOAT_ENTROPY_BYTES) {
//         throw new Error(
//             'buffer must contain at least ' + FLOAT_ENTROPY_BYTES + ' bytes of entropy'
//         )
//     }
//     var position = 0

//     // http://stackoverflow.com/questions/15753019/floating-point-number-from-crypto-randombytes-in-javascript
//     return (((((((
//                                 buf[position++] % 32) / 32 +
//                             buf[position++]) / 256 +
//                         buf[position++]) / 256 +
//                     buf[position++]) / 256 +
//                 buf[position++]) / 256 +
//             buf[position++]) / 256 +
//         buf[position]) / 256
// };

// function intFromFloat(min, max) {
//     var num = floatFromBuffer(crypto.randomBytes(FLOAT_ENTROPY_BYTES));
//     return min + Math.floor(num * (max - min));
// };

function Random(min, max) {
    return min + Math.floor(Math.random() * (max - min));
};

module.exports = Random;

//    var rand = (function() {
//         var seed = (new Date()).getTime();

//         function r() {
//             seed = (seed * 9301 + 49297) % 233280;
//             return seed / (233280.0);
//         }
//         return function(number) {
//             return Math.ceil(r() * number)
//         }
//     })();