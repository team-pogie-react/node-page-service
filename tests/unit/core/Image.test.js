/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import sinon from 'sinon';
import { each } from 'lodash';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import stubs from '../../stubs/images_response';
import BaseFormatter from '../../../src/core/library/image/BaseFormatter';
import Image from '../../../src/core/Image';

chai.use(sinonChai);

describe('Image Test', () => {
  const domain = 'carparts.com';
  const base = 'http://image.com';
  const defaultQuery = 'defaultImage=noimage';

  beforeEach(() => {
    // override base image url
    process.env.CP_BASE_IMAGE_URL = base;

    delete process.env.IMAGE_SOURCE;
  });

  describe('url()', () => {
    it('throws a TypeError error if source is invalid', () => {
      process.env.IMAGE_SOURCE = 'giggle';
      const fn = () => Image.url('A & B', domain);

      expect(fn).to.throw(TypeError, /Invalid/);
    });

    it('uses scene7 as formatter', () => {
      process.env.IMAGE_SOURCE = 'scene7';

      expect(Image.url('A & B', domain)).to.be.equal(`${base}/a_-and-_b?${defaultQuery}`);
    });

    it('uses cloudinary as formatter', () => {
      process.env.IMAGE_SOURCE = 'cloudinary';
      const dir = 'Autos';

      expect(Image.url('A & B', domain, { dir }))
        .to.be.equal(`${base}/upload/d_noimage.jpg/${dir}/a_-and-_b.jpg`);
    });
  });

  describe('set()', () => {
    const sources = Image.SOURCES;
    const Scene7Mock = sinon.stub().callsFake(() => ({ set: () => Promise.resolve('scene7') }));
    const CloudinaryMock = sinon.stub().callsFake(() => ({ set: () => Promise.resolve('cloud') }));

    beforeEach(() => {
      Object.defineProperty(Image, 'SOURCES', {
        get: () => ({
          scene7: Scene7Mock,
          cloudinary: CloudinaryMock,
        }),
      });
    });

    afterEach(() => {
      Object.defineProperty(Image, 'SOURCES', { get: () => sources });
    });

    it('uses scene7 to get image set', (done) => {
      process.env.IMAGE_SOURCE = 'scene7';

      Image.set('some_sku', domain).then((result) => {
        expect(result).to.be.equal('scene7');

        done();
      }).catch(done);
    });

    it('uses cloudinary to get image set', (done) => {
      process.env.IMAGE_SOURCE = 'cloudinary';

      Image.set('some_sku', domain).then((result) => {
        expect(result).to.be.equal('cloud');

        done();
      }).catch(done);
    });
  });
});
