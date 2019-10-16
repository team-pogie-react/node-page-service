import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import StaticPagesController from '../../../controllers/api/v1/StaticPagesController';

const router = Router();
const controller = new StaticPagesController();

router.get('/', domainValidator, controller.index.bind(controller));
router.post('/form/:type', domainValidator, controller.forms.bind(controller));

export default router;
