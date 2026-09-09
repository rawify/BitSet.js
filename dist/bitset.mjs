// src/bitset.ts
/**
 * @license BitSet v5.3.0 9/9/2026
 * https://raw.org/software/libraries/bitset-js/
 *
 * Copyright (c) 2026, Robert Eisele (https://raw.org/)
 * Licensed under the MIT license.
 **/
var WORD_LENGTH = 32;
var WORD_LOG = 5;
function isStorage(value) {
  const storage = value;
  return Array.isArray(storage.data) && typeof storage._ === "number";
}
function popCount(v) {
  v -= v >>> 1 & 1431655765;
  v = (v & 858993459) + (v >>> 2 & 858993459);
  v = v + (v >>> 4) & 252645135;
  return v * 16843009 >>> 24;
}
function popCount4(v1, v2, v3, v4) {
  v1 -= v1 >>> 1 & 1431655765;
  v2 -= v2 >>> 1 & 1431655765;
  v3 -= v3 >>> 1 & 1431655765;
  v4 -= v4 >>> 1 & 1431655765;
  v1 = (v1 & 858993459) + (v1 >>> 2 & 858993459);
  v2 = (v2 & 858993459) + (v2 >>> 2 & 858993459);
  v3 = (v3 & 858993459) + (v3 >>> 2 & 858993459);
  v4 = (v4 & 858993459) + (v4 >>> 2 & 858993459);
  v1 = v1 + (v1 >>> 4) & 252645135;
  v2 = v2 + (v2 >>> 4) & 252645135;
  v3 = v3 + (v3 >>> 4) & 252645135;
  v4 = v4 + (v4 >>> 4) & 252645135;
  return (v1 + v2 + v3 + v4) * 16843009 >>> 24;
}
function divide(arr, B) {
  let r = 0;
  for (let i = 0; i < arr.length; i++) {
    r = (r << 1) + arr[i];
    const d = r / B | 0;
    r -= d * B;
    arr[i] = d;
  }
  return r;
}
function scale(dst, ndx) {
  const l = ndx >>> WORD_LOG;
  const d = dst.data;
  while (d.length <= l) d.push(dst._ | 0);
}
function parse(P2, val) {
  if (val == null) {
    P2.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    P2._ = 0;
    return;
  }
  if (val instanceof BitSet) {
    P2.data = val.data;
    P2._ = val._;
    return;
  }
  if (typeof val === "object" && isStorage(val)) {
    P2.data = val.data;
    P2._ = val._;
    return;
  }
  switch (typeof val) {
    case "number":
      P2.data = [val | 0];
      P2._ = 0;
      break;
    case "string": {
      let base = 2;
      let chunkLen = WORD_LENGTH;
      if (val.indexOf("0b") === 0) {
        val = val.substr(2);
      } else if (val.indexOf("0x") === 0) {
        val = val.substr(2);
        base = 16;
        chunkLen = 8;
      }
      P2.data = [];
      P2._ = 0;
      let a = val.length - chunkLen;
      let b = val.length;
      do {
        const num = parseInt(val.slice(a > 0 ? a : 0, b), base);
        if (isNaN(num)) {
          throw SyntaxError("Invalid param");
        }
        P2.data.push(num | 0);
        if (a <= 0)
          break;
        a -= chunkLen;
        b -= chunkLen;
      } while (1);
      break;
    }
    default: {
      P2.data = [0];
      const data = P2.data;
      if (val instanceof Array) {
        P2._ = 0;
        for (let i = val.length - 1; i >= 0; i--) {
          const ndx = val[i];
          if (ndx === Infinity) {
            P2._ = ~0;
          } else {
            if (ndx < 0) throw SyntaxError("Invalid param");
            scale(P2, ndx);
            data[ndx >>> WORD_LOG] |= 1 << ndx;
          }
        }
        break;
      }
      if (typeof Uint8Array !== "undefined" && val instanceof Uint8Array) {
        const bits = 8;
        P2._ = 0;
        if (val.length > 0) scale(P2, val.length * bits - 1);
        for (let i = 0; i < val.length; i++) {
          const n = val[i] | 0;
          for (let j = 0; j < bits; j++) {
            const k = i * bits + j;
            data[k >>> WORD_LOG] |= (n >>> j & 1) << k;
          }
        }
        break;
      }
      throw SyntaxError("Invalid param");
    }
  }
}
var infinitePrototype;
function getFinite(ndx) {
  return this.data[ndx >>> WORD_LOG] >>> ndx & 1;
}
function getInfinite(ndx) {
  const data = this.data;
  const word = ndx >>> WORD_LOG;
  return (word < data.length ? data[word] : -1) >>> ndx & 1 & ~(ndx >> 31);
}
function syncPrototype(set) {
  Object.setPrototypeOf(set, set._ === 0 ? BitSet.prototype : infinitePrototype);
}
var BitSet = function(param) {
  if (!(this instanceof BitSet)) {
    return new BitSet(param);
  }
  parse(this, param);
  this.data = this.data.slice();
  if (this._ !== 0) syncPrototype(this);
  return this;
};
var P = {
  data: [],
  // Holds the actual bits in form of a 32bit integer array.
  _: 0
  // Holds the MSB flag information to make indefinitely large bitsets inversion-proof
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
  set: function(ndx, value) {
    if (ndx === void 0) ndx = 0;
    ndx |= 0;
    if (ndx < 0) return this;
    const data = this.data;
    const word = ndx >>> WORD_LOG;
    if (word >= data.length) {
      const fill = this._ | 0;
      for (let index = data.length; index <= word; index++) data[index] = fill;
    }
    if (value === void 0 || value) {
      data[word] |= 1 << ndx;
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
  not: function() {
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
  and: function(value) {
    parse(P, value);
    const T = this.clone();
    const p = P.data;
    let t = T.data;
    const p_ = P._ | 0;
    const t_ = T._ | 0;
    if (t_ !== 0) {
      scale(T, p.length * WORD_LENGTH - 1);
      t = T.data;
    }
    const tl = t.length;
    const pl = p.length;
    const l = pl < tl ? pl : tl;
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
  or: function(val) {
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
  xor: function(val) {
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
  andNot: function(val) {
    parse(P, val);
    const T = this.clone();
    const t = T.data;
    const p = P.data;
    const t_ = T._ | 0;
    const p_ = P._ | 0;
    if (t_ !== 0 && t.length < p.length) {
      const fill = t_;
      for (let index2 = t.length; index2 < p.length; index2++) t[index2] = fill;
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
  flip: function(from, to) {
    const data = this.data;
    if (from === void 0) {
      for (let i = 0; i < data.length; i++) {
        data[i] = ~data[i];
      }
      this._ = ~this._;
      syncPrototype(this);
      return this;
    }
    from |= 0;
    if (to === void 0) {
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
    const s = from & WORD_LENGTH - 1;
    const e = to & WORD_LENGTH - 1;
    if (w0 === w1) {
      data[w0] ^= ~0 << s & (1 << e + 1) - 1;
      return this;
    }
    data[w0] ^= ~0 << s;
    for (let w = w0 + 1; w < w1; w++) data[w] ^= -1;
    data[w1] ^= (1 << e + 1) - 1;
    return this;
  },
  /**
   * Clear a single bit or a range in-place.
   *
   * @param {number=} from
   * @param {number=} to
   * @returns {BitSet} this
   */
  clear: function(from, to) {
    const data = this.data;
    if (from === void 0) {
      for (let i = data.length - 1; i >= 0; i--) {
        data[i] = 0;
      }
      this._ = 0;
      syncPrototype(this);
      return this;
    }
    from |= 0;
    if (to === void 0) {
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
    const s = from & WORD_LENGTH - 1;
    const e = to & WORD_LENGTH - 1;
    if (w0 === w1) {
      data[w0] &= ~(~0 << s & (1 << e + 1) - 1);
      return this;
    }
    data[w0] &= ~(~0 << s);
    for (let w = w0 + 1; w < w1; w++) data[w] = 0;
    data[w1] &= ~((1 << e + 1) - 1);
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
  slice: function(from, to) {
    if (from === void 0) {
      return this.clone();
    }
    from |= 0;
    if (to === void 0) {
      const end = this.data.length * WORD_LENGTH | 0;
      return sliceRange_(this, from, end, true);
    }
    to |= 0;
    if (from < 0 || to < from) {
      return null;
    }
    return sliceRange_(
      this,
      from,
      to,
      /*carryFill*/
      false
    );
    function sliceRange_(self, fromN, toN, carryFill) {
      const data = self.data;
      const fillWord = self._ | 0;
      const totalBits = toN - fromN + 1 | 0;
      if (totalBits <= 0) {
        const im2 = Object.create(carryFill && self._ !== 0 ? infinitePrototype : BitSet.prototype);
        im2.data = [0];
        im2._ = carryFill ? self._ | 0 : 0;
        return im2;
      }
      const outWords = Math.ceil(totalBits / WORD_LENGTH) | 0;
      const im = Object.create(carryFill && self._ !== 0 ? infinitePrototype : BitSet.prototype);
      im._ = carryFill ? self._ | 0 : 0;
      const out = new Array(outWords);
      for (let i = 0; i < outWords; i++) out[i] = 0;
      const startWord = fromN >>> WORD_LOG;
      const startOff = fromN & WORD_LENGTH - 1;
      if (startOff === 0) {
        let src = startWord;
        for (let ow = 0; ow < outWords; ow++, src++) {
          const lo = src < data.length ? data[src] | 0 : fillWord;
          out[ow] = lo;
        }
      } else {
        let src = startWord;
        const shl = 32 - startOff | 0;
        for (let ow = 0; ow < outWords; ow++, src++) {
          const lo = src < data.length ? data[src] | 0 : fillWord;
          const hi = src + 1 < data.length ? data[src + 1] | 0 : fillWord;
          out[ow] = lo >>> startOff | hi << shl | 0;
        }
      }
      const rem = totalBits & WORD_LENGTH - 1;
      if (rem !== 0) {
        out[outWords - 1] &= (1 << rem) - 1;
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
  setRange: function(from, to, value) {
    from |= 0;
    to |= 0;
    if (from < 0 || to < from) return this;
    const setToOne = value === void 0 || value;
    scale(this, to);
    const data = this.data;
    const w0 = from >>> WORD_LOG, w1 = to >>> WORD_LOG;
    const s = from & 31, e = to & 31;
    if (w0 === w1) {
      const m = ~0 << s & (1 << e + 1) - 1;
      if (setToOne) data[w0] |= m;
      else data[w0] &= ~m;
      return this;
    }
    if (setToOne) {
      data[w0] |= ~0 << s;
      for (let w = w0 + 1; w < w1; w++) data[w] = -1;
      data[w1] |= (1 << e + 1) - 1;
    } else {
      data[w0] &= ~(~0 << s);
      for (let w = w0 + 1; w < w1; w++) data[w] = 0;
      data[w1] &= ~((1 << e + 1) - 1);
    }
    return this;
  },
  /**
   * Clones the actual object
   * @returns {BitSet}
   */
  clone: function() {
    const im = (
      /** @type {BitSet} */
      Object.create(this._ === 0 ? BitSet.prototype : infinitePrototype)
    );
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
  toArray: function() {
    const data = this.data;
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
        const t = w & -w;
        ret[pos++] = k * WORD_LENGTH + popCount(t - 1 >>> 0);
        w ^= t;
      }
    }
    if (this._ !== 0) ret[pos++] = Infinity;
    if (pos !== ret.length) ret.length = pos;
    return ret;
  },
  /**
   * Overrides the toString method to get a representation in the given base (2..36)
   *
   * @param {number=} base
   * @returns string
   */
  toString: function(base) {
    const data = this.data;
    base = (base != null ? base : 0) | 0;
    if (!base) base = 2;
    if ((base & base - 1) === 0 && 1 < base && base < 36) {
      let ret = "";
      let digits = 32 / (Math.log(base) / Math.LN2) | 0;
      if (digits * Math.log(base) / Math.LN2 < 32) digits++;
      for (let i = data.length - 1; i >= 0; i--) {
        const cur = data[i] >>> 0;
        const tmp = cur.toString(base);
        if (ret !== "") {
          const pad = digits - tmp.length;
          if (pad > 0) ret += "0".repeat(pad);
        }
        ret += tmp;
      }
      if (this._ === 0) {
        ret = ret.replace(/^0+/, "");
        if (ret === "")
          ret = "0";
        return ret;
      } else {
        ret = "1111" + ret;
        return ret.replace(/^1+/, "...1111");
      }
    } else {
      if (2 > base || base > 36)
        throw SyntaxError("Invalid base");
      const ret = [];
      const arr = [];
      for (let i = data.length - 1; i >= 0; i--) {
        const word = data[i] >>> 0;
        for (let j = WORD_LENGTH - 1; j >= 0; j--) {
          arr.push(word >>> j & 1);
        }
      }
      while (arr.length && arr[0] === 0)
        arr.shift();
      if (arr.length === 0)
        return this._ ? "...1111" : "0";
      do {
        ret.unshift(divide(arr, base).toString(base));
      } while (!arr.every(function(x) {
        return x === 0;
      }));
      return ret.join("");
    }
  },
  /**
   * Check if the BitSet is empty, means all bits are unset (and finite)
   * @returns {boolean}
   */
  isEmpty: function() {
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
  cardinality: function() {
    if (this._ !== 0) return Infinity;
    const d = this.data;
    let s = 0;
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
  msb: Math.clz32 ? function() {
    if (this._ !== 0) return Infinity;
    const data = this.data;
    for (let i = data.length; i-- > 0; ) {
      const c = Math.clz32(data[i] | 0);
      if (c !== WORD_LENGTH) {
        return i * WORD_LENGTH + WORD_LENGTH - 1 - c;
      }
    }
    return Infinity;
  } : function() {
    if (this._ !== 0) return Infinity;
    const data = this.data;
    for (let i = data.length; i-- > 0; ) {
      let v = data[i] | 0;
      if (v) {
        let c = 31;
        while (v >>> c === 0) c--;
        return i * WORD_LENGTH + c;
      }
    }
    return Infinity;
  },
  /**
   * Calculates the number of trailing zeros (index of lowest set bit)
   * @returns {number}
   */
  ntz: function() {
    const data = this.data;
    for (let j = 0; j < data.length; j++) {
      let v = data[j] | 0;
      if (v !== 0) {
        v = (v ^ v - 1) >>> 1;
        return j * WORD_LENGTH + popCount(v);
      }
    }
    return Infinity;
  },
  /**
   * Calculates the Least Significant Bit (like ntz; returns 1/0 for indefinite)
   * @returns {number}
   */
  lsb: function() {
    const data = this.data;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] | 0;
      if (v) {
        const t = v & -v;
        return i * WORD_LENGTH + popCount(t - 1 >>> 0);
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
  equals: function(val) {
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
  [Symbol.iterator]: function() {
    const self = this;
    const d = self.data;
    const infinite = self._ !== 0;
    if (!infinite) {
      const hi = self.msb();
      if (hi === Infinity) {
        return {
          next: function() {
            return { done: true, value: void 0 };
          }
        };
      }
      let ndx = 0;
      return {
        next: function() {
          if (ndx > hi) return { done: true, value: void 0 };
          const w = ndx >>> WORD_LOG;
          const bit = d[w] >>> (ndx & 31) & 1;
          ndx++;
          return { done: false, value: bit };
        }
      };
    }
    let n = 0;
    return {
      next: function() {
        const w = n >>> WORD_LOG;
        const bit = w < d.length ? d[w] >>> (n & 31) & 1 : 1;
        n++;
        return { done: false, value: bit };
      }
    };
  }
};
infinitePrototype = Object.create(BitSet.prototype);
infinitePrototype.get = getInfinite;
BitSet.fromBinaryString = function(str) {
  return new BitSet("0b" + str);
};
BitSet.fromHexString = function(str) {
  return new BitSet("0x" + str);
};
BitSet.Random = function(n) {
  if (n === void 0 || n < 0) {
    n = WORD_LENGTH;
  }
  const m = n % WORD_LENGTH;
  const t = [];
  const len = Math.ceil(n / WORD_LENGTH);
  const s = Object.create(BitSet.prototype);
  for (let i = 0; i < len; i++) {
    t.push(Math.random() * 4294967296 | 0);
  }
  if (m > 0) {
    t[len - 1] &= (1 << m) - 1;
  }
  s.data = t;
  s._ = 0;
  return s;
};
var bitset_default = BitSet;
export {
  BitSet,
  bitset_default as default
};
//# sourceMappingURL=bitset.mjs.map
