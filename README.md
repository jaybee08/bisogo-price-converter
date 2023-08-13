
1. **Rollback to Node.js 14:**
   You encountered an issue related to a syntax error (`Unexpected token '??='`) which was likely caused by using a version of Node.js that didn't support this syntax. By rolling back to Node.js 14, you ensured compatibility with your codebase.

2. **Rollback Dependencies in package.json:**
   In your `package.json`, you rolled back the versions of various dependencies, including `next`, `styled-components`, and others, to versions that were working with your setup.

   ```json
   "dependencies": {
     "babel-plugin-styled-components": "latest",
     "next": "canary",
     "prop-types": "latest",
     "react": "latest",
     "react-dom": "latest",
     "styled-components": "latest",
     "webpack": "latest"
   },
   "devDependencies": {
     "eslint": "latest",
     "babel-eslint": "latest",
     "eslint-config-airbnb": "latest",
     "eslint-config-mcansh": "latest",
     "eslint-config-prettier": "latest",
     "eslint-plugin-import": "latest",
     "eslint-plugin-jsx-a11y": "latest",
     "eslint-plugin-react": "latest",
     "eslint-plugin-prettier": "latest",
     "prettier": "latest"
   }
   ```

3. **Update `_app.js` for Next.js v11:**
   You updated the `_app.js` file to work with the newer version of Next.js (v11 or later), which removed the need for the `<Container>` component. You replaced it with the `ThemeProvider` and `GlobalStyles` components.

   ```jsx
   import React from 'react';
   import { createGlobalStyle, ThemeProvider } from 'styled-components';
   import theme from '../config';

   const GlobalStyles = createGlobalStyle`
     /* ... Global styles definition ... */
   `;

   class MyApp extends React.Component {
     // ... rest of your component code ...

     render() {
       const { Component, pageProps } = this.props;

       return (
         <ThemeProvider theme={theme}>
           <GlobalStyles />
           <Component {...pageProps} />
         </ThemeProvider>
       );
     }
   }

   export default MyApp;
   ```