import type { BitSet as BitSetType, BitSetConstructor, BitSetInput, ReadOnlyBitSet } from './bitset.d.mts';

declare const BitSet: BitSetConstructor;

declare namespace BitSet {
  type BitSet = BitSetType;
  type Constructor = BitSetConstructor;
  type Input = BitSetInput;
  type ReadOnly = ReadOnlyBitSet;
}

export = BitSet;
