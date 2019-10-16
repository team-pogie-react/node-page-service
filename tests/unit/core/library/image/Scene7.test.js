/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import sinon from 'sinon';
import { each } from 'lodash';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import stubs from '../../../../stubs/images_response';
import Formatter from '../../../../../src/core/library/image/Scene7';

chai.use(sinonChai);

describe('Scene7 Formatter Test', () => {
  const formatter = new Formatter();
  const domain = 'carparts.com';
  const base = 'http://image.com';
  const defaultQuery = 'defaultImage=noimage';

  beforeEach(() => {
    // override base image url
    process.env.CP_BASE_IMAGE_URL = base;
  });

  describe('converts a text to scene7 image url', () => {
    it('converts with and (&)', () => {
      expect(formatter.url('A & B', domain)).to.be.equal(`${base}/a_-and-_b?${defaultQuery}`);
    });

    it('converts with comma (,)', () => {
      expect(formatter.url('A, B', domain)).to.be.equal(`${base}/a-comma-_b?${defaultQuery}`);
      expect(formatter.url('Seats, Seat Covers & Accessories', domain))
        .to.be.equal(`${base}/seats-comma-_seat_covers_-and-_accessories?${defaultQuery}`);
      expect(formatter.url('A,B', domain)).to.be.equal(`${base}/a-comma-b?${defaultQuery}`);
    });

    it('converts with dot (.)', () => {
      expect(formatter.url('A.B', domain)).to.be.equal(`${base}/a-dot-b?${defaultQuery}`);
    });

    it('converts with quotes (")', () => {
      expect(formatter.url('A"B"', domain)).to.be.equal(`${base}/a-qt-b-qt-?${defaultQuery}`);
    });

    it('converts with parenthesis (())', () => {
      const expected = `${base}/a_-and-_b_-openp-a-and-b-closep-?${defaultQuery}`;
      expect(formatter.url('A & B (a-and-b)', domain)).to.be.equal(expected);
    });

    it('converts with plus (+)', () => {
      const expected = `${base}/a_-plus-_b?${defaultQuery}`;
      expect(formatter.url('A + B', domain)).to.be.equal(expected);
    });

    it('converts with semi-colon (;)', () => {
      expect(formatter.url('A; B', domain)).to.be.equal(`${base}/a-semi-_b?${defaultQuery}`);
    });

    it('converts with forward slash (/)', () => {
      const expected = `${base}/path-fs-to-fs-a?${defaultQuery}`;
      expect(formatter.url('path/to/A', domain)).to.be.equal(expected);
    });

    describe('dimensions', () => {
      it('accepts dimensions', () => {
        const size = { width: 50, height: 100 };
        const expectedUrl = `${base}/a-dot-b?${defaultQuery}&wid=${size.width}&hei=${size.height}`;

        expect(formatter.url('A.B', domain, size)).to.be.equal(expectedUrl);
      });

      it('does not include sizes if one is missing', () => {
        const expectedUrl = `${base}/a-dot-b?${defaultQuery}`;

        expect(formatter.url('A.B', domain, { width: 10 })).to.be.equal(expectedUrl);
        expect(formatter.url('A.B', domain, { height: 10 })).to.be.equal(expectedUrl);
        expect(formatter.url('A.B', domain, { random: 'opts' })).to.be.equal(expectedUrl);
      });
    });
  });

  describe('image set', () => {
    const mocks = {};

    beforeEach(() => {
      mocks.http_get = sinon.stub(formatter.http, 'get');
    });

    afterEach(() => {
      each(mocks, item => item.restore());
    });

    it('gets image set url for a text', (done) => {
      mocks.http_get.resolves(stubs.scene7);

      formatter.set('gm24er_is', domain).then((urls) => {
        expect(urls).to.have.lengthOf(7).and.includes(`${base}/gm24er_1?${defaultQuery}`);

        done();
      }).catch(done);
    });
  });
});
