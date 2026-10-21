const test = require('node:test');
const assert = require('node:assert');
const { add } = require('../src/math');

test('add 1+2=3', () => { assert.equal(add(1, 2), 3); });
test('add 0+0=0', () => { assert.equal(add(0, 0), 0); });
