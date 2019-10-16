import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import NomatchController from '../../../controllers/api/v1/NomatchController';

const routes = Router();
const controller = new NomatchController();

routes.get('/', domainValidator, controller.index.bind(controller));

export default routes;
