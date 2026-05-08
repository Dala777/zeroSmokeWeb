"use client"

import type React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../../styles/colors"

const FooterContainer = styled.footer`
  background-color: ${AppColors.cardBackground};
  padding: 5rem 0 2rem;
  margin-top: 5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10px;
    background: linear-gradient(90deg, ${AppColors.primary}, ${AppColors.accent});
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 30%;
    height: 100%;
    background: radial-gradient(circle at top right, ${AppColors.primary}10, transparent 70%);
    z-index: 0;
    pointer-events: none;
  }
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  position: relative;
  z-index: 1;
`

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FooterTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: ${AppColors.accent};
    border-radius: 2px;
  }
`

const FooterLink = styled(Link)`
  color: ${AppColors.text};
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${AppColors.primary};
    transform: translateX(5px);
  }
  
  &::before {
    content: '›';
    margin-right: 0.5rem;
    font-size: 1.2rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`

const FooterText = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  line-height: 1.7;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-top: 1.5rem;
`

const SocialLink = styled.a`
  color: ${AppColors.text};
  font-size: 1.25rem;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
    background-color: ${AppColors.primary};
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`

const Copyright = styled.div`
  text-align: center;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  color: ${AppColors.textSecondary};
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`

const LogoText = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${AppColors.primary};
  
  span {
    color: ${AppColors.text};
  }
`

const LogoIcon = styled.div`
  margin-right: 0.5rem;
  color: ${AppColors.primary};
  font-size: 1.8rem;
`

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: ${AppColors.text};
  font-size: 0.95rem;
`

const ContactIcon = styled.span`
  margin-right: 0.75rem;
  color: ${AppColors.primary};
  font-size: 1.1rem;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NewsletterForm = styled.form`
  display: flex;
  margin-top: 1rem;
  position: relative;
  max-width: 100%;
`

const NewsletterInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 50px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white;
  width: 100%;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
    box-shadow: 0 0 0 3px ${AppColors.primary}20;
  }
`

const NewsletterButton = styled.button`
  position: absolute;
  right: 5px;
  top: 5px;
  bottom: 5px;
  background-color: ${AppColors.primary};
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${AppColors.accent};
  }
`

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <LogoContainer>
            <LogoIcon>🚭</LogoIcon>
            <LogoText>
              Zero<span>Smoke</span>
            </LogoText>
          </LogoContainer>
          <FooterText>
            Ayudando a fumadores a dejar el hábito y mejorar su calidad de vida a través de información, recursos y
            apoyo personalizado.
          </FooterText>
          <SocialLinks>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Enlaces Rápidos</FooterTitle>
          <FooterLink to="/">Inicio</FooterLink>
          <FooterLink to="/consecuencias">Consecuencias</FooterLink>
          <FooterLink to="/test">Test de Dependencia</FooterLink>
          <FooterLink to="/faqs">Preguntas Frecuentes</FooterLink>
          <FooterLink to="/contacto">Contacto</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Recursos</FooterTitle>
          <FooterLink to="/articles">Guías para dejar de fumar</FooterLink>
          <FooterLink to="/articles">Testimonios de éxito</FooterLink>
          <FooterLink to="/articles">Consejos de expertos</FooterLink>
          <FooterLink to="/articles">Investigaciones recientes</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Contacto</FooterTitle>
          <FooterText>¿Tienes preguntas o comentarios? No dudes en contactarnos.</FooterText>

          <ContactItem>
            <ContactIcon>✉</ContactIcon>
            infozerosmoke@gmail.com
          </ContactItem>

          <ContactItem>
            <ContactIcon>📱</ContactIcon>
            +591 64957120
          </ContactItem>

          <FooterTitle style={{ marginTop: "1.5rem" }}>Newsletter</FooterTitle>
          <FooterText>Suscríbete para recibir consejos y novedades.</FooterText>

          <NewsletterForm onSubmit={(e) => e.preventDefault()}>
            <NewsletterInput type="email" placeholder="Tu email" aria-label="Email para newsletter" />
            <NewsletterButton type="submit">Suscribir</NewsletterButton>
          </NewsletterForm>
        </FooterSection>
      </FooterContent>

      <Copyright>© {currentYear} ZeroSmoke. Todos los derechos reservados.</Copyright>
    </FooterContainer>
  )
}

export default Footer
