/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import stubs from '../../stubs/categories';
import CategoryTransformer from '../../../src/transformers/CategoryTransformer';

describe('CategoryTransformer', () => {
  const transformer = new CategoryTransformer();
  const domain = 'carparts.com';
  const baseImageUrl = `${process.env.CP_BASE_IMAGE_URL}`;

  describe('collection()', () => {
    it('transforms collection up to category', () => {
      const result = transformer.collection(stubs.upToCategory, domain);

      expect(result).to.be.an('array').and.has.lengthOf(1);
      expect(result[0]).to.have.property('text', 'Top Level');
      expect(result[0]).to.have.property('image');
      expect(result[0].image).to.contain(`${baseImageUrl}/top_level`);
      expect(result[0]).to.have.property('categories');
      expect(result[0].categories[0]).to.have.property('text', 'Category');
      expect(result[0].categories[0]).to.have.property('image');
    });

    it('transforms collection up to subcategory', () => {
      const result = transformer.collection(stubs.upToSubCategory, domain);

      expect(result).to.be.an('array').and.has.lengthOf(1);
      expect(result[0]).to.have.property('text', 'Top Level');
      expect(result[0]).to.have.property('categories').that.is.an('array');
      expect(result[0].categories[0]).to.have.property('text', 'Category');
      expect(result[0].categories[0]).to.have.property('image');
      expect(result[0].categories[0].image).to.contain(`${baseImageUrl}/category`);
      expect(result[0].categories[0]).to.have.deep.property('subcategories');
    });

    it('transforms collection up to part name', () => {
      const result = transformer.collection(stubs.upToPartName, domain);

      expect(result).to.be.an('array').and.has.lengthOf(1);
      expect(result[0]).to.have.property('text', 'Top Level');
      expect(result[0]).to.have.property('categories').that.is.an('array');
      expect(result[0].categories[0]).to.have.property('subcategories').that.is.an('array');
      expect(result[0].categories[0].subcategories[0]).to.have.deep.property('partnames');
    });

    it('transforms two sets of categories', () => {
      const result = transformer.collection(stubs.complete, domain);

      expect(result).to.be.an('array').and.has.lengthOf(2);
      expect(result[0]).to.have.property('text', 'Interior Accessories');
      expect(result[0].categories[0]).to.have.property('subcategories');
      expect(result[1]).to.have.property('text', 'Auto Body Parts & Mirrors');
      expect(result[1].categories[0]).to.have.property('subcategories');
    });
  });

  describe('untilCategories()', () => {
    it('transforms items up to category of complete collection', () => {
      const result = transformer.untilCategories(stubs.upToPartName, domain);

      expect(result).to.be.an('array').and.has.lengthOf(1);
      expect(result[0]).to.have.property('text', 'Top Level');
      expect(result[0]).to.have.property('link', '/top-level');
      expect(result[0]).to.not.have.property('image');
      expect(result[0]).to.have.property('categories').that.is.an('array');
      expect(result[0].categories[0]).to.have.property('image');
      expect(result[0].categories[0]).to.not.have.property('subcategories');
    });
  });
});
