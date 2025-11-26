import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Google Sans', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #ffffff;
    color: #202124;
  }

  #root {
    min-height: 100vh;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  /* Scrollbar styles - Google Keep style */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #dadce0;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #bdc1c6;
  }

  /* Selection color */
  ::selection {
    background-color: rgba(255, 193, 7, 0.3);
  }

  /* Focus outline - Google style */
  *:focus-visible {
    outline: 2px solid #1a73e8;
    outline-offset: 2px;
  }

  /* Disable default focus for mouse users */
  *:focus:not(:focus-visible) {
    outline: none;
  }
`;
