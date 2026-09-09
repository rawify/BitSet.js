import BitSet, { BitSet as NamedBitSet, type ReadOnlyBitSet } from '../../dist/bitset.mjs';

const set = new BitSet([1, 3, 5]);
const callable = BitSet('0xff');
const named = NamedBitSet(7);
const readonly: ReadOnlyBitSet = set;

void callable;
void named;
void readonly;