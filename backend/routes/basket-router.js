import express from 'express';
import { BasketController } from '../controllers/basket-controller.js';
import { isAuthenticated } from '../middlewares/is-authenticated.js';
import { blockDuringCheckout } from '../middlewares/checkout-auth.js';

const router = express.Router();

router.use(isAuthenticated);

router.get('/', BasketController.getBasket);

router.use(blockDuringCheckout);

router.post('/', BasketController.addProductToBasket);
router.delete('/', BasketController.clearBasket);
router.patch('/:productId', BasketController.updateQuantityByOne);
router.delete('/:productId', BasketController.removeProductFromBasket);

export {
    router as basketRouter,
}