import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/src/features/showcase/components/layout/Header';
import Footer from '@/src/features/showcase/components/layout/Footer';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-teal-100">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
