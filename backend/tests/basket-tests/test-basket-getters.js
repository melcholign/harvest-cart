import { jest } from '@jest/globals';
import { BasketController } from '../../controllers/basket-controller.js';
import { executeQueries } from '../../utils/execute-queries.js';

async function getBasketWithNoChanges() {

    // Insert mock data
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

    // Mock request and response
    const req = {
        user: { customerId: 1 },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    // Test the controller
    await BasketController.getBasket(req, res);

    // Verify the response
    expect(res.json).toHaveBeenCalledWith({
        basket: [
            {
                id: 1000,
                name: 'Egg',
                category: 'miscellaneous',
                quantity: 10,
                unitPrice: 15,
            },
        ],
        changes: [],
    });

    // Cleanup mock data
    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

async function getBasketWithChanges() {

    // Insert mock data
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
    (1, 1001, 34)
    `,
    ]);

    // Mock request and response
    const req = {
        user: { customerId: 1 },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    // Test the controller
    await BasketController.getBasket(req, res);

    // Verify the response
    expect(res.json).toHaveBeenCalledWith({
        basket: [
            {
                id: 1000,
                name: 'Egg',
                category: 'miscellaneous',
                quantity: 10,
                unitPrice: 15,
            }, {
                id: 1001,
                name: 'Chicken',
                category: 'miscellaneous',
                quantity: 25,
                unitPrice: 200,
            }
        ],
        changes: [{
            id: 1001,
            name: 'Chicken',
            category: 'miscellaneous',
            basketQuantity: 34,
            stockQuantity: 25,
            unitPrice: 200,
        }],
    });

    // Cleanup mock data
    await executeQueries([
        `DELETE FROM Basket WHERE customerId = 1`,
        `DELETE FROM Product WHERE 1000 <= productId AND productId <= 1002`,
    ]);
}

const testBasketGetters = {
    getBasketWithNoChanges,
    getBasketWithChanges,
}

export { testBasketGetters };