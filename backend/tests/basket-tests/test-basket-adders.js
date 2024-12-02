import { jest } from '@jest/globals';
import { BasketController } from '../../controllers/basket-controller.js';
import { executeQueries } from '../../utils/execute-queries.js';

async function addProductsSuccessful() {
    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 25, 200),
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
            productId: 1001,
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.addProductToBasket(req, res);

    expect(res.status).toHaveBeenCalledWith(202);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

async function addProductsOutOfStock() {
    // chicken is out of stock

    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 0, 200),
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
            productId: 1001,
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.addProductToBasket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

async function addProductsDuplicate() {

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
           (1, 1001, 9)
    `,
    ]);

    const req = {
        user: {
            customerId: 1,
        },
        body: {
            productId: 1001,
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.addProductToBasket(req, res);

    expect(res.status).toHaveBeenCalledWith(409);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

const testBasketAdders = {
    addProductsSuccessful,
    addProductsOutOfStock,
    addProductsDuplicate
}

export { testBasketAdders };