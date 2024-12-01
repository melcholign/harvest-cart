/**
 * Middleware for user authentication.
 * Ensures that the user is authenticated before proceeding.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Callback to the next middleware.
 */
const authenticate = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
    }
    next();
};

/**
 * Handles the submission of product ratings.
 * Allows authenticated users to rate a product if they have purchased it.
 * @route POST /products/:id/rate
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - ID of the product to rate.
 * @param {Object} req.body - Request body containing rating value.
 * @param {number} req.body.rating - The rating value (1-5).
 * @param {Object} res - Express response object.
 */
app.post('/products/:id/rate', authenticate, async (req, res) => {
    const productId = req.params.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).send("Invalid rating value. Must be between 1 and 5.");
    }

    try {
        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Check if user is eligible to rate (mock validation)
        const userEligible = await Order.exists({ userId: req.user.id, productId });
        if (!userEligible) {
            return res.status(403).send("You can only rate products you have purchased");
        }

        // Add or update the user's rating
        const existingRating = product.ratings.find(r => r.userId.equals(req.user.id));
        if (existingRating) {
            existingRating.value = rating; // Update the existing rating
        } else {
            product.ratings.push({ userId: req.user.id, value: rating }); // Add a new rating
        }

        await product.save(); // Save the updated product
        res.status(200).send("Rating saved successfully");
    } catch (error) {
        res.status(500).send("Internal server error");
    }
});

/**
 * Mongoose schema for a Product.
 * @typedef {Object} Product
 * @property {string} name - Name of the product.
 * @property {string} category - Category of the product.
 * @property {number} price - Price of the product.
 * @property {Array<Object>} ratings - Array of rating objects.
 * @property {ObjectId} ratings[].userId - ID of the user who rated the product.
 * @property {number} ratings[].value - Rating value (1-5).
 * @property {Date} createdAt - Timestamp of when the product was created.
 * @property {Date} updatedAt - Timestamp of when the product was last updated.
 */
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    ratings: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            value: { type: Number, min: 1, max: 5 },
        },
    ],
    createdAt: Date,
    updatedAt: Date,
});

const Product = mongoose.model("Product", productSchema);
