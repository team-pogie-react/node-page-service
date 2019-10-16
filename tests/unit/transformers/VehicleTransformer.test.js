/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import stubs from '../../stubs/seo';
import VehicleTransformer from '../../../src/transformers/VehicleTransformer';

describe('VehicleTransformer', () => {
  const domain = 'carparts.com';
  const transformer = new VehicleTransformer();

  describe('topParts()', () => {
    it('transforms top parts collection', () => {
      const result = transformer.topParts(stubs.topParts, domain);

      expect(result).to.be.an('array').and.have.lengthOf(2);
      expect(result[0]).to.have.property('image').and.not.empty;
      expect(result[0]).to.have.property('text').and.not.empty;
      expect(result[0]).to.have.property('link').and.not.empty;
    });
  });

  describe('topMakes()', () => {
    it('transforms top makes collection', () => {
      const result = transformer.topMakes(stubs.topMakes, domain);

      expect(result).to.be.an('array').and.have.lengthOf(2);
      expect(result[0]).to.have.property('image').and.not.empty;
      expect(result[0]).to.have.property('text').and.not.empty;
      expect(result[0]).to.have.property('link').and.not.empty;
    });
  });
});
