/* eslint-env mocha */
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import stubs from '../../stubs/breadcrumbs';
import BreadcrumbTransformer from '../../../src/transformers/BreadcrumbTransformer';
import BreadcrumModel from '../../../src/models/BreadcrumbModel';

chai.use(chaiSubset);

describe('BreadcrumbTransformer', () => {
  const transformer = new BreadcrumbTransformer();

  it('transforms breadcrumb for home page', () => {
    const result = transformer.collection(stubs.home);

    expect(result[0]).to.be.instanceOf(BreadcrumModel);
    expect(result).to.have.lengthOf(1);
    expect(result).to.containSubset([new BreadcrumModel({ text: 'Car Parts', value: '/' })]);
  });
});
