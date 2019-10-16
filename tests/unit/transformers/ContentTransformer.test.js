/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import stubs from '../../stubs/contents';
import ContentTransformer from '../../../src/transformers/ContentTransformer';

describe('ContentTransformer', () => {
  const transformer = new ContentTransformer();

  it('transforms collection of promotional banners', () => {
    const result = transformer.banners(stubs.banners);

    expect(result).to.have.lengthOf(2);
    expect(result[0]).to.include.all.keys(['text', 'image', 'keyword', 'priority']);
  });

  it('transforms contents for home page', () => {
    const result = transformer.forHome(stubs.home);

    expect(result).to.include.all.keys([
      'featuredBrands',
      'featuredMakes',
      'featuredParts',
    ]);
  });
});
