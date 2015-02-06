
var assert = require('assert');

var BitSet = require('../bitset').BitSet;

function i2s(arr) {

    var str = "{ ";

    for (var i = 0; i < arr.length; i++) {
        if (i > 0)
            str+= ", ";
        str+= arr[i];
    }

    return str + " }";
}

describe('BitSet', function(){

    it('Small element construct', function(){

        var bs = new BitSet(2);
        assert.equal(bs.size, 31);
        assert.equal(i2s(bs), '{ 0 }');
    });

    it('32s construcst', function(){

        var bs = new BitSet(32);
        assert.equal(bs.size, 62);
        assert.equal(i2s(bs), '{ 0, 0 }');
    });

    it('500s construct INT', function(){

        var bs = new BitSet(500);
        assert.equal(bs.size, 527);
        assert.equal(i2s(bs), '{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }');
    });

    it('Small element construct w/ init value = 1', function(){

        var bs = new BitSet(2, 1);
        assert.equal(bs.size, 31);
        assert.equal(i2s(bs), '{ 2147483647 }');
    });

    it('Small element construct w/ init value = 2', function(){

        var bs = new BitSet(2, 2);
        assert.equal(bs.size, 31);
        assert.equal(i2s(bs), '{ 0 }');
    });

    it('500s construct INT w/ init value = 1', function(){

        var bs = new BitSet(500);
        assert.equal(bs.size, 527);
        assert.equal(i2s(bs), '{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }');
    });

    it('not', function(){

        var bs1 = new BitSet(64);

        bs1[1] = 5;

        bs1.not();

        assert.equal(bs1.size, 93);
        assert.equal(i2s(bs1), '{ -1, -6, -1 }');
    });

    it('and', function(){

        var bs1 = new BitSet(64);
        var bs2 = new BitSet(64);

        bs1[1] = 5;
        bs2[1] = 1;

        bs1.and(bs2);

        assert.equal(bs1.size, 93);
        assert.equal(i2s(bs1), '{ 0, 1, 0 }');
    });

    it('or', function(){

        var bs1 = new BitSet(64);
        var bs2 = new BitSet(64);

        bs1[1] = 5;
        bs2[1] = 8;

        bs1.or(bs2);

        assert.equal(bs1.size, 93);
        assert.equal(i2s(bs1), '{ 0, 13, 0 }');
    });

    it('nand', function(){

        var bs1 = new BitSet(64);
        var bs2 = new BitSet(64);

        bs1[1] = 5;
        bs2[1] = 1;

        bs1.nand(bs2);

        assert.equal(bs1.size, 93);
        assert.equal(i2s(bs1), '{ -1, -2, -1 }');
    });

    it('nor', function(){

        var bs1 = new BitSet(64);
        var bs2 = new BitSet(64);

        bs1[1] = 5;
        bs2[1] = 8;

        bs1.nor(bs2);

        assert.equal(bs1.size, 93);
        assert.equal(i2s(bs1), '{ -1, -14, -1 }');
    });

    it('xor', function(){

        var bs1 = new BitSet(64);
        var bs2 = new BitSet(64);

        bs1[1] = 22;
        bs2[1] = 9;

        bs1.xor(bs2);

        assert.equal(bs1.size, 93);
        assert.equal(i2s(bs1), '{ 0, 31, 0 }');
    });

    it('equals', function(){

        var bs1 = new BitSet(64);
        var bs2 = new BitSet(64);

        bs1[1] = 63;
        bs2[1] = 63;

        assert.equal(bs1.equals(bs2), bs2.equals(bs1));
        assert.equal(bs1.equals(bs2), true);
    });

    it('equalsX', function(){

        var bs1 = new BitSet(128);
        var bs2 = new BitSet(64);
        
        bs1.set(15);
        bs2.set(15);

        assert.equal(bs1.equals(bs2), bs2.equals(bs1));
        assert.equal(bs1.equals(bs2), true);
    });

    it('clone', function(){

        var bs1 = new BitSet(64);
        bs1[1] = 63;

        var bs2 = bs1.clone();

        assert.equal(bs1.equals(bs2), bs2.equals(bs1));
        assert.equal(bs1.equals(bs2), bs1.size == bs2.size);
    });

    it('isEmpty', function(){

        var bs1 = new BitSet(500);
        var bs2 = new BitSet(500);

        bs2[15] = 666;

        assert.equal(bs1.isEmpty(bs2), !bs2.isEmpty(bs1));
    });

    it('toString', function(){

        var ex = "0000000000000000000000001111100-0000000000000000000001010011010";

        var bs = new BitSet(40);

        bs[0] = 666;
        bs[1] = 31 << 2;

        assert.equal(bs.size, 62);
        assert.equal(bs.toString("-"), ex);
        assert.equal("" + bs, ex.replace("-", ""));
    });

    it('cardinality', function(){

        var bs = new BitSet(40);

        bs[0] = 15 << 3;
        bs[1] = 31 << 2;

        assert.equal(bs.cardinality(), 9);
    });

    it('msb', function(){

        var bs = new BitSet(40);

        bs[0] = 15 << 3;
        bs[1] = 31 << 2;

        assert.equal(bs.msb(), 37);
    });

    it('msb big', function(){

        var bs = new BitSet(500);

        bs.set(332);
        bs.set(333);

        assert.equal(bs.msb(), 333);
    });

    it('set', function(){

        var bs = new BitSet(40);

        bs.set(4, 1); // Set bit on 4th pos
        bs.set(0); // Set bit on 0th pos
        bs.set(22, 1);

        bs.set(33, 1); // Set

        assert.equal(bs.toString("!"), '0000000000000000000000000000100!0000000010000000000000000010001');

        bs.set(33, 0); // And reset
        assert.equal(bs.toString("!"), '0000000000000000000000000000000!0000000010000000000000000010001');


        bs.set(330, 1); // Will be ignored, out of rage

        assert.equal(bs.msb(), 22); // Thus, msb is on 22
    });

    it('get', function(){

        var bs = new BitSet();

        bs.set(4, 1); // Set bit on 4th pos
        bs.set(0); // Set bit on 0th pos

        assert.equal(bs.get(4) + bs.get(0), 2);
    });


    it('getRange', function(){

        var bs = new BitSet(100);
        var ex = '10011001000100110011001100110011';

        bs[0] = 0x9999999;
        bs[1] = 0x9999999;

        assert.equal(ex, bs.getRange(7, 38).toString().substr(-ex.length));
    });

    it('setRange 1', function(){

        var bs = new BitSet(30);

        bs.setRange(3, 10);

        assert.equal(bs.toString("..."), "0000000000000000000011111111000");
    });

    it('setRange 2', function(){

        var bs = new BitSet(62);

        bs.setRange(0, 61);
        bs.setRange(30, 45, 0);

        assert.equal(bs.toString("!"), "1111111111111111000000000000000!0111111111111111111111111111111");
    });

    it('setRange 3', function(){

        var bs = new BitSet(30);

        bs.setRange(2, 12, "1111001111");

        assert.equal(bs.toString("!"), "0000000000000000000111100111100");
    });

    it('flip/clear 1', function(){

        var bs = new BitSet(40);

        bs.flip();
        assert.equal(bs.toString("-"), "1111111111111111111111111111111-1111111111111111111111111111111");

    });

    it('flip/clear 2', function(){

        var bs = new BitSet(40);

        bs.flip();

        bs.flip(29, 35);
        assert.equal(bs.toString("-"), "1111111111111111111111111100000-0011111111111111111111111111111");

    });

    it('flip/clear 3', function(){

        var bs = new BitSet(40);

        bs.flip();

        bs.flip(29, 35);

        bs.clear(50, 55);
        assert.equal(bs.toString("-"), "1111110000001111111111111100000-0011111111111111111111111111111");

    });

    it('flip range check', function(){

        var bs = new BitSet(40);

        assert.equal(bs.flip(-1, 0), null);
        assert.equal(bs.flip(0, 64), null);
        assert.equal(bs.flip(1, 0), null);

    });

    it('subsetOf - empty sets', function () {
        var bs1 = new BitSet(10);
        var bs2 = new BitSet(10);

        assert.equal(bs1.subsetOf(bs2), true);
        assert.equal(bs2.subsetOf(bs1), true);
    });

    it('subsetOf', function () {
        var bs1 = new BitSet(10);
        var bs2 = new BitSet(10);

        bs1.flip(1, 2).flip(5, 6);
        bs2.flip(1, 2);

        assert.equal(bs2.subsetOf(bs1), true);
        assert.equal(bs1.subsetOf(bs2), false);
        assert.equal(bs1.subsetOf(bs1), true);
    });
});
