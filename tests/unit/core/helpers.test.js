/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { keys } from 'lodash';
import { expect } from 'chai';
import * as _ from '../../../src/core/helpers';

describe('Helper Functions Test', () => {
  it('determines if value is falsy', () => {
    expect(_.isFalsy()).to.be.true;
    expect(_.isFalsy(null)).to.be.true;
    expect(_.isFalsy(0)).to.be.true;
    expect(_.isFalsy('')).to.be.true;
    expect(_.isFalsy(false)).to.be.true;
    expect(_.isFalsy(NaN)).to.be.true;
    expect(_.isFalsy({})).to.be.true;
    expect(_.isFalsy([])).to.be.true;

    expect(_.isFalsy('hey')).to.be.false;
    expect(_.isFalsy(222)).to.be.false;
    expect(_.isFalsy({ some: 'object' })).to.be.false;
    expect(_.isFalsy(['some', 'array'])).to.be.false;
  });

  describe('text encoding', () => {
    it('handles undefined value', () => {
      expect(_.encode(undefined)).to.be.equal('');
      expect(_.encodeToLower(undefined)).to.be.equal('');
      expect(_.decode(undefined)).to.be.equal('');
    });

    it('converts with and (&)', () => {
      expect(_.encodeToLower('A & B')).to.be.equal('a_-and-_b');
    });

    it('converts with comma (,)', () => {
      expect(_.encodeToLower('A, B')).to.be.equal('a-comma-_b');
      expect(_.encodeToLower('Seats, Seat Covers & Accessories'))
        .to.be.equal('seats-comma-_seat_covers_-and-_accessories');
      expect(_.encodeToLower('A,B')).to.be.equal('a-comma-b');
    });

    it('converts with dot (.)', () => {
      expect(_.encodeToLower('A.B')).to.be.equal('a-dot-b');
    });

    it('converts with quotes (")', () => {
      expect(_.encodeToLower('A"B"')).to.be.equal('a-qt-b-qt-');
    });

    it('converts with parenthesis (())', () => {
      const expected = 'a_-and-_b_-openp-a-and-b-closep-';
      expect(_.encodeToLower('A & B (a-and-b)')).to.be.equal(expected);
    });

    it('converts with plus (+)', () => {
      const expected = 'a_-plus-_b';
      expect(_.encodeToLower('A + B')).to.be.equal(expected);
    });

    it('converts with semi-colon (;)', () => {
      expect(_.encodeToLower('A; B')).to.be.equal('a-semi-_b');
    });

    it('converts with forward slash (/)', () => {
      const expected = 'path-fs-to-fs-a';
      expect(_.encodeToLower('path/to/A')).to.be.equal(expected);
    });

    it('encodes the text and ignores case', () => {
      expect(_.encode('Seats, Seat Covers & Accessories'))
        .to.be.equal('Seats-comma-_Seat_Covers_-and-_Accessories');
    });
  });

  describe('sortByKey()', () => {
    it('sorts by key without recursing', () => {
      const result = _.sortByKey({
        Banana: 'banana',
        Apple: 'apple',
        Deep: {
          Money: 'none',
          Joke: 'lul',
        },
      });

      const expectedKeys = keys(result);

      expect(expectedKeys[0]).to.be.equal('Apple');
      expect(expectedKeys[1]).to.be.equal('Banana');
      expect(expectedKeys[2]).to.be.equal('Deep');
      expect(keys(result.Deep)[0]).to.be.equal('Money');
    });

    it('deep sorts by key', () => {
      const result = _.sortByKey({
        Banana: 'banana',
        Apple: 'apple',
        Deep: {
          Money: 'none',
          Joke: 'lul',
        },
      }, true);

      const expectedKeys = keys(result);

      expect(expectedKeys[0]).to.be.equal('Apple');
      expect(expectedKeys[1]).to.be.equal('Banana');
      expect(expectedKeys[2]).to.be.equal('Deep');
      expect(keys(result.Deep)[0]).to.be.equal('Joke');
    });
  });
});
