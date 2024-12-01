import React, { useState } from 'react';
import './ProductCard.css'; // Add styles for the card

/**
 * ProductCard component
 * @param {Object} product - Product details.
 */
const ProductCard = ({ product }) => {
    const [rating, setRating] = useState(0);

    const handleRating = (newRating) => {
        setRating(newRating);
        // Handle rating submission logic here (e.g., API call)
    };

    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
            <p>Category: {product.category}</p>
            <p>Price: ${product.price}</p>
            <div className="rating">
                <span>Rate:</span>
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        className={num <= rating ? 'rated' : ''}
                        onClick={() => handleRating(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductCard;
