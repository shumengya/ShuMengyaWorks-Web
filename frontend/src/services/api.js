import axios from 'axios';

// 配置API基础URL
const getApiBaseUrl = () => {
  // 如果设置了环境变量，优先使用
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 生产环境使用相对路径（需要代理）或绝对路径
  if (process.env.NODE_ENV === 'production') {
    // 如果前后端部署在同一域名下，使用相对路径
    return '/api';
    // 如果后端部署在不同地址，请修改为后端的完整URL
    // return 'http://your-backend-domain.com:5000/api';
  }
  
  // 开发环境使用localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 获取网站设置
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

// 获取所有作品
export const getWorks = async () => {
  const response = await api.get('/works');
  return response.data;
};

// 获取单个作品详情
export const getWorkDetail = async (workId) => {
  const response = await api.get(`/works/${workId}`);
  return response.data;
};

// 搜索作品
export const searchWorks = async (query = '', category = '') => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (category) params.append('category', category);
  
  const response = await api.get(`/search?${params.toString()}`);
  return response.data;
};

// 获取所有分类
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// 点赞作品
export const likeWork = async (workId) => {
  const response = await api.post(`/like/${workId}`);
  return response.data;
};

export default api;
