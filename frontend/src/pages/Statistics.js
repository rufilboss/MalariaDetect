import React from 'react';
import { Helmet } from 'react-helmet-async';

const Statistics = () => {
  return (
    <>
      <Helmet>
        <title>Statistics - Malaria Detect</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Statistics</h1>
        <p className="text-center text-gray-600">Analytics dashboard coming soon...</p>
      </div>
    </>
  );
};

export default Statistics; 