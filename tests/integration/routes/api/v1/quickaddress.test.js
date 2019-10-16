/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { itOrSkip } from '../../../../helpers';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Checkout Routes', () => {
  const ORDER_ID = process.env.TEST_ORDER_ID;

  itOrSkip('verifies quickaddress', ORDER_ID, (done) => {
    app.get(`/v1/quickaddress/${ORDER_ID}/verify`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys([
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

  itOrSkip('refines quickaddress', ORDER_ID, (done) => {
    const SRM = 'jOUSADwHjBwMDAQAApQ1SAAAAAAAAZAA-';

    app.get(`/v1/quickaddress/${ORDER_ID}/refine`)
      .query({ domain: DOMAINS.CARPARTS, srm: SRM })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.have.property('QAPicklist');
        response.body.data.QAPicklist.should.include.all.keys([
          'FullPicklistMoniker',
          'PicklistEntry',
          'Prompt',
          'Total',
        ]);

        done();
      }).catch(done);
  });
});
