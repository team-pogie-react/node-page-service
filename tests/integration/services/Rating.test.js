/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import RatingService from '../../../src/services/Rating';
import { DOMAINS } from '../../../src/configs/services/domains';

chai.use(chaiSubset);

describe('Rating Service', () => {
  const service = new RatingService();
  service.setDomain(DOMAINS.CARPARTS);

  it('gets reseller token', (done) => {
    service.getResellerToken()
      .then((result) => {
        expect(result).to.not.be.null;
        expect(result).to.be.a('string');

        done();
      })
      .catch(done);
  });

  describe('Reseller', () => {
    let token;

    before((done) => {
      service.getResellerToken()
        .then((result) => {
          token = result;
          done();
        })
        .catch(done);
    });

    it('gets reseller ratings', (done) => {
      service.getResellerRatings(token)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result).to.include.keys(['overall', 'link']);
          expect(result.link).to.contain('resellerratings');

          done();
        })
        .catch(done);
    });

    it('gets reseller ratings review', (done) => {
      service.getResellerReviews(token)
        .then((result) => {
          const expectedKeys = ['rating', 'username', 'title', 'comment'];

          expect(result).to.be.an('array').and.to.have.lengthOf(3);
          expect(result[0]).to.include.keys(expectedKeys);
          expect(result[0].rating).to.be.a('Number');
          expect(result[0].username).to.not.be.empty;
          expect(result[0].title).to.not.be.empty;
          expect(result[0].comment).to.not.be.empty;

          done();
        })
        .catch(done);
    });

    it('combines reseller rating and review', (done) => {
      service.getResellerInfo()
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result).to.include.keys(['rating', 'reviews']);

          done();
        })
        .catch(done);
    });
  });
});
