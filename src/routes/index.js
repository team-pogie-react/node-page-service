import express from 'express';
import apiV1 from './api/v1';
import cache from './cache';
import responseMiddleware from '../middlewares/response';
import IndexController from '../controllers/IndexController';

const routes = express.Router();
const index = new IndexController();

routes.use(responseMiddleware);
routes.get('/ping', index.ping);
routes.get('/health', index.health.bind(index));
routes.use('/cache', cache);
routes.use('/v1', apiV1);

export default routes;
