/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import BlogService from '../../../src/services/Blog';

chai.use(chaiSubset);

describe('Blog Test', () => {
  const service = new BlogService();

  describe('#getPosts()', () => {
    it('gets post with limit', (done) => {
      service.getPosts(2).then((result) => {
        expect(result).to.have.lengthOf(2);
        expect(result[0]).to.include.all.keys(['title', 'link', 'content', 'imageSrc']);
        done();
      }).catch(done);
    });
  });
});
