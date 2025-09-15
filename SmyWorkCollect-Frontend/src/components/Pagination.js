import React from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
  gap: 10px;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #81c784;
  background: ${props => props.active ? '#81c784' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.active ? 'white' : '#2e7d32'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 40px;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? '#66bb6a' : '#e8f5e8'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(129, 199, 132, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
    min-width: 35px;
  }
`;

const PageInfo = styled.div`
  color: #666;
  font-size: 14px;
  margin: 0 10px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    margin: 0 5px;
  }
`;

const Ellipsis = styled.span`
  color: #666;
  padding: 0 5px;
  font-weight: bold;
`;

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // 最多显示7个页码按钮
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 复杂的分页逻辑
      if (currentPage <= 4) {
        // 当前页在前面
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 当前页在后面
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <PaginationContainer>
      {/* 上一页按钮 */}
      <PaginationButton
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← 上一页
      </PaginationButton>

      {/* 页码按钮 */}
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
        ) : (
          <PaginationButton
            key={page}
            active={page === currentPage}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </PaginationButton>
        )
      ))}

      {/* 下一页按钮 */}
      <PaginationButton
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        下一页 →
      </PaginationButton>

      {/* 页面信息 */}
      <PageInfo>
        第 {startItem}-{endItem} 项，共 {totalItems} 项
      </PageInfo>
    </PaginationContainer>
  );
};

export default Pagination;
