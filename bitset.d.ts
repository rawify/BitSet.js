export declare interface ReadOnlyBitSet
{
    /**
     * Creates the bitwise AND of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.and(bs2);
     *
     * @param {ReadOnlyBitSet} other A bitset object
     * @returns {ReadOnlyBitSet} this
     */
    and(other: ReadOnlyBitSet): ReadOnlyBitSet;

    /**
    * Creates the bitwise OR of two sets. The result is stored in-place.
    *
    * Ex:
    * bs1 = new BitSet(10);
    * bs2 = new BitSet(10);
    *
    * bs1.or(bs2);
    *
    * @param {ReadOnlyBitSet} other A bitset object
    * @returns {ReadOnlyBitSet} this
    */
    or(other: ReadOnlyBitSet): ReadOnlyBitSet;

    /**
     * Creates the bitwise AND NOT (not confuse with NAND!) of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.notAnd(bs2);
     *
     * @param {ReadOnlyBitSet} other A bitset object
     * @returns {ReadOnlyBitSet} this
     */
    andNot(other: ReadOnlyBitSet): ReadOnlyBitSet;

    /**
    * Creates the bitwise NOT of a set. The result is stored in-place.
    *
    * Ex:
    * bs1 = new BitSet(10);
    *
    * bs1.not();
    *
    * @param {ReadOnlyBitSet} other A bitset object
    * @returns {ReadOnlyBitSet} this
    */
    not(other: ReadOnlyBitSet): ReadOnlyBitSet;

    /**
     * Creates the bitwise XOR of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.xor(bs2);
     *
     * @param {ReadOnlyBitSet} other A bitset object
     * @returns {ReadOnlyBitSet} this
     */
    xor(other: ReadOnlyBitSet): ReadOnlyBitSet;

    /**
     * Compares two BitSet objects
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.equals(bs2) ? 'yes' : 'no'
     *
     * @param {ReadOnlyBitSet} other A bitset object
     * @returns {boolean} Whether the two BitSets are similar
     */
    equals(other: ReadOnlyBitSet): boolean;

    /**
    * Clones the actual object
    *
    * Ex:
    * bs1 = new BitSet(10);
    * bs2 = bs1.clone();
    *
    * @returns {ReadOnlyBitSet} A new BitSet object, containing a copy of the actual object
    */
    clone(): ReadOnlyBitSet;

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
    isEmpty(): boolean;

    /**
     * Overrides the toString method to get a binary representation of the BitSet
     *
     * @param {number=} base
     * @returns string A binary string
     */
    toString(base?: number): string;

    /**
     * Gets a list of set bits
     *
     * @returns {Array|number}
     */
    toArray(): Array<number> | number

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
    cardinality(): number;

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
    msb(): number;

    /**
     * Calculates the Least Significant Bit
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var lsb = bs1.lsb();
     *
     * @returns {number} The index of the lowest bit set
     */
    lsb(): number;

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
    ntz(): number;

    /**
     * Get a single bit flag of a certain bit position
     *
     * Ex:
     * bs1 = new BitSet();
     * var isValid = bs1.get(12);
     *
     * @param {number} index the index to be fetched
     * @returns {number|null} The binary flag
     */
    get(index: number): number | null;

    /**
     * Gets an entire range as a new bitset object
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.slice(4, 8);
     *
     * @param {number=} fromIndex The start index of the range to be get
     * @param {number=} toIndex The end index of the range to be get
     * @returns {BitSet|Object} A new smaller bitset object, containing the extracted range
     */
    slice(fromIndex?: number, toIndex?: number): ReadOnlyBitSet;

    /**
    * Flip/Invert a range of bits by setting
    *
    * Ex:
    * bs1 = new BitSet();
    * bs1.flip(); // Flip entire set
    * bs1.flip(5); // Flip single bit
    * bs1.flip(3,10); // Flip a bit range
    *
    * @param {number=} fromIndex The start index of the range to be flipped
    * @param {number=} toIndex The end index of the range to be flipped
    * @returns {BitSet} this
    */
    flip(fromIndex?: number, toIndex?: number): ReadOnlyBitSet;
}
export declare var ReadOnlyBitSet: ReadOnlyBitSet;

export declare class BitSet
{
    /**
     * @constructor create a new BitSet
     * @param {String | number | BitSet | Array<number> | Uint8Arra} input
     *
     * Strings
     *
     * - Binary strings "010101"
     * - Binary strings with prefix "0b100101"
     * - Hexadecimal strings with prefix "0xaffe"
     *
     * Arrays
     * - The values of the array are the indizes to be set to 1
     *
     * Uint8Array
     * - A binary representation in 8 bit form
     *
     * Number
     * - A binary value
     * BitSet
     * - A BitSet object, which get copied over
     *
     */
    constructor(input?: String | number | BitSet | Array<number> | Uint8Array);

