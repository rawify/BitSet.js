# BitSet.js 

[![NPM Package](https://img.shields.io/npm/v/bitset.js.svg?style=flat)](https://npmjs.org/package/bitset.js "View this project on npm")
[![Build Status](https://travis-ci.org/infusion/BitSet.js.svg)](https://travis-ci.org/infusion/BitSet.js)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

BitSet.js is a [Bit-Array](http://en.wikipedia.org/wiki/Bit_array) implementation in JavaScript.

With this library, you can work on large bit vectors without worring about system constraints, given by integer size.

*NOTE:* As of version 3.0.0 BitSet.js is immutable, which means that every function call returns a new instance of the object.

Examples
===

Basic usage
---
```javascript
var bs = new BitSet;
bs.set(128, 1); // Set bit at position 128
console.log(bs.toString(16)); // Print out a hex dump with one bit set
```

User permissions
---
If you want to store user permissions in your database and use BitSet for the bit twiddling, you can start with the following Linux-style snippet:
```javascript
var P_READ  = 2; // Bit pos
var P_WRITE = 1;
var P_EXEC  = 0;

var user = new BitSet;
user = user.set(P_READ); // Give read perms
user = user.set(P_WRITE); // Give write perms

var group = new BitSet(P_READ);
var world = new BitSet(P_EXEC);

console.log("0" + user.toString(8) + group.toString(8) + world.toString());
```


Range Set
---
```javascript
var bs = new BitSet; // Default is 31 bit
bs.setRange(10, 18, 1); // Set a 1 between 10 and 18
```


Flipping bits
---
```javascript
var bs = new BitSet;
bs = bs
  .flip(0, 62)
  .flip(29, 35);

var str = bs.toString();

if (str === "11111111111111111111111111000000011111111111111111111111111111") {
   console.log("YES!");
}
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
    <script src="bitset.js"></script>
    <script>
        console.log(BitSet("111"));
    </script>


Using BitSet.js with require.js
===
    <script src="require.js"></script>
    <script>
    requirejs(['bitset.js'],
    function(BitSet) {
        console.log(BitSet("1111"));
    });
    </script>


Available methods
===

The data type Mixed can be either a BitSet object, a String or an integer representing a native bitset with 31 bits.

Bitwise functions
---
**Bitwise not**
```
BitSet not(Mixed x)
```
**Bitwise and**
```
BitSet and(Mixed x)
```
**Bitwise or**
```
BitSet or(Mixed x)
```
**Bitwise nand**
```
BitSet nand(Mixed x)
```
**Bitwise nor**
```
BitSet nor(Mixed x)
```
**Bitwise xor**
```
BitSet xor(Mixed x)
```
**Set a bit at position index, default 1**
```
BitSet set(int index, int value=1)
```
**Get a bit at position index**
```
BitSet get(int index)
```
**Set a range of bits, either by a binary string or by a single bit value**
```
BitSet setRange(int start, int end, String binstr)
BitSet setRange(int start, int end, int value)
```
**Retrieve a range of bits, indicated by start and end index**
```
BitSet getRange(int start, int end)
```
**Get the number of bits set**
```
int cardinality()
```
**Get the most significant bit set, same as log base two**
```
int msb()
```
**Clear a range of bits, either all, a certain position or indicated with start and end**
```
BitSet clear()
BitSet clear(int pos)
BitSet clear(int start, int end)
```

**Invert/Flip either all bits, a single bit position or a range of bits**
```
BitSet flip()
BitSet flip(int pos)
BitSet flip(int start, int end)
```

Comparision functions
---
**Compare (=same size and all bits equal) two BitSet objects**
```
boolean equals(BitSet x)
```
**Check if all bits of a BitSet are set to 0**
```
boolean isEmpty()
```

Misc functions
---
**Overrides the toString function for a pretty representation**
```
String toString(Number radix=2)
```
**Create a copy of the actual BitSet object**
```
BitSet clone()
```

Coding Style
===
As every library I publish, bitset.js is also built to be as small as possible after compressing it with Google Closure Compiler in advanced mode. Thus the coding style orientates a little on maxing-out the compression rate. Please make sure you keep this style if you plan to extend the library.

Run a test
===
Testing the source against the shipped test suite is as easy as

```
npm test
```
