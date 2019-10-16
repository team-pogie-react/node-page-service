import { Router } from 'express';
import CheckoutController from '../../../controllers/api/v1/CheckoutController';

const router = Router();
const controller = new CheckoutController();

router.get('/:orderId', controller.checkout.bind(controller));
router.get('/:orderId/qas', controller.qas.bind(controller));
router.get('/:orderId/review', controller.review.bind(controller));
router.get('/:orderId/payment', controller.payment.bind(controller));
router.get('/:orderId/confirmation', controller.confirmation.bind(controller));

export default router;
