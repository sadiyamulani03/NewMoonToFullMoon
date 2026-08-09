import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { MidnightProvider } from './context/MidnightContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import CreateCase from './pages/CreateCase';
import About from './pages/About';
import './styles.css';

export default function App() {
  return (
    <BrowserRouter>
      <MidnightProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/new" element={<CreateCase />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </MidnightProvider>
    </BrowserRouter>
  );
}