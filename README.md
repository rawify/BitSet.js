# BitSet.js 

BitSet.js is a [Bit-Array](http://en.wikipedia.org/wiki/Bit_array) implementation in JavaScript.

With this library, you can work on large bit vectors without worring about system constraints, given by integer size.

Examples
===

Basic usage
---
```javascript
var bs = new BitSet(500); // We need 500 bits
bs.set(128, 1); // Set bit at position 128
```

If you need a sanity check on your own, you could write something like:

```
if (bs.set(n, 1) !== null) {
   // Success
}
```
or

```
if (0 <= n && n < bs.size) {
   bs.set(n, 1);
   // Success
}
```


Default Value Set
---
```javascript
var bs = new BitSet(2, 1); // Set all bits initially to 1
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
var bs = new BitSet(40);
bs.flip();
bs.flip(29, 35);
var str = bs.toString("-"); // Separator every 31 bits is the dash "-"

if (str === "1111111111111111111111111100000-0011111111111111111111111111111") {
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

Available methods
===

Bitwise functions
---
**Bitwise not**
```
BitSet not(BitSet x)
```
**Bitwise and**
```
BitSet and(BitSet x)
```
**Bitwise or**
```
BitSet or(BitSet x)
```
**Bitwise nand**
```
BitSet nand(BitSet x)
```
**Bitwise nor**
```
BitSet nor(BitSet x)
```
**Bitwise xor**
```
BitSet xor(BitSet x)
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
**Check if one BitSet is subset of another**
```
boolean subsetOf(Bitset x)
```

Misc functions
---
**Overrides the toString function for a pretty representation**
```
String toString(String separator="")
```
**Create a 100% copy of the actual BitSet object**
```
BitSet clone()
```


Run a test
===
Testing the source against the shipped test suite is as easy as

```
npm test
```

Note
===
The allocated size is always a power of two minus 1! If you need 500 bits, the actual size allocated is 527 (= ceil(500 / 31)). All the additional bits are usable of course.

If you want to extend the library, please provide test cases in your commit.
