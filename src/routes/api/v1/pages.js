import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import PagesController from '../../../controllers/api/v1/PagesController';

const routes = Router();
const controller = new PagesController();

routes.get('/home', domainValidator, controller.home.bind(controller));
routes.get('/pages', domainValidator, controller.route.bind(controller));
export default routes;
