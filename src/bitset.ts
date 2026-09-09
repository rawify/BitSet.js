/**
 * @license BitSet v5.3.0 9/9/2026
 * https://raw.org/software/libraries/bitset-js/
 *
 * Copyright (c) 2026, Robert Eisele (https://raw.org/)
 * Licensed under the MIT license.
 **/

/**
 * The number of bits of a word
 * @const
 * @type number
 */
const WORD_LENGTH = 32;

/**
 * The log base 2 of WORD_LENGTH
 * @const
 * @type number
 */
const WORD_LOG = 5;

export type BitSetInput = string | number | number[] | Uint8Array | BitSet | ReadOnlyBitSet | null;

export interface ReadOnlyBitSet {
  and(value: BitSetInput): BitSet;
  or(value: BitSetInput): BitSet;
  xor(value: BitSetInput): BitSet;
  andNot(value: BitSetInput): BitSet;
  not(): BitSet;
  equals(value: BitSetInput): boolean;
  clone(): BitSet;
  isEmpty(): boolean;
  toString(base?: number): string;
  toArray(): number[];
  cardinality(): number;
  msb(): number;
  lsb(): number;
  ntz(): number;
  get(index: number): number;
  slice(fromIndex?: number, toIndex?: number): BitSet | null;
  [Symbol.iterator](): Iterator<number>;
}

export interface BitSet extends ReadOnlyBitSet {
  data: number[];
  _: number;
  set(index?: number, value?: number): BitSet;
  setRange(fromIndex: number, toIndex: number, value?: number | string): BitSet;
  clear(fromIndex?: number, toIndex?: number): BitSet;
  flip(fromIndex?: number, toIndex?: number): BitSet;
}

export interface BitSetConstructor {
  new(input?: BitSetInput): BitSet;
  (input?: BitSetInput): BitSet;
  prototype: BitSet;
  fromBinaryString(value: string): BitSet;
  fromHexString(value: string): BitSet;
  Random(length?: number): BitSet;
}

interface Storage {
  data: number[];
  _: number;
}

function isStorage(value: object): value is Storage {
  const storage = value as Partial<Storage>;
  return Array.isArray(storage.data) && typeof storage._ === 'number';
}


/**
 * Calculates the number of set bits in a 32-bit integer
 * Warren, H. (2009). Hacker's Delight.
 *
 * @param {number} v
 * @returns {number}
 */
function popCount(v: number): number {
  v -= ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  v = (v + (v >>> 4)) & 0x0F0F0F0F;
  return (v * 0x01010101) >>> 24;
}

/**
 * Popcount of four 32-bit ints at once (inspired by FastBitSet.hammingWeight4)
 * @param {number} v1
 * @param {number} v2
 * @param {number} v3
 * @param {number} v4
 * @returns {number}
 */
function popCount4(v1: number, v2: number, v3: number, v4: number): number {
  v1 -= (v1 >>> 1) & 0x55555555;
  v2 -= (v2 >>> 1) & 0x55555555;
  v3 -= (v3 >>> 1) & 0x55555555;
  v4 -= (v4 >>> 1) & 0x55555555;

  v1 = (v1 & 0x33333333) + ((v1 >>> 2) & 0x33333333);
  v2 = (v2 & 0x33333333) + ((v2 >>> 2) & 0x33333333);
  v3 = (v3 & 0x33333333) + ((v3 >>> 2) & 0x33333333);
  v4 = (v4 & 0x33333333) + ((v4 >>> 2) & 0x33333333);

  v1 = (v1 + (v1 >>> 4)) & 0x0F0F0F0F;
  v2 = (v2 + (v2 >>> 4)) & 0x0F0F0F0F;
  v3 = (v3 + (v3 >>> 4)) & 0x0F0F0F0F;
  v4 = (v4 + (v4 >>> 4)) & 0x0F0F0F0F;

  return ((v1 + v2 + v3 + v4) * 0x01010101) >>> 24;
}

