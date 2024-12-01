import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import './Homepage.css'; // Add styles for layout

/**
 * Homepage component
 */
const Homepage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const products = [
        {
            name: 'Apple',
            category: 'Fruits',
            price: 2,
            image: 'https://via.placeholder.com/150',
        },
        {
            name: 'Orange',
            category: 'Fruits',
            price: 3,
            image: 'https://via.placeholder.com/150',
        },
        {
            name: 'Carrot',
            category: 'Vegetables',
            price: 1,
            image: 'https://via.placeholder.com/150',
        },
    ];

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="homepage">
            <SearchBar onSearch={setSearchTerm} />
            <div className="product-list">
                {filteredProducts.map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    );
};

export default Homepage;
