import React from 'react';
import { Helmet } from 'react-helmet-async';

const Results = () => {
  return (
    <>
      <Helmet>
        <title>Results - Malaria Detect</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Results</h1>
        <p className="text-center text-gray-600">Results history coming soon...</p>
      </div>
    </>
  );
};

export default Results; 