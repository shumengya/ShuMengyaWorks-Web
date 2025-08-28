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
import { getWorks, getSettings, getCategories, searchWorks } from './services/api';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
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
const HomePage = () => {
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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
      
      setWorks(worksData.data || []);
      setCategories(categoriesData.data || []);
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
        setWorks(searchData.data || []);
      } else {
        const worksData = await getWorks();
        setWorks(worksData.data || []);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
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
        <WorksGrid>
          {works.map((work) => (
            <WorkCard key={work.作品ID} work={work} />
          ))}
        </WorksGrid>
      ) : (
        <NoResults>
          {searchQuery || selectedCategory ? '没有找到匹配的作品' : '暂无作品'}
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
          <Route path="/" element={<HomePage />} />
          <Route path="/work/:workId" element={<WorkDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <Footer settings={settings} />
      </AppContainer>
    </Router>
  );
}

export default App;
