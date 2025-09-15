import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  /* 头部容器背景渐变：从中绿色到浅绿色的4层渐变 */
  background: linear-gradient(135deg,rgb(204, 252, 207) 0%,rgb(132, 206, 134) 30%,rgb(157, 216, 159) 70%,rgb(109, 177, 109) 100%);
  color: #1b5e20; /* 深绿色文字 */
  padding: 25px 0; /* 上下内边距 */
  box-shadow: 0 8px 32px rgba(27, 94, 32, 0.15); /* 深绿色阴影效果 */
  position: relative; /* 相对定位，为伪元素提供定位基准 */
  overflow: hidden; /* 隐藏溢出内容，确保动画效果不会超出边界 */
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); /* 平滑过渡动画 */
  border-radius: 0 0 25px 25px; /* 底部圆角，营造圆润效果 */
  margin-bottom: 10px; /* 与下方内容的间距 */
  
  /* 光泽动画效果：从左到右的白色光泽扫过 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%; /* 初始位置在左侧外部 */
    width: 100%;
    height: 100%;
    /* 半透明白色渐变，中间较亮 */
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    animation: shimmer 4s infinite; /* 4秒循环的光泽动画 */
  }
  
  /* 底部流动边框：彩色边框从左到右流动 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px; /* 边框高度 */
    /* 绿色系渐变边框 */
    background: linear-gradient(90deg,rgb(21, 221, 31),rgb(2, 233, 14),rgb(0, 161, 5),rgb(0, 25rgb(12, 221, 23)#66bb6a);
    background-size: 200% 100%; /* 背景尺寸为200%，用于动画效果 */
    animation: flowingBorder 3s ease-in-out infinite; /* 3秒循环的流动动画 */
  }
  
  /* 光泽扫过动画：从左侧移动到右侧 */
  @keyframes shimmer {
    0% { left: -100%; } /* 开始位置：左侧外部 */
    100% { left: 100%; } /* 结束位置：右侧外部 */
  }
  
  /* 边框流动动画：背景位置左右移动 */
  @keyframes flowingBorder {
    0%, 100% { background-position: 0% 50%; } /* 起始和结束位置 */
    50% { background-position: 100% 50%; } /* 中间位置 */
  }
  
  /* 悬停效果：增强阴影和轻微上移 */
  &:hover {
    box-shadow: 0 12px 40px rgba(27, 94, 32, 0.2); /* 更深的阴影 */
    transform: translateY(-2px); /* 向上移动2像素 */
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px; /* 最大宽度限制 */
  margin: 0 auto; /* 水平居中 */
  padding: 0 20px; /* 左右内边距 */
  text-align: center; /* 文字居中对齐 */
  display: flex; /* 弹性布局 */
  flex-direction: column; /* 垂直排列 */
  align-items: center; /* 子元素居中对齐 */
  
  /* 移动端响应式：减少左右内边距 */
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 15px; /* 底部间距 */
  animation: fadeInUp 0.8s ease-out; /* 淡入向上动画 */
  
  /* Logo淡入动画：从下方淡入 */
  @keyframes fadeInUp {
    from {
      opacity: 0; /* 初始透明 */
      transform: translateY(20px); /* 初始向下偏移 */
    }
    to {
      opacity: 1; /* 最终不透明 */
      transform: translateY(0); /* 最终正常位置 */
    }
  }
  
  /* 移动端响应式：减少底部间距 */
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const Logo = styled.img`
  height: 80px; /* Logo高度 */
  width: auto; /* 宽度自适应，保持比例 */
  border-radius: 12px; /* 圆角效果 */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* 平滑过渡动画 */
  filter: drop-shadow(0 2px 8px rgba(46, 93, 49, 0.15)); /* 投影效果 */
  
  /* Logo悬停效果：放大并轻微旋转 */
  &:hover {
    transform: scale(1.05) rotate(2deg); /* 放大105%并旋转2度 */
    filter: drop-shadow(0 4px 12px rgba(46, 93, 49, 0.25)); /* 增强投影 */
  }
  
  /* 移动端响应式：减小Logo尺寸 */
  @media (max-width: 768px) {
    height: 60px;
  }
`;

const Title = styled.h1`
  font-size: 3rem; /* 标题字体大小 */
  margin-bottom: 10px; /* 底部间距 */
  font-weight: 700; /* 字体粗细 */
  position: relative; /* 相对定位，为伪元素提供基准 */
  
  /* 文字颜色：纯白色，保持清晰可读 */
  color: #ffffff;
  
  /* 金色描边效果：使用-webkit-text-stroke创建外描边 */
  -webkit-text-stroke: 2px #ffd700; /* 2像素金色描边 */
  text-stroke: 2px #ffd700; /* 标准属性 */
  
  /* 外围辐射金光：只在外围产生光晕，不影响文字内部 */
  filter: drop-shadow(0 0 4px #ffd700) 
          drop-shadow(0 0 8px #ffd700) 
          drop-shadow(0 0 12px #ffed4e);
  
  /* 底部立体阴影 */
  text-shadow: 0 3px 6px rgba(0,0,0,0.3);
  
  /* 淡入向上动画 + 金光闪烁效果 */
  animation: 
    fadeInUp 0.8s ease-out 0.2s both,     /* 淡入向上动画 */
    goldGlow 3s ease-in-out infinite;      /* 金光闪烁效果 */
  

  
  /* 淡入向上动画 */
  @keyframes fadeInUp {
    from {
      opacity: 0; /* 初始透明 */
      transform: translateY(20px); /* 初始位置向下偏移 */
    }
    to {
      opacity: 1; /* 最终不透明 */
      transform: translateY(0); /* 最终位置正常 */
    }
  }
  
  /* 响应式设计：移动端字体大小调整 */
  @media (max-width: 768px) {
    font-size: 2.5rem; /* 移动端较小字体 */
    -webkit-text-stroke: 1.5px #ffd700; /* 移动端较细描边 */
    
    /* 移动端减弱光晕效果，避免性能问题 */
    filter: drop-shadow(0 0 6px #ffd700) 
            drop-shadow(0 0 12px #ffed4e);
  }
`;

const Description = styled.p`
  font-size: 1.1rem; /* 描述文字大小 */
  color: rgba(255, 255, 255, 0.9); /* 半透明白色文字 */
  text-shadow: 0 2px 8px rgba(27, 94, 32, 0.3); /* 绿色文字阴影 */
  margin-bottom: 5px; /* 底部间距 */
  animation: fadeInUp 0.8s ease-out 0.4s both; /* 延迟0.4秒的淡入动画 */
  transition: all 0.3s ease; /* 平滑过渡效果 */
  
  /* 描述文字悬停效果：变为完全不透明并上移 */
  &:hover {
    color: rgba(255, 255, 255, 1); /* 完全不透明的白色 */
    transform: translateY(-2px); /* 向上移动2像素 */
  }
  
  /* 移动端响应式：减小字体大小 */
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Author = styled.p`
  font-size: 0.9rem; /* 作者信息字体大小 */
  color: rgba(255, 255, 255, 0.8); /* 更透明的白色文字 */
  text-shadow: 0 2px 8px rgba(27, 94, 32, 0.3); /* 绿色文字阴影 */
  animation: fadeInUp 0.8s ease-out 0.6s both; /* 延迟0.6秒的淡入动画 */
  transition: all 0.3s ease; /* 平滑过渡效果 */
  
  /* 作者信息悬停效果：变为完全不透明并上移 */
  &:hover {
    color: rgba(255, 255, 255, 1); /* 完全不透明的白色 */
    transform: translateY(-2px); /* 向上移动2像素 */
  }
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
