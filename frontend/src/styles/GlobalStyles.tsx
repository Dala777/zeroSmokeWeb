import { createGlobalStyle } from "styled-components"
import { AppColors } from "./colors"

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Roboto', 'Segoe UI', sans-serif;
    background-color: ${AppColors.background};
    color: ${AppColors.text};
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    margin-bottom: 1rem;
  }

  a {
    color: ${AppColors.secondary};
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${AppColors.primary};
    }
  }

  button {
    cursor: pointer;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .card {
    background-color: ${AppColors.cardBackground};
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`

export default GlobalStyles