/**
 * Divide a number in base two by B
 * Used for generic base conversion in toString for non power-of-two bases
 *
 * @param {Array<number>} arr
 * @param {number} B
 * @returns {number}
 */
function divide(arr: number[], B: number): number {
  let r = 0;
  for (let i = 0; i < arr.length; i++) {
    r = (r << 1) + arr[i];
    const d = (r / B) | 0;
    r -= d * B;
    arr[i] = d;
  }
  return r;
}

/**
 * Ensure the internal array can address bit index ndx
 * Uses '_' (MSB fill) to extend words as needed.
 *
 * @param {Object} dst
 * @param {number} ndx
 */
function scale(dst: Storage, ndx: number): void {
  const l = ndx >>> WORD_LOG; // target word index
  const d = dst.data;
  while (d.length <= l) d.push(dst._ | 0);
}

/**
 * Parses the parameters and set variable P
 *
 * @param {Object} P
 * @param {string|BitSet|Array|Uint8Array|number=} val
 */
function parse(P: Storage, val?: BitSetInput): void {

  if (val == null) {
    P.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    P._ = 0;
    return;
  }

  if (val instanceof BitSet) {
    P.data = val.data;
    P._ = val._;
    return;
  }

  if (typeof val === 'object' && isStorage(val)) {
    P.data = val.data;
    P._ = val._;
    return;
  }

  switch (typeof val) {

    case 'number':
      P.data = [val | 0];
      P._ = 0;
      break;

    case 'string': {

      let base = 2;
      let chunkLen = WORD_LENGTH;

      if (val.indexOf('0b') === 0) {
        val = val.substr(2);
      } else if (val.indexOf('0x') === 0) {
        val = val.substr(2);
        base = 16;
        chunkLen = 8;
      }

      P.data = [];
      P._ = 0;

      let a = val.length - chunkLen;
      let b = val.length;

      do {
        const num = parseInt(val.slice(a > 0 ? a : 0, b), base);
        if (isNaN(num)) {
          throw SyntaxError('Invalid param');
        }

        P.data.push(num | 0);
        if (a <= 0)
          break;
        a -= chunkLen;
        b -= chunkLen;
      } while (1);

      break;
    }

    default: {

      P.data = [0];
      const data = P.data;

      if (val instanceof Array) {

        P._ = 0;

        for (let i = val.length - 1; i >= 0; i--) {

          const ndx = val[i];
          if (ndx === Infinity) {
            P._ = ~0;
          } else {
            if (ndx < 0) throw SyntaxError('Invalid param');
            scale(P, ndx);
            data[ndx >>> WORD_LOG] |= 1 << ndx;
          }
        }
        break;
      }

      if (typeof Uint8Array !== 'undefined' && val instanceof Uint8Array) {

        const bits = 8;

        P._ = 0;
        if (val.length > 0) scale(P, val.length * bits - 1);

        for (let i = 0; i < val.length; i++) {

          const n = val[i] | 0;

          for (let j = 0; j < bits; j++) {

            const k = i * bits + j;

            data[k >>> WORD_LOG] |= ((n >>> j) & 1) << k;
          }
        }
        break;
      }
      throw SyntaxError('Invalid param');
    }
  }
}

let infinitePrototype: BitSet;

function getFinite(this: BitSet, ndx: number): number {
  return (this.data[ndx >>> WORD_LOG] >>> ndx) & 1;
}

function getInfinite(this: BitSet, ndx: number): number {
  const data = this.data;
  const word = ndx >>> WORD_LOG;
  return ((word < data.length ? data[word] : -1) >>> ndx) & 1 & ~(ndx >> 31);
}

function syncPrototype(set: BitSet): void {
  Object.setPrototypeOf(set, set._ === 0 ? BitSet.prototype : infinitePrototype);
}

/**
 * Module entry point
 *
 * @constructor
 * @param {string|BitSet|number|Array|Uint8Array=} param
 * @returns {BitSet}
 */
