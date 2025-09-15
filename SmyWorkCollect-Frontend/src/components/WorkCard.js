import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const Card = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 255, 248, 0.95));
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(129, 199, 132, 0.2);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(129, 199, 132, 0.2);
    border-color: rgba(129, 199, 132, 0.4);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
`;

const WorkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  color: #81c784;
  font-size: 3rem;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const WorkTitle = styled.h3`
  font-size: 1.3rem;
  color: #2e7d32;
  margin-bottom: 8px;
  font-weight: 600;
`;

const WorkDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
`;

const Tag = styled.span`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: #666;
`;

const PlatformsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
`;

const Platform = styled.span`
  background: #81c784;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #eee;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #666;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StatIcon = styled.span`
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  font-weight: 500;
  color: #2e7d32;
`;

const ViewDetailText = styled.div`
  text-align: center;
  color: #81c784;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 6px 0;
  border-top: 1px solid #eee;
  margin-top: 8px;
`;

const WorkCard = ({ work }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };
  
  const getCoverImage = () => {
    if (work.作品封面 && work.图片链接) {
      const coverIndex = work.作品截图?.indexOf(work.作品封面);
      if (coverIndex >= 0 && work.图片链接[coverIndex]) {
        return `${getApiBaseUrl()}${work.图片链接[coverIndex]}`;
      }
    }
    return null;
  };

  const handleCardClick = () => {
    navigate(`/work/${work.作品ID}`);
  };

  return (
    <Card onClick={handleCardClick}>
      <ImageContainer>
        {getCoverImage() ? (
          <WorkImage 
            src={getCoverImage()} 
            alt={work.作品作品}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <ImagePlaceholder style={{ display: getCoverImage() ? 'none' : 'flex' }}>
          🎨
        </ImagePlaceholder>
      </ImageContainer>
      
      <CardContent>
        <WorkTitle>{work.作品作品}</WorkTitle>
        <WorkDescription>{work.作品描述}</WorkDescription>
        
        {work.作品标签 && work.作品标签.length > 0 && (
          <TagsContainer>
            {work.作品标签.slice(0, 3).map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
            {work.作品标签.length > 3 && (
              <Tag>+{work.作品标签.length - 3}</Tag>
            )}
          </TagsContainer>
        )}
        
        <InfoRow>
          <span>👨‍💻 作者: {work.作者}</span>
          <span>🏷️ v{work.作品版本号}</span>
        </InfoRow>
        
        <InfoRow>
          <span>📂 分类: {work.作品分类}</span>
          <span>📅 {formatDate(work.更新时间)}</span>
        </InfoRow>
        
        {work.支持平台 && work.支持平台.length > 0 && (
          <PlatformsContainer>
            {work.支持平台.map((platform, index) => (
              <Platform key={index}>{platform}</Platform>
            ))}
          </PlatformsContainer>
        )}
        
        <StatsContainer>
          <StatItem>
            <StatIcon>👀</StatIcon>
            <StatValue>{work.作品浏览量 || 0}</StatValue>
          </StatItem>
          <StatItem>
            <StatIcon>📥</StatIcon>
            <StatValue>{work.作品下载量 || 0}</StatValue>
          </StatItem>
          <StatItem>
            <StatIcon>💖</StatIcon>
            <StatValue>{work.作品点赞量 || 0}</StatValue>
          </StatItem>
          <StatItem>
            <StatIcon>🔄</StatIcon>
            <StatValue>{work.作品更新次数 || 0}</StatValue>
          </StatItem>
        </StatsContainer>
        
        <ViewDetailText>
          🌟 点击查看详情 →
        </ViewDetailText>
      </CardContent>
    </Card>
  );
};

export default WorkCard;