/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Directory Pages Routes.', () => {
  const collection = [
    {
      pageType: 'brands',
      uri: '/brands',
    },
    {
      pageType: 'parts',
      uri: '/parts',
    },
    {
      pageType: 'makes',
      uri: '/makes',
    },
  ];

  _.each(collection, (item) => {
    const url = _.get(item, 'uri', '');
    const name = _.get(item, 'pageType', '');

    it(`Returns aggregated response for Seo Directory ${_.capitalize(name)}`, (done) => {
      app.get(`/v1${url}`)
        .query({ domain: DOMAINS.CARPARTS })
        .then((response) => {
          const expectedKeys = [
            'breadcrumbs',
            'listing',
            'meta',
            'pageType',
            'widgets',
            'years',
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
});
