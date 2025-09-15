import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';
import { getWorkDetail, likeWork } from '../services/api';

// 获取API基础URL
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return 'http://localhost:5000';
};

const DetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(45deg, #81c784, #66bb6a);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(129, 199, 132, 0.3);
  
  &:before {
    content: '🏠 ';
  }
  
  &:hover {
    background: linear-gradient(45deg, #66bb6a, #4caf50);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(129, 199, 132, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const WorkHeader = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 15px;
  }
`;

const WorkTitle = styled.h1`
  font-size: 2.2rem;
  color: #2e7d32;
  margin-bottom: 15px;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 12px;
  }
`;

const WorkMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
  
  strong {
    color: #2e7d32;
    margin-right: 8px;
  }
`;

const WorkDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const PlatformsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const Platform = styled.span`
  background: #81c784;
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 15px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2e7d32;
  margin-bottom: 20px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
`;

const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const WorkImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const DownloadSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const PlatformDownload = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const PlatformTitle = styled.h3`
  font-size: 1.2rem;
  color: #2e7d32;
  margin-bottom: 15px;
  font-weight: 600;
`;

const DownloadButton = styled.a`
  display: inline-block;
  background: #81c784;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  margin: 5px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #66bb6a;
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
    display: block;
    margin: 8px 0;
  }
`;

const VideoContainer = styled.div`
  margin-bottom: 15px;
`;

const VideoPlayer = styled.video`
  width: 100%;
  max-height: 400px;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    max-height: 250px;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 10px;
    padding-bottom: 5px;
    
    /* 添加滚动条样式 */
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #81c784;
      border-radius: 10px;
    }
  }
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #81c784;
    background: #f0f8f0;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    min-width: 80px;
    flex: 1 0 auto;
    margin-right: 2px;
  }
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const LikeButton = styled.button`
  background: linear-gradient(
    45deg,
    rgba(255, 107, 107, 0.8),
    rgba(255, 165, 0, 0.8),
    rgba(255, 255, 0, 0.7),
    rgba(50, 205, 50, 0.8),
    rgba(0, 191, 255, 0.8),
    rgba(65, 105, 225, 0.8),
    rgba(147, 112, 219, 0.8)
  );
  background-size: 300% 300%;
  animation: buttonRainbow 12s ease infinite;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    animation: none;
  }
  
  @keyframes buttonRainbow {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #e53e3e;
  font-size: 18px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// 模态框样式
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ModalImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 85vh;
  object-fit: contain;
  display: block;
`;

const ModalVideo = styled.video`
  width: 100%;
  height: auto;
  max-height: 85vh;
  display: block;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 18px;
    top: 10px;
    right: 10px;
  }
`;

const ModalTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 20px;
  font-size: 16px;
  z-index: 1001;
  
  @media (max-width: 768px) {
    padding: 15px;
    font-size: 14px;
  }
`;

