import { Router } from 'express';
import ieCacheHeaders from '../../../middlewares/api/ie-cache-headers';
import CartController from '../../../controllers/api/v1/CartController';

const routes = Router();
const controller = new CartController();

routes.get('/savequote', controller.saveQuote.bind(controller));
routes.get('/getquote', controller.getQuote.bind(controller));
routes.get('/:orderId', ieCacheHeaders, controller.getByOrderId.bind(controller));

export default routes;
