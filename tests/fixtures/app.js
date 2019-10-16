import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../src/app';

chai.should();
chai.use(chaiHttp);

const kernel = chai.request(app).keepOpen();

export { expect };
export default kernel;
