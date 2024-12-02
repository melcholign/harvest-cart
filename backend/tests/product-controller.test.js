import { rateProduct } from './productController';
import { ProductModel } from './productModel';

// Mock dependencies
jest.mock('./productModel');

describe('rateProduct', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { productId: 1 },
            body: { rating: 4 },
            user: { customerId: 123 },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return 400 if rating is invalid', async () => {
        req.body.rating = 6; // Invalid rating
        await rateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: { message: "Invalid rating value. Must be an integer between 1 and 5." },
        });
    });

    it('should return 404 if product does not exist', async () => {
        ProductModel.getProducts.mockResolvedValue([]);
        await rateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: { message: "Product not found" },
        });
    });

    it('should return 403 if customer is not eligible to rate', async () => {
        ProductModel.getProducts.mockResolvedValue([{}]); // Mock product exists
       
        await rateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: { message: "You can only rate products you have purchased" },
        });
    });

    it('should return 200 if rating is saved successfully', async () => {
        ProductModel.getProducts.mockResolvedValue([{}]); // Mock product exists
        
        ProductModel.rateProduct.mockResolvedValue();
        await rateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { message: "Rating saved successfully" },
        });
    });

    it('should return 500 on internal server error', async () => {
        ProductModel.getProducts.mockRejectedValue(new Error('Database error'));
        await rateProduct(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: { message: "Internal server error" },
        });
    });
});
