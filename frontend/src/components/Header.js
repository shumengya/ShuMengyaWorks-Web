import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #81c784 0%, #a5d6a7 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const Logo = styled.img`
  height: 60px;
  width: auto;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    height: 50px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Author = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const Header = ({ settings }) => {
  // 动态设置favicon
  React.useEffect(() => {
    if (settings.网站logo) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = settings.网站logo;
      } else {
        // 如果没有favicon链接，创建一个
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = settings.网站logo;
        document.head.appendChild(newFavicon);
      }
    }
  }, [settings.网站logo]);

  return (
    <HeaderContainer>
      <HeaderContent>
        {settings.网站logo && (
          <LogoContainer>
            <Logo 
              src={settings.网站logo} 
              alt={settings.网站名字 || '树萌芽の作品集'}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </LogoContainer>
        )}
        <Title>{settings.网站名字 || '树萌芽の作品集'}</Title>
        <Description>{settings.网站描述 || '展示我的创意作品和项目'}</Description>
        <Author>{settings.站长 || '树萌芽'}</Author>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
