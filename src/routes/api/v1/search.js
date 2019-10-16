import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import SearchController from '../../../controllers/api/v1/SearchController';

const routes = Router();
const controller = new SearchController();

routes.get('/', domainValidator, controller.search.bind(controller));

export default routes;
