import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import WorkCard from './components/WorkCard';
import WorkDetail from './components/WorkDetail';
import AdminPanel from './components/AdminPanel';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import Pagination from './components/Pagination';
import { getWorks, getSettings, getCategories, searchWorks } from './services/api';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(232, 245, 232, 0.4) 0%,
    rgba(200, 230, 201, 0.4) 20%,
    rgba(165, 214, 167, 0.4) 40%,
    rgba(255, 255, 224, 0.3) 60%,
    rgba(255, 255, 200, 0.3) 80%,
    rgba(240, 255, 240, 0.4) 100%
  );
  background-size: 400% 400%;
  animation: gentleShift 25s ease infinite;
  position: relative;
  
  &:before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(1px);
    pointer-events: none;
    z-index: -1;
  }
  
  @keyframes gentleShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const WorksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 18px;
`;

// 首页组件
const HomePage = ({ settings }) => {
  const [works, setWorks] = useState([]);
  const [allWorks, setAllWorks] = useState([]); // 存储所有作品数据
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // 从设置中获取每页作品数量，默认为9
  const itemsPerPage = settings['每页作品数量'] || 9;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [worksData, categoriesData] = await Promise.all([
        getWorks(),
        getCategories()
      ]);
      
      const allWorksData = worksData.data || [];
      setAllWorks(allWorksData);
      setWorks(allWorksData);
      setCategories(categoriesData.data || []);
      setCurrentPage(1); // 重置到第一页
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    await performSearch(query, selectedCategory);
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    await performSearch(searchQuery, category);
  };

  const performSearch = async (query, category) => {
    try {
      setLoading(true);
      if (query || category) {
        const searchData = await searchWorks(query, category);
        setAllWorks(searchData.data || []);
        setWorks(searchData.data || []);
      } else {
        const worksData = await getWorks();
        setAllWorks(worksData.data || []);
        setWorks(worksData.data || []);
      }
      setCurrentPage(1); // 搜索后重置到第一页
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 分页相关的计算
  const totalPages = Math.ceil(works.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorks = works.slice(startIndex, endIndex);

  // 处理页面变化
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainContent>
      <FilterSection>
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </FilterSection>
      
      {loading ? (
        <LoadingSpinner />
      ) : works.length > 0 ? (
        <>
          <WorksGrid>
            {currentWorks.map((work) => (
              <WorkCard key={work.作品ID} work={work} />
            ))}
          </WorksGrid>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={works.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <NoResults>
          {searchQuery || selectedCategory ? '🔍 没有找到匹配的作品' : '📝 暂无作品'}
        </NoResults>
      )}
    </MainContent>
  );
};

function App() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  return (
    <Router>
      <AppContainer>
        <Header settings={settings} />
        <Routes>
          <Route path="/" element={<HomePage settings={settings} />} />
          <Route path="/work/:workId" element={<WorkDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <Footer settings={settings} />
      </AppContainer>
    </Router>
  );
}

export default App;
