import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #2e7d32 0%, #388e3c 100%);
  color: white;
  padding: 30px 0 20px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    padding: 20px 0 15px;
    margin-top: 30px;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const FooterText = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 8px;
  }
`;

const ContactInfo = styled.div`
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const ContactLink = styled.a`
  color: white;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

const RecordNumber = styled.p`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const Copyright = styled.p`
  font-size: 0.8rem;
  opacity: 0.7;
  
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
            联系邮箱: <ContactLink href={`mailto:${settings.联系邮箱}`}>
              {settings.联系邮箱}
            </ContactLink>
          </FooterText>
        </ContactInfo>
        
        {settings.备案号 && (
          <RecordNumber>{settings.备案号}</RecordNumber>
        )}
        
        <Copyright>
          {settings.网站页尾 || '树萌芽の作品集 | Copyright © 2025 smy'}
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
