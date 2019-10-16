import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import DirectoryController from '../../../controllers/api/v1/DirectoryController';

const routes = Router();
const controller = new DirectoryController();

routes.get('/brands', domainValidator, controller.brands.bind(controller));
routes.get('/makes', domainValidator, controller.makes.bind(controller));
routes.get('/parts', domainValidator, controller.parts.bind(controller));

export default routes;
