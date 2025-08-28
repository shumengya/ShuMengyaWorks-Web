import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';
import WorkEditor from './WorkEditor';
import { setAdminToken, adminGetWorks, adminDeleteWork } from '../services/adminApi';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const AdminHeader = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
`;

const AdminTitle = styled.h1`
  color: #2e7d32;
  font-size: 1.8rem;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'danger' ? '#f44336' : '#81c784'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#d32f2f' : '#66bb6a'};
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    width: 100%;
  }
`;

const WorksList = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const WorkItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const WorkInfo = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const WorkTitle = styled.h3`
  color: #2e7d32;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
`;

const WorkMeta = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
`;

const WorkActions = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SmallButton = styled.button`
  background: ${props => {
    if (props.variant === 'danger') return '#f44336';
    if (props.variant === 'secondary') return '#757575';
    return '#81c784';
  }};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;
  
  &:hover {
    background: ${props => {
      if (props.variant === 'danger') return '#d32f2f';
      if (props.variant === 'secondary') return '#616161';
      return '#66bb6a';
    }};
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const AdminPanel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingWork, setEditingWork] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token !== 'shumengya520') {
      navigate('/');
      return;
    }
    
    setAdminToken(token);
    loadWorks();
  }, [searchParams, navigate]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminGetWorks();
      if (response.success) {
        setWorks(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('加载作品失败:', error);
      setError('加载作品失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWork = () => {
    setEditingWork(null);
    setShowEditor(true);
  };

  const handleEditWork = (work) => {
    setEditingWork(work);
    setShowEditor(true);
  };

  const handleDeleteWork = async (workId) => {
    if (!window.confirm('确定要删除这个作品吗？此操作不可恢复！')) {
      return;
    }

    try {
      const response = await adminDeleteWork(workId);
      if (response.success) {
        alert('删除成功！');
        loadWorks();
      } else {
        alert(`删除失败：${response.message}`);
      }
    } catch (error) {
      console.error('删除作品失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingWork(null);
    loadWorks();
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (showEditor) {
    return (
      <WorkEditor 
        work={editingWork}
        onClose={handleEditorClose}
      />
    );
  }

  return (
    <AdminContainer>
      <AdminHeader>
        <AdminTitle>管理员面板</AdminTitle>
        <ButtonGroup>
          <Button onClick={handleCreateWork}>
            + 添加新作品
          </Button>
          <Button variant="secondary" onClick={handleBackToHome}>
            返回首页
          </Button>
        </ButtonGroup>
      </AdminHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner text="加载作品列表中..." />
      ) : (
        <WorksList>
          <h2 style={{ color: '#2e7d32', marginBottom: '20px' }}>
            作品列表 ({works.length}个)
          </h2>
          
          {works.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              暂无作品，点击上方按钮添加新作品
            </div>
          ) : (
            works.map((work) => (
              <WorkItem key={work.作品ID}>
                <WorkInfo>
                  <WorkTitle>{work.作品作品}</WorkTitle>
                  <WorkMeta>
                    ID: {work.作品ID} | 分类: {work.作品分类} | 版本: {work.作品版本号} | 
                    更新: {new Date(work.更新时间).toLocaleDateString('zh-CN')}
                  </WorkMeta>
                </WorkInfo>
                <WorkActions>
                  <SmallButton onClick={() => handleEditWork(work)}>
                    编辑
                  </SmallButton>
                  <SmallButton 
                    variant="danger" 
                    onClick={() => handleDeleteWork(work.作品ID)}
                  >
                    删除
                  </SmallButton>
                </WorkActions>
              </WorkItem>
            ))
          )}
        </WorksList>
      )}
    </AdminContainer>
  );
};

export default AdminPanel;
