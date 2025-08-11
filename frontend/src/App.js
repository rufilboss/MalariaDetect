import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classifier from './pages/Classifier';
import BatchClassifier from './pages/BatchClassifier';
import Results from './pages/Results';
import Statistics from './pages/Statistics';
import About from './pages/About';
import Footer from './components/Footer';

// Context
import { AuthProvider } from './context/AuthContext';

// Styles
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/classify" element={<Classifier />} />
                  <Route path="/batch-classify" element={<BatchClassifier />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App; 