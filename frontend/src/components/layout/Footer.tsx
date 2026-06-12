"use client"

import type React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../../styles/colors"
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowRight } from "lucide-react"

const FooterContainer = styled.footer`
  background-color: ${AppColors.cardBackground};
  padding: 4rem 0 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, ${AppColors.primary}, ${AppColors.accent}, ${AppColors.secondary});
  }
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`

const BrandSection = styled(FooterSection)`
  @media (max-width: 640px) {
    text-align: center;
    align-items: center;
  }
`

const FooterTitle = styled.h4`
  color: ${AppColors.text};
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const FooterLink = styled(Link)`
  color: ${AppColors.textSecondary};
  font-size: 0.925rem;
  padding: 0.35rem 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${AppColors.primary};
    transform: translateX(4px);
  }
`

const FooterText = styled.p`
  color: ${AppColors.textSecondary};
  font-size: 0.925rem;
  line-height: 1.7;
  margin-bottom: 1.25rem;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    justify-content: center;
  }
`

const LogoText = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${AppColors.primary};
  font-family: 'Montserrat', sans-serif;

  span {
    color: ${AppColors.text};
    font-weight: 300;
  }
`

const SocialLinks = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 640px) {
    justify-content: center;
  }
`

const SocialLink = styled.a`
  color: ${AppColors.textSecondary};
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: ${AppColors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;

  &:hover {
    color: white;
    background-color: ${AppColors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${AppColors.primary}40;
  }
`

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: ${AppColors.textSecondary};
  font-size: 0.925rem;
`

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding: 1.5rem;
  border-top: 1px solid ${AppColors.border};
  color: ${AppColors.textLight};
  font-size: 0.875rem;
`

const NewsletterForm = styled.form`
  display: flex;
  margin-top: 0.75rem;
  position: relative;
`

const NewsletterInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${AppColors.border};
  background-color: ${AppColors.surface};
  width: 100%;
  font-size: 0.875rem;
  color: ${AppColors.text};

  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
    box-shadow: 0 0 0 3px ${AppColors.primary}15;
  }

  &::placeholder {
    color: ${AppColors.textLight};
  }
`

const NewsletterButton = styled.button`
  position: absolute;
  right: 4px;
  top: 4px;
  bottom: 4px;
  background: linear-gradient(135deg, ${AppColors.primary}, ${AppColors.accent});
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;

  &:hover {
    box-shadow: 0 4px 12px ${AppColors.primary}40;
  }
`

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <BrandSection>
          <LogoContainer>
            <Leaf size={24} color={AppColors.primary} />
            <LogoText>Zero<span>Smoke</span></LogoText>
          </LogoContainer>
          <FooterText>
            Ayudando a fumadores a dejar el hábito y mejorar su calidad de vida a través de información, recursos y
            apoyo personalizado.
          </FooterText>
          <SocialLinks>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter size={18} />
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube size={18} />
            </SocialLink>
          </SocialLinks>
        </BrandSection>

        <FooterSection>
          <FooterTitle>Enlaces</FooterTitle>
          <FooterLink to="/">Inicio</FooterLink>
          <FooterLink to="/Gallery">Consecuencias</FooterLink>
          <FooterLink to="/education">Educación</FooterLink>
          <FooterLink to="/test">Test de Dependencia</FooterLink>
          <FooterLink to="/faqs">Preguntas Frecuentes</FooterLink>
          <FooterLink to="/contacto">Contacto</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Recursos</FooterTitle>
          <FooterLink to="/articulos">Artículos</FooterLink>
          <FooterLink to="/app">Descargar App</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Contacto</FooterTitle>
          <ContactItem>
            <Mail size={16} color={AppColors.primary} />
            infozerosmoke@gmail.com
          </ContactItem>
          <ContactItem>
            <Phone size={16} color={AppColors.primary} />
            +591 64957120
          </ContactItem>
          <ContactItem>
            <MapPin size={16} color={AppColors.primary} />
            Avenida Villarroel, N° 359
          </ContactItem>

          <FooterTitle style={{ marginTop: "1.5rem" }}>Newsletter</FooterTitle>
          <FooterText>Recibe consejos y novedades.</FooterText>
          <NewsletterForm onSubmit={(e) => e.preventDefault()}>
            <NewsletterInput type="email" placeholder="Tu email" aria-label="Email para newsletter" />
            <NewsletterButton type="submit">
              <ArrowRight size={18} />
            </NewsletterButton>
          </NewsletterForm>
        </FooterSection>
      </FooterContent>

      <Copyright>
        &copy; {new Date().getFullYear()} ZeroSmoke. Todos los derechos reservados.
      </Copyright>
    </FooterContainer>
  )
}

export default Footer