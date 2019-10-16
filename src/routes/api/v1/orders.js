import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import OrdersController from '../../../controllers/api/v1/OrdersController';

const routes = Router();
const controller = new OrdersController();

routes.get('/token', domainValidator, controller.getToken.bind(controller));
routes.get('/:orderId', domainValidator, controller.find.bind(controller));
routes.get('/:orderId/shipping-methods', domainValidator, controller.shippingMethods.bind(controller));

export default routes;
