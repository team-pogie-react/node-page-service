/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Vehicles Routes', () => {
  it('returns top parts', (done) => {
    const limit = 10;

    app.get('/v1/vehicles/parts/top')
      .query({ domain: DOMAINS.CARPARTS, limit })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.have.lengthOf(limit);

        done();
      }).catch(done);
  });

  it('returns top makes', (done) => {
    const limit = 10;

    app.get('/v1/vehicles/makes/top')
      .query({ domain: DOMAINS.CARPARTS, limit })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.have.lengthOf(limit);

        done();
      }).catch(done);
  });

  it('returns Vehicle Category Parts', (done) => {
    app.get('/v1/vehicles/')
      .query({
        domain: DOMAINS.CARPARTS,
        year: 2017,
        model: 'Rapide',
        make: 'Aston_Martin',
        engine: '12_Cyl_6-dot-0L',
        submodel: 'S',
      })
      .then((response) => {
        const expectedKeys = [
          'metas',
          'widgets',
          'vehicle',
          'categoryPart',
        ];
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });
});
