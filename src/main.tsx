import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { generateOrganizationStructuredData, generateWebSiteStructuredData, injectStructuredData } from './utils/structuredData';

// Inject global structured data for SEO
injectStructuredData(generateOrganizationStructuredData());
injectStructuredData(generateWebSiteStructuredData());

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
