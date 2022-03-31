import assert from 'assert';
import {foundPerson, foundPersonNew} from '../substitute-algorithm.js';

const people = ['Harry', 'John', 'Kent'];
describe('founcPerson', () => {
  it('should return one of these names. : Don, John, Kent', () => {
    const old = foundPerson(people);
    assert.equal(old, 'John');
  });
  it('old and newFunc return value should be same.', () => {
    const old = foundPerson(people);
    const newfunc = foundPersonNew(people);
    assert.equal(old, newfunc);
  });
});
