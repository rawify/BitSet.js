'use strict';

const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { describe, it } = require('node:test');
const vm = require('node:vm');

describe('distribution', function () {
  it('exports a callable CommonJS constructor with aliases', function () {
    const BitSet = require('../dist/bitset.js');

    assert.equal(BitSet('101').toString(), '101');
    assert.equal(new BitSet('101').toString(), '101');
    assert.equal(BitSet.default, BitSet);
    assert.equal(BitSet.BitSet, BitSet);
  });

  it('exports default and named ESM constructors', async function () {
    const module = await import('../dist/bitset.mjs');

    assert.equal(module.default('101').toString(), '101');
    assert.equal(module.BitSet, module.default);
  });

  it('exports a browser global', async function () {
    const source = await readFile(path.join(__dirname, '../dist/bitset.min.js'), 'utf8');
    const context = vm.createContext({});
    vm.runInContext(source, context);

    assert.equal(context.BitSet('101').toString(), '101');
  });

  it('registers with AMD loaders', async function () {
    const source = await readFile(path.join(__dirname, '../dist/bitset.min.js'), 'utf8');
    let exported;
    const define = (dependencies, factory) => {
      assert.equal(Array.isArray(dependencies), true);
      assert.equal(dependencies.length, 0);
      exported = factory();
    };
    define.amd = {};
    vm.runInContext(source, vm.createContext({ define }));

    assert.equal(exported('101').toString(), '101');
  });

  it('exports a browser ESM constructor', async function () {
    const module = await import('../dist/bitset.min.mjs');

    assert.equal(module.default('101').toString(), '101');
    assert.equal(module.BitSet, module.default);
  });

  it('does not mutate operands in immutable operations', function () {
    const BitSet = require('../dist/bitset.js');
    const left = new BitSet([1, 100]);
    const right = new BitSet([2]);
    const rightData = right.data.slice();

    left.xor(right);
    left.andNot(right);

    assert.deepEqual(right.data, rightData);
  });

  it('keeps get correct across finite and infinite representations', function () {
    const BitSet = require('../dist/bitset.js');
    const finite = new BitSet([1, 34]);
    const infinite = finite.not();

    assert.equal(finite.get(-1), 0);
    assert.equal(finite.get(1000000), 0);
    assert.equal(infinite.get(-1), 0);
    assert.equal(infinite.get(1), 0);
    assert.equal(infinite.get(1000000), 1);
    assert.equal(infinite.clone().get(1000000), 1);
    assert.equal(infinite.slice(35).get(1000000), 1);
    assert.equal(infinite.and(0xff).get(1000000), 0);
    assert.equal(finite.or(infinite).get(1000000), 1);
    assert.equal(infinite.xor(infinite).get(1000000), 0);
    assert.equal(infinite.andNot(infinite).get(1000000), 0);

    infinite.flip();
    assert.equal(infinite.get(1000000), 0);
    infinite.flip().clear();
    assert.equal(infinite.get(1000000), 0);
  });
});