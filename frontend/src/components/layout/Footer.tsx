import type React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../../styles/colors"

const FooterContainer = styled.footer`
  background-color: ${AppColors.cardBackground};
  padding: 2rem 1rem;
  margin-top: 2rem;
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const FooterTitle = styled.h3`
  font-size: 1.25rem;
  color: ${AppColors.primary};
  margin-bottom: 0.5rem;
`

const FooterLink = styled(Link)`
  color: ${AppColors.text};
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${AppColors.primary};
  }
`

const FooterText = styled.p`
  color: ${AppColors.text};
  font-size: 0.875rem;
  line-height: 1.6;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`

const SocialLink = styled.a`
  color: ${AppColors.text};
  font-size: 1.25rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${AppColors.primary};
  }
`

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: ${AppColors.text};
  font-size: 0.875rem;
`

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>ZeroSmoke</FooterTitle>
          <FooterText>
            Plataforma dedicada a ayudar a las personas a dejar de fumar de manera efectiva y permanente.
          </FooterText>
          <SocialLinks>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              📘
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              🐦
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              📷
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              📺
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Enlaces Rápidos</FooterTitle>
          <FooterLink to="/">Inicio</FooterLink>
          <FooterLink to="/articles">Artículos</FooterLink>
          <FooterLink to="/faqs">FAQs</FooterLink>
          <FooterLink to="/contact">Contacto</FooterLink>
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
          <FooterText>📧 info@zerosmoke.com</FooterText>
          <FooterText>📞 +34 123 456 789</FooterText>
          <FooterText>📍 Calle Principal 123, Madrid, España</FooterText>
        </FooterSection>
      </FooterContent>

      <Copyright>© {currentYear} ZeroSmoke. Todos los derechos reservados.</Copyright>
    </FooterContainer>
  )
}

export default Footer

