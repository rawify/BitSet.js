import BitSet = require('../../dist/bitset.js');

const set: BitSet.BitSet = BitSet([1, 3, 5]);
const constructed = new BitSet('0xff');
const count: number = set.or(constructed).cardinality();
set.clear(3).setRange(8, 12).flip(9);

void count;