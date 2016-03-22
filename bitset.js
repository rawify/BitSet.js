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
   * The number of bits of a word
   * @const
   * @type number
   */
  var WORD_LENGTH = 32;

  /**
   * The log base 2 of WORD_LENGTH
   * @const
   * @type number
   */
  var WORD_LOG = 5;

  /**
   * Calculates the number of set bits
   * 
   * @param {number} v
   * @returns {number}
   */
  function popCount(v) {

    // Warren, H. (2009). Hacker`s Delight. New York, NY: Addison-Wesley

    v -= ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    return (((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24);
  }

  /**
   * Divide a number in base two by B
   *
   * @param {Array} arr
   * @param {number} B
   * @returns {number}
   */
  function divide(arr, B) {

    var r = 0;
    var d;
    var i = 0;

    for (; i < arr.length; i++) {
      r *= 2;
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
  function parse(P, val) {

    if (val == null) {
      P['data'] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      P['_'] = 0;
      return;
    }

    if (val instanceof BitSet) {
      P['data'] = val['data'];
      P['_'] = val['_'];
      return;
    }

    switch (typeof val) {

      case 'number':
        P['data'] = [val | 0];
        P['_'] = 0;
        break;

      case 'string':

        var base = 2;
        var len = WORD_LENGTH;

        if (val.indexOf('0b') === 0) {
          val = val.substr(2);
        } else if (val.indexOf('0x') === 0) {
          val = val.substr(2);
          base = 16;
          len = 8;
        }

        P['data'] = [];
        P['_'] = 0;

        var a = val.length - len;
        var b = val.length;

        do {

          var num = parseInt(val.slice(a > 0 ? a : 0, b), base);

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

        if (val instanceof Array) {

          for (var i = val.length - 1; i >= 0; i--) {
            var ndx = val[i] | 0;

            scale(P, ndx);

            P['data'][ndx >>> WORD_LOG] |= 1 << ndx;
          }
          break;
        }
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
  function BitSet(param) {

    if (!(this instanceof BitSet)) {
      return new BitSet(param);
    }
    parse(this, param);
    this['data'] = this['data'].slice();
  }

  function scale(dst, ndx) {

    var l = ndx >>> WORD_LOG;
    var d = dst['data'];
    var v = dst['_'];

    for (var i = d.length; l >= i; l--) {
      d[l] = v;
    }
  }

  var P = {
    'data': [],
    '_': 0
  };

  BitSet.prototype = {
    'data': [],
    '_': 0,
    /**
     * Set a single bit flag
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.set(3, 1);
     *
     * @param {number} ndx The index of the bit to be set
     * @param {number=} value Optional value that should be set on the index (0 or 1)
     * @returns {BitSet} this
     */
    'set': function(ndx, value) {

      ndx |= 0;

      scale(this, ndx);

      if (value === undefined || value) {
        this['data'][ndx >>> WORD_LOG] |= 1 << ndx;
      } else {
        this['data'][ndx >>> WORD_LOG] &= ~(1 << ndx);
      }
      return this;
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
    'get': function(ndx) {

      ndx |= 0;

      var d = this['data'];
      var n = ndx >>> WORD_LOG;

      if (n > d.length) {
        return this['_'] & 1;
      }
      return (d[n] >>> ndx) & 1;
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
    'and': function(value) {// intersection

      parse(P, value);

      var t = this['data'];
      var p = P['data'];

      var pl = p.length - 1;
      var tl = t.length - 1;

      for (var i = tl; i > pl; i--) {
        t[i] = 0;
      }

      for (; i >= 0; i--) {
        t[i] &= p[i];
      }

      this['_'] &= P['_'];

      return this;
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
    'or': function(val) { // union

      parse(P, val);

      var t = this['data'];
      var p = P['data'];

      var pl = p.length - 1;
      var tl = t.length - 1;

      var minLength = Math.min(tl, pl);

      // Append backwards, extend array only once
      for (var i = pl; i > minLength; i--) {
        t[i] = p[i];
      }

      for (; i >= 0; i--) {
        t[i] |= p[i];
      }

      this['_'] |= P['_'];

      return this;
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
    'not': function() { // invert()

      var d = this['data'];
      for (var i = 0; i < d.length; i++) {
        d[i] = ~d[i];
      }

      this['_'] = ~this['_'];

      return this;
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
    'xor': function(val) { // symmetric difference

      parse(P, val);

      var t = this['data'];
      var p = P['data'];

      var t_ = this['_'];
      var p_ = P['_'];

      var i = 0;

      var tl = t.length - 1;
      var pl = p.length - 1;

      // Cut if tl > pl
      for (i = tl; i > pl; i--) {
        t[i] ^= p_;
      }

      // Cut if pl > tl
      for (i = pl; i > tl; i--) {
        t[i] = t_ ^ p[i];
      }

      // XOR the rest
      for (; i >= 0; i--) {
        t[i] ^= p[i];
      }

      // XOR infinity
      this['_'] ^= p_;

      return this;
    },
    'andNot': function(val) { // difference

      parse(P, val);

      var t = this['data'];
      var p = P['data'];

      var t_ = this['_'];
      var p_ = P['_'];

      var l = Math.min(t.length, p.length);

      for (var k = 0; k < l; k++) {
        t[k] &= ~p[k];
      }
      this['_'] &= ~p_;
      
      return this;
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

      var im = Object.create(BitSet.prototype);
      im['data'] = this['data'].slice();
      im['_'] = this['_'];

      return im;
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

              var ret = [];
              var data = this['data'];

              for (var i = data.length - 1; i >= 0; i--) {

                var num = data[i];

                while (num !== 0) {
                  var t = 31 - Math['clz32'](num);
                  num ^= 1 << t;
                  ret.unshift((i * WORD_LENGTH) + t);
                }
              }
              return ret;
            } :
            function() {

              if (this['_'] !== 0)
                return Infinity;

              var ret = [];
              var data = this['data'];

              for (var i = 0; i < data.length; i++) {

                var num = data[i];

                while (num !== 0) {
                  var t = num & -num;
                  num ^= t;
                  ret.push((i * WORD_LENGTH) + popCount(t - 1));
                }
              }
              return ret;
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

      if (this['_'] !== 0)
        return false;

      var d = this['data'];

      for (var i = d.length - 1; i >= 0; i--) {
        if (d[i] !== 0)
          return false;
      }
      return true;
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

      var s = 0;
      var d = this['data'];
      for (var i = 0; i < d.length; i++) {
        var n = d[i];
        if (n !== 0)
          s += popCount(n);
      }
      return s;
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

              var data = this['data'];

              for (var i = data.length; i-- > 0; ) {

                var c = Math['clz32'](data[i]);

                if (c !== WORD_LENGTH) {
                  return (i * WORD_LENGTH) + WORD_LENGTH - 1 - c;
                }
              }
              return Infinity;
            } :
            function() {

              if (this['_'] !== 0) {
                return Infinity;
              }

              var data = this['data'];

              for (var i = data.length; i-- > 0; ) {

                var v = data[i];
                var c = 0;

                if (v) {

                  for (; (v >>>= 1) > 0; c++) {
                  }
                  return (i * WORD_LENGTH) + c;
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

      var data = this['data'];

      for (var j = 0; j < data.length; j++) {
        var v = data[j];

        if (v !== 0) {

          v = (v ^ (v - 1)) >>> 1; // Set v's trailing 0s to 1s and zero rest

          return (j * WORD_LENGTH) + popCount(v);
        }
      }
      return Infinity;
    },
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
    'equals': function(val) {

      parse(P, val);

      var t = this['data'];
      var p = P['data'];

      var t_ = this['_'];
      var p_ = P['_'];

      var i = 0;

      var tl = t.length - 1;
      var pl = p.length - 1;

      if (p_ !== t_) {
        return false;
      }

      var minLength = tl < pl ? tl : pl;

      for (var i = 0; i <= minLength; i++) {
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
    }
  };

  BitSet.fromBinaryString = function(str) {

    return new BitSet('0b' + str);
  };

  BitSet.fromHexString = function(str) {

    return new BitSet('0x' + str);
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