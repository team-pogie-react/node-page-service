import { Router } from 'express';
import CacheController from '../controllers/CacheController';

const routes = Router();
const controller = new CacheController();

routes.get('/', controller.index.bind(controller));
routes.delete('/', controller.flush.bind(controller));
routes.get('/:key', controller.find.bind(controller));
routes.delete('/:key', controller.delete.bind(controller));

export default routes;
