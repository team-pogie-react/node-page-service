/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import sinon from 'sinon';
import { each } from 'lodash';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import stubs from '../../../../stubs/images_response';
import Formatter from '../../../../../src/core/library/image/Cloudinary';

chai.use(sinonChai);

describe('converts a text to cloudinary image url', () => {
  const formatter = new Formatter();
  const domain = 'carparts.com';
  const opts = { dir: 'images' };
  const superBase = 'http://image.com';
  const base = `${superBase}/upload/d_noimage.jpg`;

  beforeEach(() => {
    // override base image url
    process.env.CP_BASE_IMAGE_URL = superBase;
  });

  describe('Cloudinary Formatter Test', () => {
    it('converts with and (&)', () => {
      expect(formatter.url('A & B', domain, opts)).to.be.equal(`${base}/${opts.dir}/a_-and-_b.jpg`);
    });

    it('converts with comma (,)', () => {
      expect(formatter.url('A, B', domain, opts)).to.be.equal(`${base}/${opts.dir}/a-comma-_b.jpg`);
      expect(formatter.url('Seats, Seat Covers & Accessories', domain, opts))
        .to.be.equal(`${base}/${opts.dir}/seats-comma-_seat_covers_-and-_accessories.jpg`);
      expect(formatter.url('A,B', domain, opts)).to.be.equal(`${base}/${opts.dir}/a-comma-b.jpg`);
    });

    it('converts with dot (.)', () => {
      expect(formatter.url('A.B', domain, opts)).to.be.equal(`${base}/${opts.dir}/a-dot-b.jpg`);
    });

    it('converts with quotes (")', () => {
      expect(formatter.url('A"B"', domain, opts)).to.be.equal(`${base}/${opts.dir}/a-qt-b-qt-.jpg`);
    });

    it('converts with parenthesis (())', () => {
      const expected = `${base}/${opts.dir}/a_-and-_b_-openp-a-and-b-closep-.jpg`;
      expect(formatter.url('A & B (a-and-b)', domain, opts)).to.be.equal(expected);
    });

    it('converts with plus (+)', () => {
      const expected = `${base}/${opts.dir}/a_-plus-_b.jpg`;
      expect(formatter.url('A + B', domain, opts)).to.be.equal(expected);
    });

    it('converts with semi-colon (;)', () => {
      expect(formatter.url('A; B', domain, opts)).to.be.equal(`${base}/${opts.dir}/a-semi-_b.jpg`);
    });

    it('converts with forward slash (/)', () => {
      const expected = `${base}/${opts.dir}/path-fs-to-fs-a.jpg`;
      expect(formatter.url('path/to/A', domain, opts)).to.be.equal(expected);
    });

    it('defaults to "images" directory if no dir was passed', () => {
      expect(formatter.url('A & B', domain)).to.be.equal(`${base}/images/a_-and-_b.jpg`);
    });

    it('converts image set text suffix from *_is to *_1', () => {
      expect(formatter.url('ce135.40103_is', domain)).to.be.equal(`${base}/images/ce135.40103_1.jpg`);
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

    it('does not encode text for set url', (done) => {
      mocks.http_get.resolves(stubs.cloudinaryWithDot);

      formatter.set('ce135.40103_is', domain).then((urls) => {
        expect(urls).to.have.lengthOf(2)
          .and.includes(`${base}/${opts.dir}/ce135.40103_1.jpg`)
          .and.includes(`${base}/${opts.dir}/ce135.40103_2.jpg`);

        done();
      }).catch(done);
    });

    it('gets image set url for a text', (done) => {
      mocks.http_get.resolves(stubs.cloudinary);

      formatter.set('gm24er_is', domain).then((urls) => {
        expect(urls).to.have.lengthOf(1).and.includes(`${base}/${opts.dir}/gm24er_1.jpg`);

        done();
      }).catch(done);
    });
  });
});
