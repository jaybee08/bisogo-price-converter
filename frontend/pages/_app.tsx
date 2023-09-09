import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import theme from '../../config';


const GlobalStyles = createGlobalStyle`
  html {
    font-size: 10px;
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
    margin: 0;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  }
`;

class MyApp extends React.Component {
  // ... rest of your component code

  render() {
    const { Component, pageProps } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <GlobalStyles /> {/* Add the GlobalStyles component */}
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }
}

export default MyApp;
