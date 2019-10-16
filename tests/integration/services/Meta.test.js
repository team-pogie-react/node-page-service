/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { find, map, flatten } from 'lodash';
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import MetaService from '../../../src/services/Meta';
import { DOMAINS } from '../../../src/configs/services/domains';
import metas from '../../../src/configs/services/metas';

chai.use(chaiSubset);

describe('Metas Test', () => {
  const service = new MetaService();

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('#getByPage()', () => {
    const getContent = (tags) => {
      const result = map(tags, 'properties');
      const object = find(flatten(result), o => o.key === 'content');

      return object.value;
    };

    it('gets meta for home', (done) => {
      service.getByPage(metas.HOME, {}).then((result) => {
        expect(result).to.have.property('title').that.contains('The Right Auto Parts for the Right Price');
        expect(result).to.have.property('tags').that.is.an('array').and.has.lengthOf(2);
        expect(result.tags).to.containSubset([{ properties: [{ key: 'charset', value: 'utf-8' }] }]);
        expect(result.tags).to.containSubset([{
          properties: [
            { key: 'name', value: 'description' },
            { key: 'content' },
          ],
        }]);

        expect(getContent(result.tags)).to.contain('one-stop shop');
        done();
      }).catch(done);
    });

    it('gets meta for make', (done) => {
      service.getByPage(metas.MAKE, { make: 'Honda' }).then((result) => {
        expect(result).to.have.property('title').that.contains('Honda');
        expect(result).to.have.property('tags').that.is.an('array').and.has.lengthOf(2);
        expect(result.tags).to.containSubset([{
          properties: [
            { key: 'name', value: 'description' },
            { key: 'content' },
          ],
        }]);

        expect(getContent(result.tags)).to.contain('Honda');
        done();
      }).catch(done);
    });
  });
});
