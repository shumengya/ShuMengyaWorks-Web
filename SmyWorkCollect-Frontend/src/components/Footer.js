import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #66bb6a 0%, #81c784 30%, #a5d6a7 70%, #c8e6c9 100%);
  color: #1b5e20;
  padding: 35px 0 25px;
  margin-top: 50px;
  position: relative;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 25px 25px 0 0;
  box-shadow: 0 -8px 32px rgba(27, 94, 32, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4caf50, #66bb6a, #81c784, #66bb6a, #4caf50);
    background-size: 200% 100%;
    animation: flowingTopBorder 3s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: shimmer 5s infinite;
  }
  
  @keyframes flowingTopBorder {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 -12px 40px rgba(27, 94, 32, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 25px 0 20px;
    margin-top: 35px;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const FooterText = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(27, 94, 32, 0.3);
  margin-bottom: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 8px;
  }
`;

const ContactInfo = styled.div`
  margin-bottom: 15px;
  animation: slideInLeft 0.8s ease-out 0.2s both;
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const ContactLink = styled.a`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  text-shadow: 0 2px 8px rgba(27, 94, 32, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1));
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    
    &::after {
      width: 100%;
    }
  }
`;

const RecordNumber = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 2px 8px rgba(27, 94, 32, 0.3);
  margin-bottom: 5px;
  animation: slideInRight 0.8s ease-out 0.4s both;
  transition: all 0.3s ease;
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const Copyright = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 2px 8px rgba(27, 94, 32, 0.3);
  animation: fadeIn 0.8s ease-out 0.6s both;
  transition: all 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 0.7; }
  }
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const Footer = ({ settings }) => {
  return (
    <FooterContainer>
      <FooterContent>
        <ContactInfo>
          <FooterText>
            📧 联系邮箱: <ContactLink href={`mailto:${settings.联系邮箱}`}>
              {settings.联系邮箱}
            </ContactLink>
          </FooterText>
        </ContactInfo>
        
        {settings.备案号 && (
          <RecordNumber>{settings.备案号}</RecordNumber>
        )}
        
        <Copyright>
          {settings.网站页尾 || '🌱 树萌芽の作品集 | Copyright © 2025 smy ✨'}
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
