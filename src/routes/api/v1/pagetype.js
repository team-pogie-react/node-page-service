import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import PagetypeController from '../../../controllers/api/v1/PagetypeController';

const routes = Router();
const controller = new PagetypeController();

routes.get('/', domainValidator, controller.route.bind(controller));

export default routes;