import React, { useState } from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    border-color: #81c784;
    box-shadow: 0 0 0 3px rgba(129, 199, 132, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: #81c784;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #66bb6a;
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const SearchIcon = styled.span`
  color: white;
  font-size: 16px;
`;

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          placeholder="搜索作品名称、描述或标签..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <SearchButton type="submit">
          <SearchIcon>🔍</SearchIcon>
        </SearchButton>
      </form>
    </SearchContainer>
  );
};

export default SearchBar;
