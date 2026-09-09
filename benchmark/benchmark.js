'use strict';

const { performance } = require('node:perf_hooks');
const BitSet = require('../dist/bitset.js');
const FastBitSet = require('fastbitset');

const BITS = 1 << 15;
const INDICES = Array.from({ length: BITS >>> 2 }, (_, index) => (index * 2654435761 >>> 0) & (BITS - 1));
const LOOKUPS = Array.from({ length: BITS }, (_, index) => (index * 40503) & (BITS - 1));
const LOOPS = 2000;
const RATIOS = [];

function measure(name, iterations, operation) {
  for (let index = 0; index < Math.min(iterations, 100); index++) operation();

  const samples = [];
  let checksum = 0;
  for (let sample = 0; sample < 7; sample++) {
    const start = performance.now();
    for (let index = 0; index < iterations; index++) checksum ^= operation() | 0;
    samples.push(performance.now() - start);
  }
  samples.sort((left, right) => left - right);
  return { name, milliseconds: samples[3], checksum };
}

function compare(name, iterations, bitsetOperation, fastBitSetOperation) {
  const bitset = measure(name, iterations, bitsetOperation);
  const fastBitSet = measure(name, iterations, fastBitSetOperation);
  const ratio = fastBitSet.milliseconds / bitset.milliseconds;
  RATIOS.push(ratio);
  console.log(`${name.padEnd(16)} BitSet ${bitset.milliseconds.toFixed(2).padStart(8)} ms  FastBitSet ${fastBitSet.milliseconds.toFixed(2).padStart(8)} ms  ${ratio.toFixed(2)}x`);
  if (bitset.checksum !== fastBitSet.checksum) throw new Error(`${name}: checksum mismatch`);
}

const bitsetA = new BitSet(INDICES);
const bitsetB = new BitSet(INDICES.map(index => (index + 17) & (BITS - 1)));
const fastA = new FastBitSet(INDICES);
const fastB = new FastBitSet(INDICES.map(index => (index + 17) & (BITS - 1)));

compare('construct', 250, () => new BitSet(INDICES).cardinality(), () => new FastBitSet(INDICES).size());
compare('set/add', 250, () => {
  const set = new BitSet();
  for (let index = 0; index < INDICES.length; index++) set.set(INDICES[index]);
  return set.cardinality();
}, () => {
  const set = new FastBitSet();
  for (let index = 0; index < INDICES.length; index++) set.add(INDICES[index]);
  return set.size();
});
compare('get/has', 250, () => {
  let sum = 0;
  for (let index = 0; index < LOOKUPS.length; index++) sum += bitsetA.get(LOOKUPS[index]);
  return sum;
}, () => {
  let sum = 0;
  for (let index = 0; index < LOOKUPS.length; index++) sum += fastA.has(LOOKUPS[index]);
  return sum;
});
compare('cardinality', LOOPS, () => bitsetA.cardinality(), () => fastA.size());
compare('toArray', 500, () => bitsetA.toArray().length, () => fastA.array().length);
compare('clone', LOOPS, () => bitsetA.clone().cardinality(), () => fastA.clone().size());
compare('and', LOOPS, () => bitsetA.and(bitsetB).cardinality(), () => fastA.new_intersection(fastB).size());
compare('or', LOOPS, () => bitsetA.or(bitsetB).cardinality(), () => fastA.clone().union(fastB).size());
compare('xor', LOOPS, () => bitsetA.xor(bitsetB).cardinality(), () => fastA.new_change(fastB).size());
compare('andNot', LOOPS, () => bitsetA.andNot(bitsetB).cardinality(), () => fastA.new_difference(fastB).size());

const geometricMean = Math.exp(RATIOS.reduce((sum, ratio) => sum + Math.log(ratio), 0) / RATIOS.length);
console.log(`overall${''.padEnd(9)} ${geometricMean.toFixed(2)}x`);