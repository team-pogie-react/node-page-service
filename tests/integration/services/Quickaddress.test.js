/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { itOrSkip } from '../../helpers';
import QuickaddressService from '../../../src/services/Quickaddress';
import { DOMAINS } from '../../../src/configs/services/domains';
import { QuickaddressError } from '../../../src/errors';

chai.use(chaiAsPromised);
chai.should();

describe('Quickaddress Service Test', () => {
  const service = new QuickaddressService();
  const ORDER_ID = process.env.TEST_ORDER_ID;

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  itOrSkip('verifies address for order', ORDER_ID, (done) => {
    service.verify(ORDER_ID, {
      street: 'margay ave',
      suburb: '',
      city: 'carson',
      state: 'CA',
      country: 'US',
    }).then((result) => {
      expect(result).to.include.all.keys([
        'aPicklist',
        'sVerifyLevel',
        'sMoniker',
        'aFormattedAddress',
        'bMaxMatches',
        'bTimeout',
        'bIsAutoFormatSafe',
        'Address',
      ]);

      done();
    }).catch(done);
  });

  describe('refine()', () => {
    it(
      'returns null if srm was not provided',
      () => service.refine(11111).should.eventually.be.null,
    );

    it('rejects when invalid srm was provided', async () => {
      await service.refine(ORDER_ID, 'invalid-srm')
        .should.eventually.be.rejectedWith(QuickaddressError);
    });

    itOrSkip('gets refined address for order', ORDER_ID, (done) => {
      const SRM = 'jOUSADwHjBwMDAQAApQ1SAAAAAAAAZAA-';

      service.refine(ORDER_ID, SRM).then((result) => {
        expect(result).to.have.property('QAPicklist');
        expect(result.QAPicklist).to.include.all.keys(['FullPicklistMoniker', 'PicklistEntry']);

        done();
      }).catch(done);
    });
  });
});
