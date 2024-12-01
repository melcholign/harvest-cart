import React from 'react';
import './SearchBar.css'; // Add styles for centering

/**
 * SearchBar component
 * @param {function} onSearch - Callback triggered when search input changes.
 */
const SearchBar = ({ onSearch }) => {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search for products..."
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
