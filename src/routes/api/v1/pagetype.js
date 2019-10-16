import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import PageTypeController from '../../../controllers/api/v1/PageTypeController';

const routes = Router();
const controller = new PageTypeController();

routes.get('/', domainValidator, controller.route.bind(controller));

export default routes;
