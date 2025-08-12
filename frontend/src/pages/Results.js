import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrediction, setFilterPrediction] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showConfidence, setShowConfidence] = useState(true);
  const [selectedResults, setSelectedResults] = useState([]);

  // Load results from localStorage on component mount
  useEffect(() => {
    const savedResults = localStorage.getItem('malariaDetectResults');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);
        setFilteredResults(parsedResults);
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error('Failed to load saved results');
      }
    }
  }, []);

  // Filter and sort results when filters change
  useEffect(() => {
    let filtered = [...results];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.prediction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.result_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply prediction filter
    if (filterPrediction !== 'all') {
      filtered = filtered.filter(result => result.prediction === filterPrediction);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'processing_time':
          aValue = a.processing_time;
          bValue = b.processing_time;
          break;
        case 'filename':
          aValue = a.filename?.toLowerCase();
          bValue = b.filename?.toLowerCase();
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredResults(filtered);
  }, [results, searchTerm, filterPrediction, sortBy, sortOrder]);

  const clearAllResults = () => {
    if (window.confirm('Are you sure you want to clear all results? This action cannot be undone.')) {
      localStorage.removeItem('malariaDetectResults');
      setResults([]);
      setFilteredResults([]);
      setSelectedResults([]);
      toast.success('All results cleared');
    }
  };

  const deleteSelectedResults = () => {
    if (selectedResults.length === 0) {
      toast.error('No results selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedResults.length} selected result(s)?`)) {
      const updatedResults = results.filter(result => !selectedResults.includes(result.result_id));
      setResults(updatedResults);
      setSelectedResults([]);
      localStorage.setItem('malariaDetectResults', JSON.stringify(updatedResults));
      toast.success(`${selectedResults.length} result(s) deleted`);
    }
  };

  const exportResults = () => {
    if (filteredResults.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csvContent = [
      // CSV header
      ['Result ID', 'Filename', 'Prediction', 'Confidence', 'Processing Time (ms)', 'Timestamp', 'Model Used', 'Label Type'].join(','),
      // CSV data
      ...filteredResults.map(result => [
        result.result_id,
        result.filename,
        result.prediction,
        result.confidence,
        result.processing_time,
        result.timestamp,
        result.model_used,
        result.label_type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `malaria-detect-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully');
  };

  const toggleResultSelection = (resultId) => {
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const selectAllResults = () => {
    setSelectedResults(filteredResults.map(result => result.result_id));
  };

  const deselectAllResults = () => {
    setSelectedResults([]);
  };

  const getPredictionIcon = (prediction) => {
    if (prediction === 'Parasitized' || prediction === 'Infected') {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getPredictionColor = (prediction) => {
    if (prediction === 'Parasitized' || prediction === 'Infected') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTime = (seconds) => {
    return `${(seconds * 1000).toFixed(2)}ms`;
  };

  const formatConfidence = (confidence) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  // Calculate statistics
  const totalResults = results.length;
  const parasitizedCount = results.filter(r => r.prediction === 'Parasitized' || r.prediction === 'Infected').length;
  const uninfectedCount = results.filter(r => r.prediction === 'Uninfected').length;
  const averageConfidence = results.length > 0 
    ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
    : 0;
  const averageProcessingTime = results.length > 0
    ? results.reduce((sum, r) => sum + r.processing_time, 0) / results.length
    : 0;

  return (
    <>
      <Helmet>
        <title>Results - Malaria Detect</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Classification Results</h1>
              <p className="text-gray-600">
                View and manage your malaria detection results from this session
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <button
                onClick={exportResults}
                disabled={filteredResults.length === 0}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              
              <button
                onClick={clearAllResults}
                disabled={results.length === 0}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          {totalResults > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Results</p>
                    <p className="text-2xl font-bold text-gray-900">{totalResults}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Parasitized/Infected</p>
                    <p className="text-2xl font-bold text-red-600">{parasitizedCount}</p>
                  </div>
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Uninfected</p>
                    <p className="text-2xl font-bold text-green-600">{uninfectedCount}</p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-purple-600">{formatConfidence(averageConfidence)}</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Prediction Filter */}
              <select
                value={filterPrediction}
                onChange={(e) => setFilterPrediction(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Predictions</option>
                <option value="Parasitized">Parasitized</option>
                <option value="Infected">Infected</option>
                <option value="Uninfected">Uninfected</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="timestamp">Sort by Date</option>
                <option value="confidence">Sort by Confidence</option>
                <option value="processing_time">Sort by Processing Time</option>
                <option value="filename">Sort by Filename</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Selection Controls */}
            {filteredResults.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectAllResults}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllResults}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Deselect All
                  </button>
                  {selectedResults.length > 0 && (
                    <button
                      onClick={deleteSelectedResults}
                      className="flex items-center text-sm text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedResults.length})
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowConfidence(!showConfidence)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  {showConfidence ? <EyeSlashIcon className="h-4 w-4 mr-1" /> : <EyeIcon className="h-4 w-4 mr-1" />}
                  {showConfidence ? 'Hide' : 'Show'} Confidence
                </button>
              </div>
            )}
          </motion.div>

          {/* Results Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {results.length === 0 ? 'No results yet' : 'No results match your filters'}
                </h3>
                <p className="text-gray-600">
                  {results.length === 0 
                    ? 'Start by classifying some images to see results here.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                          onChange={(e) => e.target.checked ? selectAllResults() : deselectAllResults()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filename
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prediction
                      </th>
                      {showConfidence && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Processing Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredResults.map((result, index) => (
                        <motion.tr
                          key={result.result_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(result.result_id)}
                              onChange={() => toggleResultSelection(result.result_id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getPredictionIcon(result.prediction)}
                              <span className="ml-2 text-sm text-gray-900">
                                {result.result_id.slice(0, 8)}...
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {result.filename}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPredictionColor(result.prediction)}`}>
                              {result.prediction}
                            </span>
                          </td>
                          {showConfidence && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${result.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">
                                  {formatConfidence(result.confidence)}
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(result.processing_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(result.timestamp)}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Results Summary */}
          {filteredResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center text-sm text-gray-600"
            >
              Showing {filteredResults.length} of {totalResults} results
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Results; 