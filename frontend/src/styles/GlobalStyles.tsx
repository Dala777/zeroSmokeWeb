import { createGlobalStyle } from "styled-components"
import { AppColors } from "./colors"

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'Roboto', 'Segoe UI', sans-serif;
    background-color: ${AppColors.background};
    color: ${AppColors.text};
    line-height: 1.6;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.25rem;
  }

  h4 {
    font-size: 1.125rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.7;
  }

  a {
    color: ${AppColors.primary};
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${AppColors.accent};
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .card {
    background-color: ${AppColors.cardBackground};
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  
  .admin-container {
    display: flex;
    min-height: 100vh;
  }
  
  .admin-sidebar {
    width: 280px;
    background-color: ${AppColors.cardBackground};
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
  }
  
  .admin-content {
    flex: 1;
    padding: 2rem;
  }
  
  .admin-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    h1 { font-size: 2rem; }
    h2 { font-size: 1.625rem; }
    h3 { font-size: 1.125rem; }
    body { font-size: 15px; }
  }

  @media (max-width: 480px) {
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.5rem; }
  }
`

export default GlobalStyles
