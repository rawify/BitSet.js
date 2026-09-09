/**
 * @license BitSet v5.3.0 9/9/2026
 * https://raw.org/software/libraries/bitset-js/
 *
 * Copyright (c) 2026, Robert Eisele (https://raw.org/)
 * Licensed under the MIT license.
 **/
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
    new (input?: BitSetInput): BitSet;
    (input?: BitSetInput): BitSet;
    prototype: BitSet;
    fromBinaryString(value: string): BitSet;
    fromHexString(value: string): BitSet;
    Random(length?: number): BitSet;
}
/**
 * Module entry point
 *
 * @constructor
 * @param {string|BitSet|number|Array|Uint8Array=} param
 * @returns {BitSet}
 */
export declare const BitSet: BitSetConstructor;
export default BitSet;
