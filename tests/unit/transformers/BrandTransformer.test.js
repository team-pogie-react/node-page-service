/* eslint-env mocha */
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import stubs from '../../stubs/seo';
import BrandTransformer from '../../../src/transformers/BrandTransformer';
import BrandModel from '../../../src/models/BrandModel';
import Image from '../../../src/core/Image';

chai.use(chaiSubset);

describe('BrandTransformer', () => {
  const transformer = new BrandTransformer();
  const domain = 'carparts.com';

  describe('topBrands()', () => {
    it('transforms top brands collection', () => {
      const result = transformer.topBrands(stubs.topBrands, domain);

      expect(result).to.be.an('array').and.have.lengthOf(4);
      expect(result).to.containSubset([new BrandModel({
        text: stubs.topBrands['50010e45738b4d2042000000'].tags.brand,
        url: stubs.topBrands['50010e45738b4d2042000000'].uri,
        image: Image.url(stubs.topBrands['50010e45738b4d2042000000'].tags.brand, domain) 
      })]);
      expect(result).to.containSubset([new BrandModel({
        text: stubs.topBrands['50010e45738b4d2042000001'].tags.brand,
        url: stubs.topBrands['50010e45738b4d2042000001'].uri,
        image: Image.url(stubs.topBrands['50010e45738b4d2042000001'].tags.brand, domain) 
      })]);
      expect(result).to.containSubset([new BrandModel({
        text: stubs.topBrands['50010e45738b4d2042000004'].tags.brand,
        url: stubs.topBrands['50010e45738b4d2042000004'].uri,
        image: Image.url(stubs.topBrands['50010e45738b4d2042000004'].tags.brand, domain) 
      })]);
      expect(result).to.containSubset([new BrandModel({
        text: stubs.topBrands['50010e45738b4d2042000005'].tags.brand,
        url: stubs.topBrands['50010e45738b4d2042000005'].uri,
        image: Image.url(stubs.topBrands['50010e45738b4d2042000005'].tags.brand, domain) 
      })]);
    });

    it('transforms top brands collection with invalid brand value', () => {
      const fn = () => transformer.topBrands(stubs.topBrands_wTypeError_brand, domain);
      expect(fn).to.throw(TypeError, /Not String/);
    });

    it('transforms top brands collection with invalid url value', () => {
      const fn = () => transformer.topBrands(stubs.topBrands_wTypeError_uri, domain);
      expect(fn).to.throw(TypeError, /Not String/);
    });
  });
});
