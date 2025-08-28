import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: #2e7d32;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #333;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  
  &:focus {
    border-color: #81c784;
    box-shadow: 0 0 0 3px rgba(129, 199, 132, 0.1);
  }
  
  &:hover {
    border-color: #81c784;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const handleChange = (e) => {
    onCategoryChange(e.target.value);
  };

  return (
    <FilterContainer>
      <FilterLabel htmlFor="category-filter">分类筛选:</FilterLabel>
      <FilterSelect
        id="category-filter"
        value={selectedCategory}
        onChange={handleChange}
      >
        <option value="">全部分类</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </FilterSelect>
    </FilterContainer>
  );
};

export default CategoryFilter;
