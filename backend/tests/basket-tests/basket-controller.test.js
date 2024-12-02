import { testBasketGetters } from './test-basket-getters.js';
import { testBasketAdders } from './test-basket-adders.js';
import { testBasketRemovers } from './test-basket-removers.js';
import { testBasketUpdaters } from './test-basket-updaters.js';
import { testBasketClearers } from './test-basket-clearers.js';
import { testBasketCheckout } from './test-basket-checkout.js';

// describe('Getting items from basket', () => {

//     test(
//         'Retrieving basket, with no changes necessary',
//         testBasketGetters.getBasketWithNoChanges
//     );
//     test(
//         'Retrieving basket, with changes to it due to inconsistency with stock',
//         testBasketGetters.getBasketWithChanges
//     );
// });

describe('Adding a product to basket', () => {
    test(
        'Adding a chicken to basket with no issue',
        testBasketAdders.addProductsSuccessful
    );

    test(
        'Unable to add chicken to basket due to stock shortage',
        testBasketAdders.addProductsOutOfStock
    );

    test(
        'Unable to re-add chicken to basket as it is already added',
        testBasketAdders.addProductsDuplicate
    );
});

describe('Removing a product from basket', () => {
    test(
        'Successfully remove a product from basket', 
        testBasketRemovers.removeProductSuccessful,
    );

    test(
        'Unable remove a product not in basket', 
        testBasketRemovers.removeProductNotInBasket,
    );
});

describe('Update product quantity in basket', () => {
    test(
        'Cannot update basket item due to invalid operation',
        testBasketUpdaters.updateBasketInvalidOperation,
    );

    test(
        'Cannot update basket item as it does not exist in the basket',
        testBasketUpdaters.updateBasketNotExists,
    );

    test(
        'Cannot increment basket item as it is out of stock',
        testBasketUpdaters.updateBasketOutOfStock,
    );
});

describe('Clearing a basket', () => {
    test(
        'Successfully clearing the basket', 
        testBasketClearers.clearBasketSuccessful,
    );

    test(
        'Cannot clear a basket that is already empty', 
        testBasketClearers.clearBasketAlreadyEmpty,
    );
});

describe('Preparing basket to proceed to checkout', () => {
    test(
        'Cannot checkout an empty basket',
        testBasketCheckout.checkoutBasketEmpty,
    );

    test(
        'Cannot checkout basket when one of the items exceed stock',
        testBasketCheckout.checkoutBasketExceedStock,
    );

    test(
        'Successfully checkout basket',
        testBasketCheckout.checkoutBasketSuccessful,
    );
});