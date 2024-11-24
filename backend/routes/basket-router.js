import express from 'express';
import { BasketController } from '../controllers/basket-controller.js';
import { isAuthenticated } from '../middlewares/is-authenticated.js';

const router = express.Router();

router.get('/', isAuthenticated, BasketController.getBasket);
router.delete('/', isAuthenticated, BasketController.clearBasket);
router.post('/products', isAuthenticated, BasketController.addProductToBasket);
router.patch('/products/:productId', isAuthenticated, BasketController.updateQuantityByOne);
router.delete('/products/:productId', isAuthenticated, BasketController.removeProductFromBasket);

export {
    router as basketRouter,
}