export const BitSet = function (this: BitSet | undefined, param?: BitSetInput): BitSet {

  if (!(this instanceof BitSet)) {
    return new BitSet(param);
  }
  parse(this, param);
  // Decouple storage — avoid sharing backing array when a BitSet was passed in
  this.data = this.data.slice();
  if (this._ !== 0) syncPrototype(this);
  return this;
} as BitSetConstructor;

/**
 * Work buffer for parse(); avoids allocations in hot paths.
 */
const P: Storage = {
  data: [], // Holds the actual bits in form of a 32bit integer array.
  _: 0      // Holds the MSB flag information to make indefinitely large bitsets inversion-proof
};

BitSet.prototype = {
  data: [],
  _: 0,

  /**
   * Set a single bit flag
   *
   * @param {number} ndx The index of the bit to be set (>=0)
   * @param {number=} value Optional value that should be set on the index (0 or 1)
   * @returns {BitSet} this
   */
  set: function (ndx?: number, value?: number): BitSet {

    if (ndx === undefined) ndx = 0;
    ndx |= 0;
    if (ndx < 0) return this;

    const data = this.data;
    const word = ndx >>> WORD_LOG;
    if (word >= data.length) {
      const fill = this._ | 0;
      for (let index = data.length; index <= word; index++) data[index] = fill;
    }

    if (value === undefined || value) {
      data[word] |= (1 << ndx);
    } else {
      data[word] &= ~(1 << ndx);
    }
    return this;
  },

  /**
   * Get a single bit flag of a certain bit position
   *
   * @param {number} ndx the index to be fetched
   * @returns {number} The binary flag
   */
  get: getFinite,

  /**
   * Creates the bitwise NOT of a set (returns a new set).
   * @returns {BitSet}
   */
  not: function (): BitSet { // invert()

    const t = this.clone();
    const d = t.data;
    for (let i = 0; i < d.length; i++) {
      d[i] = ~d[i];
    }
    t._ = ~t._;
    syncPrototype(t);
    return t;
  },

  /**
   * Bitwise AND with another set (returns a new set).
   * (Unrolled inner loop where possible; honors indefinite fill)
   * @param {BitSet|string|Array|Uint8Array|number} value
   * @returns {BitSet}
   */
  and: function (value: BitSetInput): BitSet {// intersection

    parse(P, value);

    const T = this.clone();
    const p = P.data;

    let t = T.data;
    const p_ = P._ | 0;
    const t_ = T._ | 0;

    // If this is infinite, we need all bits from P to exist
    if (t_ !== 0) {
      scale(T, p.length * WORD_LENGTH - 1);
      t = T.data;
    }

    const tl = t.length;
    const pl = p.length;

    const l = pl < tl ? pl : tl;

    // Unrolled by 8 for speed (inspired by FastBitSet)
    let i = 0;
    for (; i + 7 < l; i += 8) {
      t[i] &= p[i];
      t[i + 1] &= p[i + 1];
      t[i + 2] &= p[i + 2];
      t[i + 3] &= p[i + 3];
      t[i + 4] &= p[i + 4];
      t[i + 5] &= p[i + 5];
      t[i + 6] &= p[i + 6];
      t[i + 7] &= p[i + 7];
    }
    for (; i < l; i++) {
      t[i] &= p[i];
    }
    for (; i < tl; i++) {
      t[i] &= p_;
    }

    T._ &= p_;
    syncPrototype(T);

    return T;
  },

  /**
   * Bitwise OR with another set (returns a new set).
   * @param {BitSet|string|Array|Uint8Array|number} val
   * @returns {BitSet}
   */
  or: function (val: BitSetInput): BitSet { // union

    parse(P, val);

    const T = this.clone();
    const t = T.data;
    const p = P.data;

    const pl = p.length;

    while (t.length < pl) t.push(0);

    const length = pl;
    let i = 0;
    for (; i + 7 < length; i += 8) {
      t[i] |= p[i];
      t[i + 1] |= p[i + 1];
      t[i + 2] |= p[i + 2];
      t[i + 3] |= p[i + 3];
      t[i + 4] |= p[i + 4];
      t[i + 5] |= p[i + 5];
      t[i + 6] |= p[i + 6];
      t[i + 7] |= p[i + 7];
    }
    for (; i < length; i++) {
      t[i] |= p[i];
    }

    T._ |= P._;
    syncPrototype(T);

    return T;
  },

  /**
   * Bitwise XOR with another set (returns a new set).
   * Tail is extended with each side's fill; unrolled core.
   * @param {BitSet|string|Array|Uint8Array|number} val
   * @returns {BitSet}
   */
  xor: function (val: BitSetInput): BitSet { // symmetric difference

    parse(P, val);

    const T = this.clone();
    const t = T.data;
    const p = P.data;

    const t_ = T._ | 0;
    const p_ = P._ | 0;

    const tl = t.length;
    const pl = p.length;

    if (tl < pl) {
      for (let index = tl; index < pl; index++) t[index] = t_;
    }

    let i = 0;
    const overlap = tl < pl ? tl : pl;
    for (; i + 7 < overlap; i += 8) {
      t[i] ^= p[i];
      t[i + 1] ^= p[i + 1];
      t[i + 2] ^= p[i + 2];
      t[i + 3] ^= p[i + 3];
      t[i + 4] ^= p[i + 4];
      t[i + 5] ^= p[i + 5];
      t[i + 6] ^= p[i + 6];
      t[i + 7] ^= p[i + 7];
    }
    for (; i < overlap; i++) {
      t[i] ^= p[i];
    }
    for (; i < pl; i++) t[i] = t_ ^ p[i];
    for (; i < tl; i++) t[i] ^= p_;

    T._ ^= p_;
    syncPrototype(T);

    return T;
  },

  /**
   * AND NOT (difference): this ∧ ¬val
   * @param {BitSet|string|Array|Uint8Array|number} val
   * @returns {BitSet}
   */
  andNot: function (val: BitSetInput): BitSet { // difference

    parse(P, val);

    const T = this.clone();
    const t = T.data;
    const p = P.data;
    const t_ = T._ | 0;
    const p_ = P._ | 0;

    if (t_ !== 0 && t.length < p.length) {
      const fill = t_;
      for (let index = t.length; index < p.length; index++) t[index] = fill;
    }

    const length = t.length;
    const overlap = p.length < length ? p.length : length;
    let index = 0;
    for (; index + 7 < overlap; index += 8) {
      t[index] &= ~p[index];
      t[index + 1] &= ~p[index + 1];
      t[index + 2] &= ~p[index + 2];
      t[index + 3] &= ~p[index + 3];
      t[index + 4] &= ~p[index + 4];
      t[index + 5] &= ~p[index + 5];
      t[index + 6] &= ~p[index + 6];
      t[index + 7] &= ~p[index + 7];
    }
    for (; index < overlap; index++) t[index] &= ~p[index];
    for (; index < length; index++) t[index] &= ~p_;

    T._ = t_ & ~p_;
    syncPrototype(T);
    return T;
  },

  /**
   * Flip/Invert a single bit or a range in-place.
   *
   * @param {number=} from
   * @param {number=} to
   * @returns {BitSet} this
   */
  flip: function (from?: number, to?: number): BitSet {

    const data = this.data;

    if (from === undefined) {
      for (let i = 0; i < data.length; i++) {
        data[i] = ~data[i];
      }
      this._ = ~this._;
      syncPrototype(this);
      return this;
    }

    from |= 0;
    if (to === undefined) {
      if (from >= 0) {
        scale(this, from);
        data[from >>> WORD_LOG] ^= 1 << from;
      }
      return this;
    }

    to |= 0;
    if (from < 0 || to < from) return this;

    scale(this, to);

    const w0 = from >>> WORD_LOG;
    const w1 = to >>> WORD_LOG;

    const s = (from & (WORD_LENGTH - 1));
    const e = (to & (WORD_LENGTH - 1));

    if (w0 === w1) {
      data[w0] ^= ((~0 << s) & ((1 << (e + 1)) - 1));
      return this;
    }

    data[w0] ^= (~0 << s);

    for (let w = w0 + 1; w < w1; w++) data[w] ^= -1;

    data[w1] ^= ((1 << (e + 1)) - 1);

    return this;
  },

  /**
   * Clear a single bit or a range in-place.
   *
   * @param {number=} from
   * @param {number=} to
   * @returns {BitSet} this
   */
  clear: function (from?: number, to?: number): BitSet {

    const data = this.data;

    if (from === undefined) {
      for (let i = data.length - 1; i >= 0; i--) {
        data[i] = 0;
      }
      this._ = 0;
      syncPrototype(this);
      return this;
    }

    from |= 0;
    if (to === undefined) {
      if (from < 0) return this;
      scale(this, from);
      const w = from >>> WORD_LOG;
      data[w] &= ~(1 << from);
      return this;
    }

    to |= 0;
    if (from < 0 || to < from) return this;

    scale(this, to);

    const w0 = from >>> WORD_LOG;
    const w1 = to >>> WORD_LOG;

    const s = (from & (WORD_LENGTH - 1));
    const e = (to & (WORD_LENGTH - 1));

    if (w0 === w1) {
      data[w0] &= ~((~0 << s) & ((1 << (e + 1)) - 1));
      return this;
    }

    data[w0] &= ~(~0 << s);
    for (let w = w0 + 1; w < w1; w++) data[w] = 0;
    data[w1] &= ~((1 << (e + 1)) - 1);

    return this;
  },

  /**
   * Gets an entire range as a new bitset object
   *
   * Ex:
   * bs1 = new BitSet();
   * bs1.slice(4, 8);
   *
   * @param {number=} from The start index of the range to be get
   * @param {number=} to The end index of the range to be get (inclusive)
   * @returns {BitSet} A new smaller bitset object, containing the extracted range
   */
  slice: function (from?: number, to?: number): BitSet | null {

    if (from === undefined) {
      return this.clone();
    }

    from |= 0;

    // to omitted: replicate original behavior (to = words * 32), inclusive
    if (to === undefined) {
      const end = (this.data.length * WORD_LENGTH) | 0; // inclusive like original
      return sliceRange_(this, from, end, true);
    }

    to |= 0;

    if (from < 0 || to < from) {
      return null;
    }

    // Explicit [from..to] copy, inclusive; source beyond data uses the fill word,
    // but the result is finite, as in the original implementation.
    return sliceRange_(this, from, to, /*carryFill*/ false);

    // ----- helper (closed over BitSet + WORD_LENGTH/WORD_LOG) -----
    function sliceRange_(self: BitSet, fromN: number, toN: number, carryFill: boolean): BitSet {

      const data = self.data;
      const fillWord = self._ | 0; // 0 or -1, used when reading beyond source length
      const totalBits = (toN - fromN + 1) | 0;

      if (totalBits <= 0) {
        const im = Object.create(carryFill && self._ !== 0 ? infinitePrototype : BitSet.prototype);
        im.data = [0];
        im._ = carryFill ? (self._ | 0) : 0;
        return im;
      }

      const outWords = Math.ceil(totalBits / WORD_LENGTH) | 0;

      const im = Object.create(carryFill && self._ !== 0 ? infinitePrototype : BitSet.prototype);
      im._ = carryFill ? (self._ | 0) : 0;
      // Preallocate and zero
      const out = new Array(outWords);
      for (let i = 0; i < outWords; i++) out[i] = 0;

      const startWord = fromN >>> WORD_LOG;
      const startOff = fromN & (WORD_LENGTH - 1);

      // Build words by shifting/merging adjacent source words.
      // When reading past the end, we use fillWord (0 or -1) like the original get()/_ semantics.
      if (startOff === 0) {
        // Fast path: word-aligned copy
        let src = startWord;
        for (let ow = 0; ow < outWords; ow++, src++) {
          const lo = (src < data.length) ? (data[src] | 0) : fillWord;
          out[ow] = lo;
        }
      } else {
        let src = startWord;
        const shl = (32 - startOff) | 0;
        for (let ow = 0; ow < outWords; ow++, src++) {
          const lo = (src < data.length) ? (data[src] | 0) : fillWord;
          const hi = (src + 1 < data.length) ? (data[src + 1] | 0) : fillWord;
          // (lo >>> startOff) | (hi << (32 - startOff))
          out[ow] = ((lo >>> startOff) | (hi << shl)) | 0;
        }
      }

      // Mask the tail word to keep exactly totalBits bits
      const rem = totalBits & (WORD_LENGTH - 1);
      if (rem !== 0) {
        out[outWords - 1] &= ((1 << rem) - 1);
      }

      im.data = out;
      return im;
    }
  },

  /**
   * Set a range of bits to 0 or 1 in-place.
   *
   * @param {number} from
   * @param {number} to
   * @param {number=} value (0 or 1)
   * @returns {BitSet} this
   */
  setRange: function (from: number, to: number, value?: number | string): BitSet {

    from |= 0; to |= 0;
    if (from < 0 || to < from) return this;

    const setToOne = (value === undefined || value);

    scale(this, to);

    const data = this.data;
    const w0 = from >>> WORD_LOG, w1 = to >>> WORD_LOG;
    const s = (from & 31), e = (to & 31);

    if (w0 === w1) {
      const m = ((~0 << s) & ((1 << (e + 1)) - 1));
      if (setToOne) data[w0] |= m; else data[w0] &= ~m;
      return this;
    }

    if (setToOne) {
      data[w0] |= (~0 << s);
      for (let w = w0 + 1; w < w1; w++) data[w] = -1;
      data[w1] |= ((1 << (e + 1)) - 1);
    } else {
      data[w0] &= ~(~0 << s);
      for (let w = w0 + 1; w < w1; w++) data[w] = 0;
      data[w1] &= ~((1 << (e + 1)) - 1);
    }
    return this;
  },

  /**
   * Clones the actual object
   * @returns {BitSet}
   */
  clone: function (): BitSet {

    const im = /** @type {BitSet} */ (Object.create(this._ === 0 ? BitSet.prototype : infinitePrototype));
    im.data = this.data.slice();
    im._ = this._;

    return im;
  },

  /**
   * Gets a list of set bits (ascending). Keeps Infinity sentinel if indefinite.
   * Uses lowbit iteration like FastBitSet for speed.
   *
   * @returns {Array}
   */
  toArray: function (): number[] {

    const data = this.data;

    // Pre-size roughly: sum popcounts via 4-wide blocks for fewer resizes
    let est = 0;
    let i = 0;
    const n = data.length;
    for (; i + 3 < n; i += 4) est += popCount4(data[i] | 0, data[i + 1] | 0, data[i + 2] | 0, data[i + 3] | 0);
    for (; i < n; i++) est += popCount(data[i] | 0);

    const ret = new Array(est + (this._ !== 0 ? 1 : 0));
    let pos = 0;

    for (let k = 0; k < n; ++k) {
      let w = data[k] | 0;
      while (w !== 0) {
        const t = w & -w; // lowest set bit
        ret[pos++] = (k * WORD_LENGTH) + popCount((t - 1) >>> 0);
        w ^= t;
      }
    }

    if (this._ !== 0) ret[pos++] = Infinity;

    // If our estimate was high due to concurrent changes (shouldn't happen), trim
    if (pos !== ret.length) ret.length = pos;

    return ret;
  },

  /**
   * Overrides the toString method to get a representation in the given base (2..36)
   *
   * @param {number=} base
   * @returns string
   */
  toString: function (base?: number): string {

    const data = this.data;

    base = (base ?? 0) | 0;
    if (!base) base = 2;

    // If base is power of two and < 36
    if ((base & (base - 1)) === 0 && 1 < base && base < 36) {

      let ret = '';
      // digits per 32-bit word at given base (ceil)
      let digits = (32 / (Math.log(base) / Math.LN2)) | 0;
      if ((digits * Math.log(base) / Math.LN2) < 32) digits++;

      for (let i = data.length - 1; i >= 0; i--) {

        const cur = data[i] >>> 0; // unsigned

        const tmp = cur.toString(base);

        if (ret !== '') {
          const pad = digits - tmp.length;
          if (pad > 0) ret += '0'.repeat(pad);
        }
        ret += tmp;
      }

      if (this._ === 0) {

        ret = ret.replace(/^0+/, '');

        if (ret === '')
          ret = '0';
        return ret;

      } else {
        // Pad the string with ones
        ret = '1111' + ret;
        return ret.replace(/^1+/, '...1111');
      }

    } else {

      if (2 > base || base > 36)
        throw SyntaxError('Invalid base');

      const ret: string[] = [];
      const arr: number[] = [];

      // Copy every single bit to a new array (MSB → LSB)
      for (let i = data.length - 1; i >= 0; i--) {
        const word = data[i] >>> 0;
        for (let j = WORD_LENGTH - 1; j >= 0; j--) {
          arr.push((word >>> j) & 1);
        }
      }

      // Remove leading zeros in bit array
      while (arr.length && arr[0] === 0)
        arr.shift();

      if (arr.length === 0)
        return this._ ? '...1111' : '0';

      do {
        ret.unshift(divide(arr, base).toString(base));
      } while (!arr.every(function (x) { return x === 0; }));

      return ret.join('');
    }
  },

  /**
   * Check if the BitSet is empty, means all bits are unset (and finite)
   * @returns {boolean}
   */
  isEmpty: function (): boolean {

    if (this._ !== 0)
      return false;

    const d = this.data;

    for (let i = d.length - 1; i >= 0; i--) {
      if (d[i] !== 0)
        return false;
    }
    return true;
  },

  /**
   * Calculates the number of bits set (∞ if indefinite)
   *
   * @returns {number}
   */
  cardinality: function (): number {

    if (this._ !== 0) return Infinity;

    const d = this.data;
    let s = 0;

    // 4-wide popcount for throughput (idea from FastBitSet)
    let i = 0;
    const n = d.length;
    for (; i + 3 < n; i += 4) {
      s += popCount4(d[i] | 0, d[i + 1] | 0, d[i + 2] | 0, d[i + 3] | 0);
    }
    for (; i < n; i++) {
      const v = d[i] | 0;
      if (v !== 0) s += popCount(v);
    }
    return s;
  },

  /**
   * Calculates the Most Significant Bit / log base two
   *
   * @returns {number} The index of the highest bit set
   */
  msb: Math.clz32 ?
    function (this: BitSet): number {

      if (this._ !== 0) return Infinity;

      const data = this.data;

      for (let i = data.length; i-- > 0;) {

        const c = Math.clz32(data[i] | 0);

        if (c !== WORD_LENGTH) {
          return (i * WORD_LENGTH) + WORD_LENGTH - 1 - c;
        }
      }
      return Infinity;
    } :
    function (this: BitSet): number {

      if (this._ !== 0) return Infinity;

      const data = this.data;

      for (let i = data.length; i-- > 0;) {

        let v = data[i] | 0;
        if (v) {
          let c = 31;
          while ((v >>> c) === 0) c--;
          return (i * WORD_LENGTH) + c;
        }
      }
      return Infinity;
    },

  /**
   * Calculates the number of trailing zeros (index of lowest set bit)
   * @returns {number}
   */
  ntz: function (): number {

    const data = this.data;

    for (let j = 0; j < data.length; j++) {
      let v = data[j] | 0;

      if (v !== 0) {
        v = (v ^ (v - 1)) >>> 1; // Set trailing 0s to 1s and zero rest
        return (j * WORD_LENGTH) + popCount(v);
      }
    }
    return Infinity;
  },

  /**
   * Calculates the Least Significant Bit (like ntz; returns 1/0 for indefinite)
   * @returns {number}
   */
  lsb: function (): number {

    const data = this.data;

    for (let i = 0; i < data.length; i++) {

      const v = data[i] | 0;

      if (v) {
        const t = v & -v;
        return (i * WORD_LENGTH) + popCount((t - 1) >>> 0);
      }
    }
    return this._ & 1;
  },

  /**
   * Compares two BitSet objects (valid for indefinite sets as well)
   *
   * @param {BitSet|string|Array|Uint8Array|number} val
   * @returns {boolean}
   */
  equals: function (val: BitSetInput): boolean {

    parse(P, val);

    const t = this.data;
    const p = P.data;

    const t_ = this._ | 0;
    const p_ = P._ | 0;

    let tl = t.length - 1;
    let pl = p.length - 1;

    if (p_ !== t_) return false;

    const minLength = tl < pl ? tl : pl;
    let i = 0;

    for (; i <= minLength; i++) {
      if (t[i] !== p[i])
        return false;
    }

    for (i = tl; i > pl; i--) {
      if (t[i] !== p_)
        return false;
    }

    for (i = pl; i > tl; i--) {
      if (p[i] !== t_)
        return false;
    }
    return true;
  },

  /**
   * ES6 iterator over bits (0/1), starting at bit 0.
   * Finite sets stop at msb(); indefinite sets produce endless 1s after data.
   */
  [Symbol.iterator]: function (): Iterator<number> {

    const self = this;
    const d = self.data;
    const infinite = (self._ !== 0);

    if (!infinite) {
      const hi = self.msb(); // Infinity if empty
      if (hi === Infinity) {
        return {
          next: function () { return { done: true, value: undefined }; }
        };
      }
      let ndx = 0;
      return {
        next: function () {
          if (ndx > hi) return { done: true, value: undefined };
          const w = ndx >>> WORD_LOG;
          const bit = (d[w] >>> (ndx & 31)) & 1;
          ndx++;
          return { done: false, value: bit };
        }
      };
    }

    // Endless iterator (indefinite ones)
    let n = 0;
    return {
      next: function () {
        const w = n >>> WORD_LOG;
        const bit = (w < d.length) ? ((d[w] >>> (n & 31)) & 1) : 1;
        n++;
        return { done: false, value: bit };
      }
    };
  }
};

infinitePrototype = Object.create(BitSet.prototype) as BitSet;
infinitePrototype.get = getInfinite;

BitSet.fromBinaryString = function (str: string): BitSet {

  return new BitSet('0b' + str);
};

BitSet.fromHexString = function (str: string): BitSet {

  return new BitSet('0x' + str);
};

BitSet.Random = function (n?: number): BitSet {

  if (n === undefined || n < 0) {
    n = WORD_LENGTH;
  }

  const m = n % WORD_LENGTH;

  // Create an array, large enough to hold the random bits
  const t = [];
  const len = Math.ceil(n / WORD_LENGTH);

  // Create a bitset instance
  const s = Object.create(BitSet.prototype);

  // Fill the vector with random data, uniformly distributed
  for (let i = 0; i < len; i++) {
    t.push((Math.random() * 4294967296) | 0);
  }

  // Mask out unwanted bits
  if (m > 0) {
    t[len - 1] &= (1 << m) - 1;
  }

  s.data = t;
  s._ = 0;
  return s;
};

export default BitSet;
