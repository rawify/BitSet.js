
var assert = require('assert');

var BitSet = require('../bitset.min');

describe('BitSet', function() {

    it('Constructor', function() {

        var bs = new BitSet(19219);
        assert.equal(bs.toString(10), '19219');

        var bs = new BitSet;
        assert.equal(bs.toString(32), '0');
    });

    it('Hex in - Hex out', function() {

        var bs = new BitSet("0xD00000005");
        assert.equal(bs.toString(16), 'd00000005');

        var bs = new BitSet("0xff900018283821283");
        assert.equal(bs.toString(16), 'ff900018283821283');

        var bs = new BitSet("0x28123719b3bacf929cd9291929293818382939292");
        assert.equal(bs.toString(16), '28123719b3bacf929cd9291929293818382939292');

        var bs = new BitSet("0x28123719b3bacf929cd9291929293818382939292");
        assert.equal(bs.toString(16), '28123719b3bacf929cd9291929293818382939292');

        var bs = new BitSet("0xd1b1bd81dbabd8ab8adbabcb8cb8c1b8c18bcb81b81b81b8caaaaaaaaafffffabababababa28328832838282838282828382834868682828");
        assert.equal(bs.toString(16), 'd1b1bd81dbabd8ab8adbabcb8cb8c1b8c18bcb81b81b81b8caaaaaaaaafffffabababababa28328832838282838282828382834868682828');
    });

    it('Get range', function() {

        var bs = new BitSet("0xff900018283821283");
        assert.equal(bs.getRange(16, 32).toString(16), '8382');

        var bs = new BitSet("0xff900018283821283");
        assert.equal(bs.getRange(16, 40).toString(2), '1100000101000001110000010');

        var bs = new BitSet("0xff900018283821283");
        assert.equal(bs.getRange(130, 160).toString(8), '0');
    });

    it('And', function() {

        var bs = new BitSet("0xff05");
        assert.equal(bs.and("0xfe00").toString(16), 'fe00');

    });

    it('Or', function() {

        var bs = new BitSet(256);
        assert.equal(bs.or(512).toString(16), '300');
    });

    it('Xor', function() {

        var bs = new BitSet("1010");
        assert.equal(bs.xor("0011").toString(2), '1001');
    });

    it('Equals', function() {

        var bs = new BitSet('100000000000111010101');
        assert.equal(bs.equals("100000000000111010101"), true);

        var bs = new BitSet('111010101');
        assert.equal(bs.equals("101010101"), false);
    });

    it('Cardinality', function() {

        var bs = new BitSet('1000000000000000000001101');
        assert.equal(bs.cardinality(), 4);
    });

    it('msbit', function() {

        var bs = new BitSet('1000000000000000000001101');
        assert.equal(bs.msb(), '1000000000000000000001101'.length - 1);
    });

    it('msbit set', function() {

        var bs = new BitSet;

        bs = bs
                .set(100)
                .set(333);

        assert.equal(bs.msb(), 333);
    });

   it('msbit should work negative numbers', function() {
        var flipped = new BitSet(0).flip();
 
        assert.equal(flipped.msb(), 31);
   });

    it('lsbit', function() {
        assert.equal(
            new BitSet('10000000000110001000000000').lsb(), 
            9
        );

        assert.equal(
            new BitSet('00000000000000000000000000').lsb(), 
            0
        );

        assert.equal(
            new BitSet('10000000000000000000000000').lsb(), 
            25
        );

        assert.equal(
            new BitSet('10000000100000000000000000000000000000000000').lsb(), 
            35
        );
    });

    it('set', function() {

        var bs = new BitSet;

        bs = bs
                .set(4, 1) // Set bit on 4th pos
                .set(0) // Set bit on 0th pos
                .set(22, 1)
                .set(33, 1); // Set

        assert.equal(bs.toString(), '1000000000010000000000000000010001');

        bs = bs.set(33, 0); // And reset
        assert.equal(bs.toString(), '10000000000000000010001');

        assert.equal(bs.msb(), 22);

        bs = bs.set(330, 1);

        assert.equal(bs.msb(), 330); // Thus, msb is on 330
    });

    it('string set', function() {

        var bs = new BitSet;

        bs = bs.set('1000000000010000000000000000010001');

        assert.equal(bs.toString(), '1000000000010000000000000000010001');
    });

    it('set auto scale', function() {

        var bs = new BitSet;

        bs = bs.set(512);

        assert.equal(bs.get(511), 0);
        assert.equal(bs.get(512), 1);
        assert.equal(bs.get(513), 0);
    });

    it('get', function() {

        var bs = new BitSet();

        bs = bs.set(4, 1); // Set bit on 4th pos
        bs = bs.set(0); // Set bit on 0th pos

        assert.equal(bs.get(4) + bs.get(0), 2);
    });


    it('empty', function() {

        var bs = new BitSet();

        assert.equal(bs.isEmpty(), true);

        bs = bs.set(0);

        assert.equal(bs.isEmpty(), false);

    });

    it('setRange 1', function() {

        var bs = new BitSet;

        bs = bs.setRange(3, 10);

        assert.equal(bs.toString(), "11111111000");
    });

    it('setRange 2', function() {

        var bs = new BitSet;

        bs = bs.setRange(0, 70);
        bs = bs.setRange(30, 45, 0);

        assert.equal(bs.toString(), "11111111111111111111111110000000000000000111111111111111111111111111111");
    });

    it('setRange 3', function() {

        var bs = new BitSet;

        bs = bs.setRange(2, 12, "1111001111");

        assert.equal(bs.toString(), "111100111100");
    });

    it('flip/clear 2', function() {

        var bs = new BitSet;

        bs = bs.set(60);

        bs = bs.flip();

        bs = bs.flip(29, 35);
        assert.equal(bs.toString(), "10111111111111111111111111000000011111111111111111111111111111");
    });

    it('flip/clear 3', function() {

        var bs = new BitSet;

        bs = bs.set(60, 0); // Set size

        bs = bs.flip(29, 35);

        bs = bs.flip();

        bs = bs.clear(50, 55);
        assert.equal(bs.toString(), "11111100000011111111111111000000011111111111111111111111111111");
    });

    it('flip range check', function() {

        var bs = new BitSet;

        assert.equal(bs.flip(-1, 0), null);
        assert.equal(bs.flip(1, 0), null);
    });

    it('should work with different length scales', function() {

        var a = new BitSet();
        var b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.and(b).toString(), b.and(a).toString());
        assert.equal(a.or(b).toString(), b.or(a).toString());

        assert.equal(a.nand(b).toString(), b.nand(a).toString());
        assert.equal(a.nor(b).toString(), b.nor(a).toString());

        assert.equal(a.xor(b).toString(), b.xor(a).toString());
    });

    it('should work with different length scales: and', function() {

        var a = new BitSet();
        var b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.and(b).toString(), b.and(a).toString());
    });

    it('should work with different length scales: or', function() {

        var a = new BitSet();
        var b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.or(b).toString(), b.or(a).toString());
    });

    it('should work with different length scales: nand', function() {

        var a = new BitSet();
        var b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.nand(b).toString(), b.nand(a).toString());
    });

    it('should work with different length scales: nor', function() {

        var a = new BitSet();
        var b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.nor(b).toString(), b.nor(a).toString());
    });

    it('should work with different length scales: xor', function() {

        var a = new BitSet();
        var b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.xor(b).toString(), b.xor(a).toString());
    });

});
