import { Router } from 'express';
import pages from './pages';
import pagetype from './pagetype';
import domainValidator from '../../../middlewares/api/domain-validator';
import ieCacheHeaders from '../../../middlewares/api/ie-cache-headers';

const routes = Router();


routes.use('/', pages);
routes.use('/pagetype', pagetype);

export default routes;

