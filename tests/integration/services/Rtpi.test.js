/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { size } from 'lodash';
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import RtpiService from '../../../src/services/Rtpi';
import { DOMAINS } from '../../../src/configs/services/domains';

chai.use(chaiSubset);

describe('RTPI Test', () => {
  const service = new RtpiService();

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('#getPrices()', () => {
    it('gets prices of given product ids', (done) => {
      service.getPrices([1133007, 1044164]).then((result) => {
        expect(size(result)).to.be.equal(2);
        expect(result['1133007']).to.not.be.null;
        expect(result['1044164']).to.not.be.null;
        done();
      }).catch(done);
    });
  });
});