const WorkDetail = () => {
  const { workId } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);
  const [likeMessage, setLikeMessage] = useState('');
  
  // 模态框状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'image' 或 'video'
  const [modalSrc, setModalSrc] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    loadWorkDetail();
  }, [workId]);

  const loadWorkDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWorkDetail(workId);
      if (response.success) {
        setWork(response.data);
      } else {
        setError(response.message || '作品不存在');
      }
    } catch (error) {
      console.error('加载作品详情失败:', error);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 打开图片模态框
  const handleImageClick = (imageUrl, index) => {
    setModalType('image');
    setModalSrc(`${getApiBaseUrl()}${imageUrl}`);
    setModalTitle(`${work.作品作品} - 截图 ${index + 1}`);
    setModalOpen(true);
  };

  // 打开视频模态框
  const handleVideoClick = (videoUrl, index) => {
    setModalType('video');
    setModalSrc(`${getApiBaseUrl()}${videoUrl}`);
    setModalTitle(`${work.作品作品} - 视频 ${index + 1}`);
    setModalOpen(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalOpen(false);
    setModalType('');
    setModalSrc('');
    setModalTitle('');
  };

  // 处理模态框背景点击
  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // 处理键盘事件
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    setLikeMessage('');
    
    try {
      const response = await likeWork(workId);
      if (response.success) {
        setLikeMessage('点赞成功！');
        // 更新本地作品数据
        setWork(prev => ({
          ...prev,
          作品点赞量: response.likes
        }));
      } else {
        setLikeMessage(response.message || '点赞失败');
      }
    } catch (error) {
      console.error('点赞失败:', error);
      if (error.response?.status === 429) {
        setLikeMessage('操作太频繁，请稍后再试');
      } else {
        setLikeMessage('点赞失败，请稍后重试');
      }
    } finally {
      setLiking(false);
      // 3秒后清除消息
      setTimeout(() => setLikeMessage(''), 3000);
    }
  };

  if (loading) {
    return <LoadingSpinner text="加载作品详情中..." />;
  }

  if (error) {
    return (
      <DetailContainer>
        <BackButton onClick={() => navigate('/')}>
          返回首页
        </BackButton>
        <ErrorMessage>{error}</ErrorMessage>
      </DetailContainer>
    );
  }

  if (!work) {
    return (
      <DetailContainer>
        <BackButton onClick={() => navigate('/')}>
          返回首页
        </BackButton>
        <ErrorMessage>作品不存在</ErrorMessage>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer>
      <BackButton onClick={() => navigate('/')}>
        ← 返回首页
      </BackButton>
      
      <WorkHeader>
        <WorkTitle>{work.作品作品}</WorkTitle>
        
        <WorkMeta>
          <MetaItem>
            <strong>👨‍💻 作者:</strong> {work.作者}
          </MetaItem>
          <MetaItem>
            <strong>🏷️ 版本:</strong> {work.作品版本号}
          </MetaItem>
          <MetaItem>
            <strong>📂 分类:</strong> {work.作品分类}
          </MetaItem>
          <MetaItem>
            <strong>📅 上传时间:</strong> {formatDate(work.上传时间)}
          </MetaItem>
          <MetaItem>
            <strong>🔄 更新时间:</strong> {formatDate(work.更新时间)}
          </MetaItem>
        </WorkMeta>
        
        <WorkDescription>{work.作品描述}</WorkDescription>
        
        {work.作品标签 && work.作品标签.length > 0 && (
          <TagsContainer>
            {work.作品标签.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagsContainer>
        )}
        
        {work.支持平台 && work.支持平台.length > 0 && (
          <PlatformsContainer>
            {work.支持平台.map((platform, index) => (
              <Platform key={index}>{platform}</Platform>
            ))}
          </PlatformsContainer>
        )}

        {/* 统计数据 */}
        <StatsSection>
          <StatCard>
            <StatIcon>👁️‍🗨️</StatIcon>
            <StatValue>{work.作品浏览量 || 0}</StatValue>
            <StatLabel>浏览量</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>📥</StatIcon>
            <StatValue>{work.作品下载量 || 0}</StatValue>
            <StatLabel>下载量</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>💖</StatIcon>
            <StatValue>{work.作品点赞量 || 0}</StatValue>
            <StatLabel>点赞量</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>🔄</StatIcon>
            <StatValue>{work.作品更新次数 || 0}</StatValue>
            <StatLabel>更新次数</StatLabel>
          </StatCard>
        </StatsSection>

        {/* 点赞按钮 */}
        <LikeButton 
          onClick={handleLike} 
          disabled={liking}
          style={{ 
            width: '100%', 
            marginTop: '15px',
            position: 'relative'
          }}
        >
          <span>💖</span>
          {liking ? '💫 点赞中...' : '点赞作品'}
          {likeMessage && (
            <div style={{
              position: 'absolute',
              top: '-35px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: likeMessage.includes('成功') ? '#4caf50' : '#f44336',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap'
            }}>
              {likeMessage}
            </div>
          )}
        </LikeButton>
      </WorkHeader>

      {work.视频链接 && work.视频链接.length > 0 && (
        <ContentSection>
          <SectionTitle>🎬 作品视频</SectionTitle>
          {work.视频链接.map((videoUrl, index) => (
            <VideoContainer key={index}>
              <VideoPlayer 
                controls
                onClick={() => handleVideoClick(videoUrl, index)}
                style={{ cursor: 'pointer' }}
              >
                <source src={`${getApiBaseUrl()}${videoUrl}`} type="video/mp4" />
                您的浏览器不支持视频播放
              </VideoPlayer>
            </VideoContainer>
          ))}
        </ContentSection>
      )}

      {work.下载链接 && Object.keys(work.下载链接).length > 0 && (
        <ContentSection>
          <SectionTitle>📦 下载作品</SectionTitle>
          <DownloadSection>
            {Object.entries(work.下载链接).map(([platform, links]) => (
              <PlatformDownload key={platform}>
                <PlatformTitle>{platform}</PlatformTitle>
                {links.map((link, index) => (
                  <DownloadButton 
                    key={index}
                    href={`${getApiBaseUrl()}${link}`}
                    download
                  >
                    📥 下载 {platform} 版本
                  </DownloadButton>
                ))}
              </PlatformDownload>
            ))}
          </DownloadSection>
        </ContentSection>
      )}

      {work.图片链接 && work.图片链接.length > 0 && (
        <ContentSection>
          <SectionTitle>🖼️ 作品截图</SectionTitle>
          <ImageGallery>
            {work.图片链接.map((imageUrl, index) => (
              <WorkImage
                key={index}
                src={`${getApiBaseUrl()}${imageUrl}`}
                alt={`${work.作品作品} 截图 ${index + 1}`}
                onClick={() => handleImageClick(imageUrl, index)}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </ImageGallery>
        </ContentSection>
      )}

      {/* 模态框 */}
      {modalOpen && (
        <ModalOverlay onClick={handleModalOverlayClick}>
          <ModalContent>
            <CloseButton onClick={closeModal}>×</CloseButton>
            {modalType === 'image' ? (
              <ModalImage 
                src={modalSrc} 
                alt={modalTitle}
                onError={(e) => {
                  console.error('图片加载失败:', modalSrc);
                }}
              />
            ) : modalType === 'video' ? (
              <ModalVideo 
                src={modalSrc} 
                controls 
                autoPlay
                onError={(e) => {
                  console.error('视频加载失败:', modalSrc);
                }}
              />
            ) : null}
            <ModalTitle>{modalTitle}</ModalTitle>
          </ModalContent>
        </ModalOverlay>
      )}
    </DetailContainer>
  );
};

export default WorkDetail;
