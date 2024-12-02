import { jest } from '@jest/globals';
import { BasketController } from '../../controllers/basket-controller.js';
import { executeQueries } from '../../utils/execute-queries.js';

async function updateBasketInvalidOperation() {
    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 25, 200),
           (1002, 'Cabbage', 97, 39)
        `,
        `
        INSERT INTO Basket(customerId, productId, productQuantity)
        VALUES (1, 1000, 10),
        (1, 1001, 20)
        `,
    ]);

    const req = {
        body: {
            operation: 'invalid operation',
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.updateQuantityByOne(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

async function updateBasketNotExists() {
    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 29, 200),
           (1002, 'Cabbage', 97, 39)
        `,
        `
        INSERT INTO Basket(customerId, productId, productQuantity)
        VALUES (1, 1000, 10)
        `,
    ]);

    const req = {
        user: {
            customerId: 1,
        },
        body: {
            action: 'increment',
        },
        params: {
            productId: 1001,
        },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.removeProductFromBasket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

async function updateBasketOutOfStock() {
    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 29, 200),
           (1002, 'Cabbage', 97, 39)
        `,
        `
        INSERT INTO Basket(customerId, productId, productQuantity)
        VALUES (1, 1000, 10),
        (1, 1001, 29)
        `,
    ]);

    const req = {
        user: {
            customerId: 1,
        },
        body: {
            action: 'increment',
        },
        params: {
            productId: 1001,
        },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.updateQuantityByOne(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

async function updateBasketSuccessful() {
    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 29, 200),
           (1002, 'Cabbage', 97, 39)
        `,
        `
        INSERT INTO Basket(customerId, productId, productQuantity)
        VALUES (1, 1000, 10),
        (1, 1001, 20)
        `,
    ]);

    const req = {
        user: {
            customerId: 1,
        },
        body: {
            action: 'increment',
        },
        params: {
            productId: 1001,
        },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.updateQuantityByOne(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

const testBasketUpdaters = {
    updateBasketInvalidOperation,
    updateBasketNotExists,
    updateBasketOutOfStock,
}

export { testBasketUpdaters };