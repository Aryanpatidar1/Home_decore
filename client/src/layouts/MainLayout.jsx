import React, { useState, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AestheticQuizModal } from '../components/AestheticQuizModal';
import api from '../services/api';

export const MainLayout = () => {
  const [quizOpen, setQuizOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check if URL triggers quiz (e.g. ?trigger_quiz=true)
    if (searchParams.get('trigger_quiz') === 'true') {
      setQuizOpen(true);
      searchParams.delete('trigger_quiz');
      setSearchParams(searchParams);
    }

    // Fetch initial products for the quiz recommendation
    const loadProducts = async () => {
      try {
        const res = await api.get('/products?limit=6');
        if (res.data?.data) {
          setProducts(res.data.data);
        }
      } catch (e) {
        // Fallback silently if offline
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-body-md">
      <Navbar onOpenQuiz={() => setQuizOpen(true)} />
      <main className="flex-1">
        <Outlet context={{ onOpenQuiz: () => setQuizOpen(true), products }} />
      </main>
      <Footer onOpenQuiz={() => setQuizOpen(true)} />
      <AestheticQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        products={products}
      />
    </div>
  );
};
