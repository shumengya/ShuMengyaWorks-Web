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
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const BackButton = styled.button`
  background: #81c784;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #66bb6a;
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
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
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
  background: ${props => props.liked ? '#4caf50' : '#81c784'};
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
  
  &:hover {
    background: ${props => props.liked ? '#45a049' : '#66bb6a'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
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

const WorkDetail = () => {
  const { workId } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);
  const [likeMessage, setLikeMessage] = useState('');

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

  const handleImageClick = (imageUrl) => {
    window.open(`${getApiBaseUrl()}${imageUrl}`, '_blank');
  };

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
          ← 返回首页
        </BackButton>
        <ErrorMessage>{error}</ErrorMessage>
      </DetailContainer>
    );
  }

  if (!work) {
    return (
      <DetailContainer>
        <BackButton onClick={() => navigate('/')}>
          ← 返回首页
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
            <strong>作者:</strong> {work.作者}
          </MetaItem>
          <MetaItem>
            <strong>版本:</strong> {work.作品版本号}
          </MetaItem>
          <MetaItem>
            <strong>分类:</strong> {work.作品分类}
          </MetaItem>
          <MetaItem>
            <strong>上传时间:</strong> {formatDate(work.上传时间)}
          </MetaItem>
          <MetaItem>
            <strong>更新时间:</strong> {formatDate(work.更新时间)}
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
            <StatIcon>👁️</StatIcon>
            <StatValue>{work.作品浏览量 || 0}</StatValue>
            <StatLabel>浏览量</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>⬇️</StatIcon>
            <StatValue>{work.作品下载量 || 0}</StatValue>
            <StatLabel>下载量</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>👍</StatIcon>
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
          <span>👍</span>
          {liking ? '点赞中...' : '点赞作品'}
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
          <SectionTitle>作品视频</SectionTitle>
          {work.视频链接.map((videoUrl, index) => (
            <VideoContainer key={index}>
              <VideoPlayer controls>
                <source src={`${getApiBaseUrl()}${videoUrl}`} type="video/mp4" />
                您的浏览器不支持视频播放
              </VideoPlayer>
            </VideoContainer>
          ))}
        </ContentSection>
      )}

      {work.图片链接 && work.图片链接.length > 0 && (
        <ContentSection>
          <SectionTitle>作品截图</SectionTitle>
          <ImageGallery>
            {work.图片链接.map((imageUrl, index) => (
              <WorkImage
                key={index}
                src={`${getApiBaseUrl()}${imageUrl}`}
                alt={`${work.作品作品} 截图 ${index + 1}`}
                onClick={() => handleImageClick(imageUrl)}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </ImageGallery>
        </ContentSection>
      )}

      {work.下载链接 && Object.keys(work.下载链接).length > 0 && (
        <ContentSection>
          <SectionTitle>下载作品</SectionTitle>
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
                    下载 {platform} 版本
                  </DownloadButton>
                ))}
              </PlatformDownload>
            ))}
          </DownloadSection>
        </ContentSection>
      )}
    </DetailContainer>
  );
};

export default WorkDetail;
