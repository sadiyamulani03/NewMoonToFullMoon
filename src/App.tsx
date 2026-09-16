import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { MidnightProvider } from './context/MidnightContext';
import { DemoProvider } from './context/DemoContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import MarketingLayout from './components/MarketingLayout';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import CreateCase from './pages/CreateCase';
import Auditor from './pages/Auditor';
import About from './pages/About';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import './styles.css';

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <MidnightProvider>
          <ErrorBoundary>
            <Routes>
              <Route element={<MarketingLayout />}>
                <Route path="/" element={<Landing />} />
              </Route>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/new" element={<CreateCase />} />
                <Route path="/audit" element={<Auditor />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </MidnightProvider>
      </DemoProvider>
    </BrowserRouter>
  );
}