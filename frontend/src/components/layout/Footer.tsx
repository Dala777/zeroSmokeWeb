import type React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import { AppColors } from "../../styles/colors"

const FooterContainer = styled.footer`
  background-color: ${AppColors.cardBackground};
  padding: 3rem 0 1.5rem;
  margin-top: 3rem;
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`

const FooterTitle = styled.h3`
  color: ${AppColors.primary};
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
`

const FooterLink = styled(Link)`
  color: ${AppColors.text};
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${AppColors.primary};
  }
`

const FooterText = styled.p`
  color: ${AppColors.text};
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`

const SocialLink = styled.a`
  color: ${AppColors.text};
  font-size: 1.5rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${AppColors.primary};
  }
`

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: ${AppColors.textSecondary};
  font-size: 0.875rem;
`

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>ZeroSmoke</FooterTitle>
          <FooterText>
            Ayudando a fumadores a dejar el hábito y mejorar su calidad de vida a través de información, recursos y
            apoyo.
          </FooterText>
          <SocialLinks>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              FB
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              TW
            </SocialLink>
            <SocialLink href="#" target="_blank" rel="noopener noreferrer">
              IG
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Enlaces Rápidos</FooterTitle>
          <FooterLink to="/">Inicio</FooterLink>
          <FooterLink to="/consecuencias">Consecuencias de Fumar</FooterLink>
          <FooterLink to="/test">Test de Dependencia</FooterLink>
          <FooterLink to="/recursos">Recursos</FooterLink>
          <FooterLink to="/faqs">Preguntas Frecuentes</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Recursos</FooterTitle>
          <FooterLink to="/articulos">Artículos</FooterLink>
          <FooterLink to="/estadisticas">Estadísticas</FooterLink>
          <FooterLink to="/testimonios">Testimonios</FooterLink>
          <FooterLink to="/app">Descargar App</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Contacto</FooterTitle>
          <FooterText>¿Tienes preguntas o comentarios? No dudes en contactarnos.</FooterText>
          <FooterLink to="/contacto">Formulario de Contacto</FooterLink>
          <FooterText>Email: info@zerosmoke.com</FooterText>
        </FooterSection>
      </FooterContent>

      <Copyright>© {new Date().getFullYear()} ZeroSmoke. Todos los derechos reservados.</Copyright>
    </FooterContainer>
  )
}

export default Footer

