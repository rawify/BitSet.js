/**
 * @license BitSet.js v4.0.0 14/08/2015
 * http://www.xarg.org/2014/03/javascript-bit-array/
 *
 * Copyright (c) 2016, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
(function(root) {

  "use strict";

  /**
   * Whether BitSet should work in mutable or immutable mode
   * 
   * @const
   * @type boolean
   */
  const MUTABLE = true;

  /**
   * Calculates the number of set bits
   * 
   * @param {number} v
   */
  function popCount(v) { // DONE

    // Warren, H. (2009). Hacker`s Delight. New York, NY: Addison-Wesley

    v-= ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    return (((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24);
  };

  /**
   * Divide a number in base two by B
   *
   * @param {Array} arr
   * @param {number} B
   * @returns {number}
   */
  function divide(arr, B) { // DONE

    let r = 0;
    let d;
    let i = 0

    for (; i < arr.length; i++) {
      r*= 2;
      d = (arr[i] + r) / B | 0;
      r = (arr[i] + r) % B;
      arr[i] = d;
    }
    return r;
  }

  /**
   * Parses the parameters and set variable P
   *
   * @param {Object} P
   * @param {string|BitSet|number=} val
   */
  function parse(P, val) { // DONE

    if (val == null) {
      P['data'] = [];
      P['_'] = 0;
      return;
    }

    if (val instanceof BitSet) {
      P['data'] = val['data'].slice();
      P['_'] = val['_'];
      return;
    }

    switch (typeof val) {

      case 'number':
        P['data'] = [val | 0];
        P['_'] = 0;
        break;

      case 'string':

        let base = 2;
        let len = 32;

        if (val.indexOf('0b') === 0) {
          val = val.substr(2);
        } else if (val.indexOf('0x') === 0) {
          val = val.substr(2);
          base = 16;
          len = 8;
        }

        P['data'] = [];
        P['_'] = 0;

        let a = val.length - len;
        let b = val.length;

        do {

          let num = parseInt(val.slice(Math.max(0, a), b), base);

          if (isNaN(num)) {
            throw SyntaxError('Invalid param');
          }

          P['data'].push(num |  0);

          if (a <= 0)
            break;

          a -= len;
          b -= len;
        } while (1);

        break;

      default:
        throw SyntaxError('Invalid param');
    }
  }

  /**
   * Module entry point
   *
   * @constructor
   * @param {string|BitSet|number=} param
   * @returns {BitSet}
   */
  function BitSet(param) { // DONE

    if (!(this instanceof BitSet)) {
      return new BitSet(param);
    }

    parse(this, param);
  }

  function set(dst, ndx) { // DONE
    dst['data'][ndx >>> 5] |= 1 << ndx;
  }

  function clear(dst, ndx) { // DONE
    dst['data'][ndx >>> 5] &= ~(1 << ndx);
  }

  function scale(dst, ndx) { // DONE

    let l = ndx >>> 5;
    let d = dst['data'];
    let v = dst['_'];

    for (let i = d.length; i <= l; i++) {
      d[i]  = v;
    }
  }

  function copyAndScale(dst, src, ndx) { // DONE

    dst['_'] = src['_'];

    let s = src['data'];
    let d = dst['data'];
    let v = src['_'];

    for (let i = Math.max(src.length, ndx >>> 5); i >= 0; i--) {
      d[i] = s[i] || v;
    }
  }

  let P = {
    'data': [],
    '_': 0
  };

  BitSet.prototype = {
    '_': 0,
    'data': [],

    /**
     * Set a single bit flag
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.set(3, 1);
     *
     * @param {number|BitSet|string} ndx The index of the bit to be set
     * @param {number=} value Optional value that should be set on the index (0 or 1)
     * @returns {BitSet} this
     */
    'set': MUTABLE ?
      function(ndx, value) { // DONE

        // if the param is a string value like "0x2113"
        if (typeof ndx === "string") {
          parse(P, ndx);
          this['data'] = P['data'].slice();
          this['_'] = P['_'];
          return this;
        }

        // if the param is another bitset
        if (ndx instanceof BitSet) {
          this['data'] = ndx['data'].slice();
          this['_'] = ndx['_'];
          return this;
        }

        scale(this, ndx);

        if (value === undefined || value === 1) {
          set(this, ndx);
        } else {
          clear(this, ndx);
        }
        return this;

      } : function(ndx, v) { // DONE

        if (typeof ndx === "string") {
          return new BitSet(ndx);
        }

        const im = new BitSet;

        if (ndx instanceof BitSet) {
          im['data'] = ndx['data'].slice();
          im['_'] = ndx['_'];
          return im;
        }

        copyAndScale(im, this, ndx);

        if (v === undefined || v === 1) {
          set(im, ndx);
        } else {
          clear(im, ndx);
        }
        return im;
      },
 
    /**
     * Get a single bit flag of a certain bit position
     *
     * Ex:
     * bs1 = new BitSet();
     * var isValid = bs1.get(12);
     *
     * @param {number} ndx the index to be fetched
     * @returns {number|null} The binary flag
     */
    'get': function(ndx) { // DONE
      return ((this['data'][ndx >>> 5] || this['_']) >>> ndx) & 1;
    },
    
    /**
     * Creates the bitwise AND of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.and(bs2);
     *
     * @param {BitSet} value A bitset object
     * @returns {BitSet} this
     */
    'and': MUTABLE ?
      function(value) { // DONE

        parse(P, value);

        let t = this['data'];
        let p = P['data'];
        let d;

        if (t.length > p.length) {
          d = P['_'];
          this['data'] = t.map((v, i) => v & (p[i] || d));
        } else {
          d = this['_'];
          this['data'] = p.map((v, i) => v & (t[i] || d));
        }
        this['_'] = P['_'] & this['_'];

        return this;
      } : function(value) { // DONE

        parse(P, value);

        const ret = new BitSet;

        let t = this['data'];
        let p = P['data'];
        let d;

        if (t.length > p.length) {
          d = P['_'];
          ret['data'] = t.map((v, i) => v & (p[i] || d));
        } else {
          d = this['_'];
          ret['data'] = p.map((v, i) => v & (t[i] || d));
        }
        ret['_'] = P['_'] & this['_'];

        return ret;
      },
      
    /**
     * Creates the bitwise OR of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.or(bs2);
     *
     * @param {BitSet} val A bitset object
     * @returns {BitSet} this
     */
    'or': MUTABLE ?
      function(val) { // DONE

        parse(P, val);

        let t = this['data'];
        let p = P['data'];
        let d;

        if (t.length > p.length) {
          d = P['_'];
          this['data'] = t.map((v, i) => v | (p[i] || d));
        } else {
          d = this['_'];
          this['data'] = p.map((v, i) => v | (t[i] || d));
        }
        this['_'] = P['_'] | this['_'];

        return this;
      } : function(val) { // DONE

        parse(P, val);

        const ret = new BitSet;

        let t = this['data'];
        let p = P['data'];
        let d;

        if (t.length > p.length) {
          d = P['_'];
          ret['data'] = t.map((v, i) => v | (p[i] || d));
        } else {
          d = this['_'];
          ret['data'] = p.map((v, i) => v | (t[i] || d));
        }
        ret['_'] = P['_'] | this['_'];

        return ret;
      },
      
    /**
     * Creates the bitwise XOR of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.xor(bs2);
     *
     * @param {BitSet} val A bitset object
     * @returns {BitSet} this
     */
    'xor': MUTABLE ?
      function(val) {

        parse(P, val);

        let t = this['data'];
        let p = P['data'];
        let d;

        if (t.length > p.length) {
          d = P['_'];
          this['data'] = t.map((v, i) => v ^ (p[i] || d));
        } else {
          d = this['_'];
          this['data'] = p.map((v, i) => v ^ (t[i] || d));
        }
        this['_'] = P['_'] ^ this['_'];

        return this;
      } : function(val) {

        parse(P, val);

        const ret = new BitSet;

        let t = this['data'];
        let p = P['data'];
        let d;

        if (t.length > p.length) {
          d = P['_'];
          ret['data'] = t.map((v, i) => v ^ (p[i] || d));
        } else {
          d = this['_'];
          ret['data'] = p.map((v, i) => v ^ (t[i] || d));
        }
        ret['_'] = P['_'] ^ this['_'];

        return ret;
      },
      
    /**
     * Creates the bitwise NOT of a set. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.not();
     *
     * @returns {BitSet} this
     */
    'not': MUTABLE ?
      function() {

        this['_'] = ~this['_'];
        this['data'] = this['data'].map(x => ~x);
        return this;
      } : function() {

        const im = new BitSet;
        im['_'] = ~this['_'];

        this['data'].forEach((v, i) => {
          im[i] = ~v;
        });
        return im;
      },
      
    /**
     * Clones the actual object
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = bs1.clone();
     *
     * @returns {BitSet} A new BitSet object, containing a copy of the actual object
     */
    'clone': function() {
      return new BitSet(this);
    },
    /**
     * Gets a list of set bits
     * 
     * @returns {Array|number}
     */
    'toArray': Math['clz32'] ?
      function() {

        if (this['_'] !== 0)
          return Infinity;

        let ret = [];
        let data = this['data'];

        for (let i = data.length; i-- > 0;) {

          let num = data[i];

          while (num !== 0) {
            let t = 31 - Math['clz32'](num);
            num ^= 1 << t;
            ret.unshift((i * 32) + t);
          }
        }
        return ret;
      } : function() {

        if (this['_'] !== 0)
          return Infinity;

        let ret = [];
        let data = this['data'];

        for (let i = 0; i < data.length; i++) {

          let num = data[i];

          while (num !== 0) {
            let t = num & -num;
            num ^= t;
            ret.push((i * 32) + popCount(t - 1));
          }
        }
        return ret;
      },
    /**
     * Overrides the toString method to get a binary representation of the BitSet
     *
     * @param {number=} base
     * @returns string A binary string
     */
    'toString': function(base) {

      let data = this['data'];
// TODOO:  ...1000  <=> ~111
      if (base === undefined || base === 2) {

        let ret = data.reduce(function(prev, cur, i) {

          if (cur < 0) cur = Math.pow(2, 32) + cur;

          cur = cur.toString(2);
          return "0".repeat(32 - cur.length) + cur + prev;
        }, "");

        if (this['_'] === 0) {
          return ret.replace(/^0+/, '');
        } else {
          return ('1111' + ret).replace(/^1+/, '...1111');
        }


      } else if (base === 16) {

        let ret = data.reduce(function(prev, cur, i) {

          if (cur < 0) cur = Math.pow(2, 32) + cur;

          cur = cur.toString(16);
          return "0".repeat(8 - cur.length) + cur + prev;
        }, "");
// TODO
        return ret.replace(/^0+/, '');

      }


      if (2 > base || base > 36)
        throw "Invalid base";

      let ret = [];
      let arr = [];

      // Copy to a new array
      for (let i = data.length; i--;) {

        for (let j = 32; j--;) {

          arr.push(data[i] >>> j & 1);
        }
      }
// TODO
      do {
        ret.unshift(divide(arr, base).toString(base));
      } while (!arr.every(x => x === 0));

      return ret.join("");
    },
    /**
     * Check if the BitSet is empty, means all bits are unset
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.isEmpty() ? 'yes' : 'no'
     *
     * @returns {boolean} Whether the bitset is empty
     */
    'isEmpty': function() {
      return this['_'] === 0 && this['data'].every(x => x === 0);
    },
    /**
     * Calculates the number of bits set
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var num = bs1.cardinality();
     *
     * @returns {number} The number of bits set
     */
    'cardinality': function() {

      if (this['_'] !== 0) {
        return Infinity;
      }
      return this['data'].reduce((p, n) => p + popCount(n), 0);
    },
    /**
     * Calculates the Most Significant Bit / log base two
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var logbase2 = bs1.msb();
     *
     * var truncatedTwo = Math.pow(2, logbase2); // May overflow!
     *
     * @returns {number} The index of the highest bit set
     */
    'msb': Math['clz32'] ?
      function() {

        if (this['_'] !== 0) {
          return Infinity;
        }

        let data = this['data'];

        for (let i = data.length; i-- > 0;) {

          let c = Math['clz32'](data[i]);

          if (c !== 32) {
            return (i * 32) + 31 - c;
          }
        }
        return Infinity;
      } : function() {

        if (this['_'] !== 0) {
          return Infinity;
        }

        let data = this['data'];

        for (let i = data.length; i-- > 0;) {

          let v = data[i];
          let c = 0;

          if (v) {

            for (;
              (v >>>= 1) > 0; c++) {}
            return (i * 32) + c;
          }
        }
        return Infinity;
      },
    /**
     * Calculates the number of trailing zeros
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var ntz = bs1.ntz();
     *
     * @returns {number} The index of the lowest bit set
     */
    'ntz': function() {

      let data = this['data'];

      for (let j = 0, i = data.length; j < i; j++) {
        let v = data[j];
        let c = 0;

        if (v) {

          v = (v ^ (v - 1)) >>> 1; // Set v's trailing 0s to 1s and zero rest

          return (j * 32) + popCount(v);
        }
      }
      return Infinity;
    },
    /**
     * Gets an entire range as a new bitset object
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.slice(4, 8);
     *
     * @param {number} from The start index of the range to be get
     * @param {number} to The end index of the range to be get
     * @returns {BitSet} A new smaller bitset object, containing the extracted range
     */
    'slice': null,
    /**
     * Clear a range of bits by setting it to 0
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.clear(); // Clear entire set
     * bs1.clear(5); // Clear single bit
     * bs1.clar(3,10); // Clear a bit range
     *
     * @param {number=} from The start index of the range to be cleared
     * @param {number=} to The end index of the range to be cleared
     * @returns {BitSet} this
     */
    'clear': MUTABLE ?
      function(from, to) {

        if (from === undefined && to === undefined) {
          this['data'] = [];
          this['_'] = 0;
        } else if (!isNaN(from) && to === undefined) {
          scale(this, from);
          clear(this, from);
        }

        return this;
      } : function(from, to) {

        let im = new BitSet;

        if (from === undefined && to === undefined) {
          im['data'] = [];
          im['_'] = 0;
        } else if (!isNaN(from) && to === undefined) {
          copyAndScale(im, this, from);
          clear(im, from);
        }

        return im;
      },
    /**
     * Flip/Invert a range of bits by setting
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.flip(); // Flip entire set
     * bs1.flip(5); // Flip single bit
     * bs1.flip(3,10); // Flip a bit range
     *
     * @param {number=} from The start index of the range to be flipped
     * @param {number=} to The end index of the range to be flipped
     * @returns {BitSet} this
     */
    'flip': null,
    /**
     * Compares two BitSet objects
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.equals(bs2) ? 'yes' : 'no'
     *
     * @param {BitSet} p A bitset object
     * @returns {boolean} Whether the two BitSets are similar
     */
    'equals': function(p) {

      parse(P, p);

      if (P['_'] !== this['_']) {
        return false;
      }

      let max = P['data'];
      let min = this['data'];

      if (min.length > max.length) {
        max = this;
        min = P;
      }

      for (let i = max.length; i--;) {

        if (i < min.length) {
          if (max[i] !== min[i])
            return false;
        } else if (max[i] !== 0) {
          return false;
        }
      }
      return true;
    }
  };

  if (typeof define === 'function' && define['amd']) {
    define([], function() {
      return BitSet;
    });
  } else if (typeof exports === 'object') {
    module['exports'] = BitSet;
  } else {
    root['BitSet'] = BitSet;
  }

})(this);