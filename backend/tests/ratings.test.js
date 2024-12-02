import { jest } from '@jest/globals';
import { ProductController } from '../../controllers/product-controller.js';
import { executeQueries } from '../../utils/execute-queries.js';

beforeEach(async () => {
    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 25, 200),
           (1002, 'Cabbage', 97, 39)
        `,
    ]);
});

afterEach(async () => {
    await executeQueries([
        'DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002',
    ]);
});

describe('Invalid ratings', () => {

    test('No rating is invalid', async () => {
        const req = {
            user: {
                customerId: 1,
            },
            params: {
                productId: 1000
            },
            body: {

            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await ProductController.rateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Rating less than 1 is invalid', async () => {
        const req = {
            user: {
                customerId: 1,
            },
            params: {
                productId: 1000
            },
            body: {
                rating: 0,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await ProductController.rateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Rating greater than 5 is invalid', async () => {
        const req = {
            user: {
                customerId: 1,
            },
            params: {
                productId: 1000
            },
            body: {
                rating: 10,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await ProductController.rateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Non-integer rating is invalid', async () => {
        const req = {
            user: {
                customerId: 1,
            },
            params: {
                productId: 1000
            },
            body: {
                rating: 3.5,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await ProductController.rateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

test('Cannot find product', async () => {
    const req = {
        user: {
            customerId: 1,
        },
        params: {
            productId: 2222,
        },
        body: {
            rating: 4,
        },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await ProductController.rateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
});

test('Cannot rate product due to not purchasing it', async () => {
    const req = {
        user: {
            customerId: 1,
        },
        params: {
            productId: 1000,
        },
        body: {
            rating: 4,
        },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await ProductController.rateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
});

test('Successfully rated product', async () => {
    await executeQueries([
        `
        INSERT INTO Payment(paymentId, customerId, paymentMethod, paymentStatus, amount)
        VALUES(500, 1, 'cod', 'paid', 2500);
        `,
        `
        INSERT INTO CustomerOrder
            (orderId, customerId, paymentId, shippingAddress, orderTotal, orderStatus)
        VALUES (1000, 1, 500, 'Uttara', 2500, 'delivered')
        `,
        `
        INSERT INTO OrderItem(orderId, productId, productQuantity)
        VALUES (1000, 1000, 5)
        `
    ]);

    const req = {
        user: {
            customerId: 1,
        },
        params: {
            productId: 1000,
        },
        body: {
            rating: 4,
        },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await ProductController.rateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    await executeQueries([
        'DELETE FROM OrderItem WHERE orderId = 1000',
       ' DELETE FROM CustomerOrder WHERE orderId = 1000',
        'DELETE FROM Payment WHERE paymentId = 500',
        'DELETE FROM Rating WHERE customerId = 1 AND productId = 1000',
    ])
});