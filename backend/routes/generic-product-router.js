import express from 'express';
import { ProductController } from '../controllers/product-controller.js';
import { isAuthenticated } from '../middlewares/is-authenticated.js';

const router = express.Router();

router.get('/', ProductController.searchProducts);
router.post('/:productId/ratings', isAuthenticated, ProductController.rateProduct);

export {
    router as genericProductRouter,
}