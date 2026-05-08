import { createGlobalStyle } from "styled-components"
import { AppColors } from "./colors"

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${AppColors.background};
    color: ${AppColors.text};
    line-height: 1.5;
    min-height: 100vh;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .content {
    display: flex;
    flex: 1;
  }

  main {
    flex: 1;
    padding-top: 60px;
  }

  main.with-sidebar {
    margin-left: 250px;
  }

  @media (max-width: 768px) {
    main.with-sidebar {
      margin-left: 0;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
  }

  a {
    color: ${AppColors.primary};
    text-decoration: none;
  }

  button {
    cursor: pointer;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`

export default GlobalStyle

