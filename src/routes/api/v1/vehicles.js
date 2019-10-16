import { Router } from 'express';
import domainValidator from '../../../middlewares/api/domain-validator';
import VehiclesController from '../../../controllers/api/v1/VehiclesController';

const router = Router();
const controller = new VehiclesController();

router.get('/shop', domainValidator, controller.isShopVehicle.bind(controller));
router.get('/selector/:type', domainValidator, controller.getVehicleSelector.bind(controller));
router.get('/', domainValidator, controller.getVehicleIdByYMM.bind(controller));

export default router;
