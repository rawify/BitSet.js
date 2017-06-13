# BitSet.js

[![NPM Package](https://nodei.co/npm-dl/bitset.js.png?months=6&height=1)](https://npmjs.org/package/bitset.js)

[![Build Status](https://travis-ci.org/infusion/BitSet.js.svg)](https://travis-ci.org/infusion/BitSet.js)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

BitSet.js is a infinite [Bit-Array](http://en.wikipedia.org/wiki/Bit_array) implementation in JavaScript. That means that if you invert a bit vector, the leading ones get remembered. As far as I can tell, BitSet.js is the only library which has this feature. It is also heavily benchmarked against other implementations and is the fastest implementation to date.

*NOTE:* As of version v4.0.0, BitSet.js is mutable, which means that the object gets changed by method invocations. In order to work on explicit copies, use `clone()`.

Examples
===

Basic usage
---
```javascript
var bs = new BitSet;
bs.set(128, 1); // Set bit at position 128
console.log(bs.toString(16)); // Print out a hex dump with one bit set
```

Flipping bits
---
```javascript
var bs = new BitSet;
bs
  .flip(0, 62)
  .flip(29, 35);

var str = bs.toString();

if (str === "111111111111111111111111111000000011111111111111111111111111111") {
   console.log("YES!");
}
```

Range Set
---
```javascript
var bs = new BitSet;
bs.setRange(10, 18, 1); // Set a 1 between 10 and 18, inclusive
```

User permissions
---
If you want to store user permissions in your database and use BitSet for the bit twiddling, you can start with the following Linux-style snippet:
```javascript
var P_READ  = 2; // Bit pos
var P_WRITE = 1;
var P_EXEC  = 0;

var user = new BitSet;
user.set(P_READ); // Give read perms
user.set(P_WRITE); // Give write perms

var group = new BitSet(P_READ);
var world = new BitSet(P_EXEC);

console.log("0" + user.toString(8) + group.toString(8) + world.toString(8));
```

Installation
===

```
npm install bitset.js
```
or
```
bower install bitset.js
```

Using BitSet.js with the browser
===
```html
<script src="bitset.js"></script>
<script>
    console.log(BitSet("111"));
</script>
```

Using BitSet.js with require.js
===
```html
<script src="require.js"></script>
<script>
requirejs(['bitset.js'],
function(BitSet) {
    console.log(BitSet("1111"));
});
</script>
```

Parser
===
The parser accepts the following types of values in either function

Strings
- Binary strings "010101"
- Binary strings with prefix "0b100101"
- Hexadecimal strings with prefix "0xaffe"

Arrays
- The values of the array are the indizes to be set to 1

Uint8Array
- A binary representation in 8 bit form

Number
- A binary value

BitSet
- A BitSet object, which get copied over


Functions
===

The data type Mixed can be either a BitSet object, a String or an integer representing a native bitset with 31 bits.


BitSet set(ndx[, value=0)
---
Sets value 0 or 1 to index `ndx` of the bitset

int get(int ndx)
---
Gets the value at index ndx

BitSet setRange(from, to[, value=1])
---
Helper function for set, to set an entire range to a given value

BitSet clear([from[, to])
---
Sets a portion of a given bitset to zero

- If no param is given, the whole bitset gets cleared
- If one param is given, the bit at this index gets cleared
- If two params are given, the range is cleared

BitSet slice([from[, to])
---
Extracts a portion of a given bitset as a new bitset

- If no param is given, the bitset is getting cloned
- If one param is given, the index is used as offset
- If two params are given, the range is returned as new BitSet

BitSet flip([from[, to])
---
Toggles a portion of a given bitset

- If no param is given, the bitset is inverted
- If one param is given, the bit at the index is toggled
- If two params are given, the bits in the given range are toggled

BitSet not()
---
Calculates the bitwise not

BitSet and(Mixed x)
---
Calculates the bitwise and between two bitsets

BitSet or(Mixed x)
---
Calculates the bitwise or between two bitsets

BitSet xor(Mixed x)
---
Calculates the bitwise xor between two bitsets

BitSet andNot(Mixed x)
---
Calculates the bitwise andNot between two bitsets (this is not the nand operation!)

BitSet clone()
---
Clones the actual object

Array toArray()
---
Returns an array with all indexes set in the bitset

String toString([base=2])
---
Returns a string representation with respect to the base

int cardinality()
---
Calculates the number of bits set

int msb()
---
Calculates the most significant bit (the left most)

int ntz()
---
Calculates the number of trailing zeros (zeros on the right)

int lsb()
---
Calculates the least significant bit (the right most)

bool isEmpty()
---
Checks if the bitset has all bits set to zero

bool equals()
---
Checks if two bitsets are the same

BitSet.fromBinaryString(str)
---
Alternative constructor to pass with a binary string

BitSet.fromHexString(str)
---
Alternative constructor to pass a hex string

Coding Style
===
As every library I publish, bitset.js is also built to be as small as possible after compressing it with Google Closure Compiler in advanced mode. Thus the coding style orientates a little on maxing-out the compression rate. Please make sure you keep this style if you plan to extend the library.

Build the library
===
Gulp is optional for minifying with Google Closure Compiler. After cloning the Git repository, do:

```
npm install
gulp
```

Run a test
===
Testing the source against the shipped test suite is as easy as

```
npm test
```

Copyright and licensing
===
Copyright (c) 2015, [Robert Eisele](http://www.xarg.org/)
Dual licensed under the MIT or GPL Version 2 licenses.