    public static fromBinaryString(str: string): BitSet;
    public static fromHexString(str: string): BitSet;
    public static Random(n: number): BitSet;

    /**
    * Creates the bitwise AND of two sets. The result is stored in-place.
    *
    * Ex:
    * bs1 = new BitSet(10);
    * bs2 = new BitSet(10);
    *
    * bs1.and(bs2);
    *
    * @param {BitSet} other A bitset object
    * @returns {BitSet} this
    */
    public and(other: BitSet): BitSet;

    /**
     * Creates the bitwise OR of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.or(bs2);
     *
     * @param {BitSet} other A bitset object
     * @returns {BitSet} this
     */
    public or(other: BitSet): BitSet;

    /**
     * Creates the bitwise AND NOT (not confuse with NAND!) of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.notAnd(bs2);
     *
     * @param {BitSet} other A bitset object
     * @returns {BitSet} this
     */
    public andNot(other: BitSet): BitSet;

    /**
     * Creates the bitwise NOT of a set. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.not();
     *
     * @param {BitSet} other A bitset object
     * @returns {BitSet} this
     */
    public not(other: BitSet): BitSet;

    /**
     * Creates the bitwise XOR of two sets. The result is stored in-place.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.xor(bs2);
     *
     * @param {BitSet} other A bitset object
     * @returns {BitSet} this
     */
    public xor(other: BitSet): BitSet;

    /**
     * Compares two BitSet objects
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.equals(bs2) ? 'yes' : 'no'
     *
     * @param {BitSet} other A bitset object
     * @returns {boolean} Whether the two BitSets are similar
     */
    public equals(other: BitSet): boolean;

    /**
    * Clones the actual object
    *
    * Ex:
    * bs1 = new BitSet(10);
    * bs2 = bs1.clone();
    *
    * @returns {BitSet} A new BitSet object, containing a copy of the actual object
    */
    public clone(): BitSet;

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
    public isEmpty(): boolean;

    /**
     * Overrides the toString method to get a binary representation of the BitSet
     *
     * @param {number=} base
     * @returns string A binary string
     */
    public toString(base?: number): string;

    /**
     * Gets a list of set bits
     *
     * @returns {Array|number}
     */
    toArray(): Array<number> | number

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
    public cardinality(): number;

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
    public msb(): number;

    /**
     * Calculates the Least Significant Bit
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var lsb = bs1.lsb();
     *
     * @returns {number} The index of the lowest bit set
     */
    public lsb(): number;

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
    public ntz(): number;

    /**
     * Set a single bit flag
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.set(3, 1);
     *
     * @param {number} index The index of the bit to be set
     * @param {number=} value Optional value that should be set on the index (0 or 1)
     * @returns {BitSet} this
     */
    public set(index?: number, value?: number): BitSet;

    /**
     * Set a range of bits
     *
     * Ex:
     * bs1 = new BitSet();
     *
     * bs1.setRange(10, 15, 1);
     *
     * @param {number} fromIndex The start index of the range to be set
     * @param {number} toIndex The end index of the range to be set
     * @param {number=} value Optional value that should be set on the index (0 or 1)
     * @returns {BitSet} this
     */
    public setRange(fromIndex: number, toIndex: number, value?: number | string): BitSet;

    /**
     * Get a single bit flag of a certain bit position
     *
     * Ex:
     * bs1 = new BitSet();
     * var isValid = bs1.get(12);
     *
     * @param {number} index the index to be fetched
     * @returns {number|null} The binary flag
     */
    public get(index: number): number | null;

    /**
     * Gets an entire range as a new bitset object
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.slice(4, 8);
     *
     * @param {number=} fromIndex The start index of the range to be get
     * @param {number=} toIndex The end index of the range to be get
     * @returns {BitSet} A new smaller bitset object, containing the extracted range
     */
    public slice(fromIndex?: number, toIndex?: number): BitSet;

    /**
     * Clear a range of bits by setting it to 0
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.clear(); // Clear entire set
     * bs1.clear(5); // Clear single bit
     * bs1.clar(3,10); // Clear a bit range
     *
     * @param {number=} fromIndex The start index of the range to be cleared
     * @param {number=} toIndex The end index of the range to be cleared
     * @returns {BitSet} this
     */
    public clear(fromIndex?: number, toIndex?: number): void;

    /**
     * Flip/Invert a range of bits by setting
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.flip(); // Flip entire set
     * bs1.flip(5); // Flip single bit
     * bs1.flip(3,10); // Flip a bit range
     *
     * @param {number=} fromIndex The start index of the range to be flipped
     * @param {number=} toIndex The end index of the range to be flipped
     * @returns {BitSet} this
     */
    public flip(fromIndex?: number, toIndex?: number): BitSet;
}