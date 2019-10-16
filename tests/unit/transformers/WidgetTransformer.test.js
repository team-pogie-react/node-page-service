/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import { search } from '../../stubs/widgets';
import WidgetTransformer from '../../../src/transformers/WidgetTransformer';

describe('WidgetTransformer', () => {
  const transformer = new WidgetTransformer();

  describe('collection()', () => {
    it('transforms a widget collection', () => {
      const result = transformer.collection([search]);

      expect(result).to.be.an('array').and.have.lengthOf(1);
      expect(result[0]).to.have.property('name').and.not.empty;
      expect(result[0]).to.have.property('widget').and.not.empty;
    });

    it('transforms a widget object to an array', () => {
      const result = transformer.collection(search);

      expect(result).to.be.an('array').and.have.lengthOf(1);
      expect(result[0]).to.have.property('name').and.not.empty;
      expect(result[0]).to.have.property('widget').and.not.empty;
    });
  });
});
