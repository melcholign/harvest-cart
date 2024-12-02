import { jest } from '@jest/globals';
import { BasketController } from '../../controllers/basket-controller.js';
import { executeQueries } from '../../utils/execute-queries.js';

async function clearBasketSuccessful() {
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
        user: {
            customerId: 1,
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.clearBasket(req, res);

    expect(res.status).toHaveBeenCalledWith(204);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

async function clearBasketAlreadyEmpty() {
    await executeQueries([
        `
        INSERT INTO Product(productId, productName, stockQuantity, price)
        VALUES (1000, 'Egg', 100, 15),
           (1001, 'Chicken', 29, 200),
           (1002, 'Cabbage', 97, 39)
        `,
    ]);

    const req = {
        user: {
            customerId: 1,
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await BasketController.clearBasket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

const testBasketClearers = {
    clearBasketSuccessful,
    clearBasketAlreadyEmpty,
}

export { testBasketClearers };