/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import { DOMAINS } from '../../../../src/configs/services/domains';

describe('Strapi Widget Test', () => {
  const widgets = new StrapiWidget();

  before(() => {
    widgets.setDomain(DOMAINS.CARPARTS);
  });

  it('gets widgets from strapi server by page type', (done) => {
    widgets.getByPage('home')
      .then((result) => {
        expect(result[0]).to.have.property('name', 'HeaderFirst');

        done();
      })
      .catch(done);
  });
});
