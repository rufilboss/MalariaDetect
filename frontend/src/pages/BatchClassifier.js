import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  BarChart3,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';

const BatchClassifier = () => {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useInfectedLabels, setUseInfectedLabels] = useState(false);
  const [showConfidence, setShowConfidence] = useState(true);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }
    
    if (imageFiles.length > 50) {
      toast.error('Maximum 50 images allowed per batch');
      return;
    }
    
    setFiles(imageFiles);
    setResults(null);
    toast.success(`${imageFiles.length} images selected for batch processing`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  const classifyBatch = async () => {
    if (files.length === 0) {
      toast.error('Please select images first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('use_infected_labels', useInfectedLabels);

      const response = await fetch(API_ENDPOINTS.BATCH_CLASSIFY, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      
      // Save batch results to localStorage for Results page
      const savedResults = JSON.parse(localStorage.getItem('malariaDetectResults') || '[]');
      data.results.forEach(result => {
        // Add batch_id to individual results for tracking
        const resultWithBatch = {
          ...result,
          batch_id: data.batch_id,
          timestamp: data.timestamp,
          model_used: data.model_used,
          label_type: data.label_type
        };
        savedResults.push(resultWithBatch);
      });
      localStorage.setItem('malariaDetectResults', JSON.stringify(savedResults));
      
      toast.success(`Batch processing completed! ${data.total_images} images processed`);
    } catch (error) {
      console.error('Batch classification error:', error);
      toast.error('Error processing batch. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const exportResults = () => {
    if (!results) return;

    const csvContent = [
      'Filename,Prediction,Confidence,Processing Time (s)',
      ...results.results.map(result => 
        `${result.filename},${result.prediction},${(result.confidence * 100).toFixed(2)}%,${result.processing_time.toFixed(3)}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `malaria-batch-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully!');
  };

  const getPredictionIcon = (prediction) => {
    const isInfected = prediction === 'Parasitized' || prediction === 'Infected';
    return isInfected ? (
      <XCircle className="w-5 h-5 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  };

  const getPredictionColor = (prediction) => {
    const isInfected = prediction === 'Parasitized' || prediction === 'Infected';
    return isInfected ? 'text-red-600' : 'text-green-600';
  };

  const getBatchStats = () => {
    if (!results) return null;

    const parasitizedCount = results.results.filter(r => 
      r.prediction === 'Parasitized' || r.prediction === 'Infected'
    ).length;
    const uninfectedCount = results.total_images - parasitizedCount;
    const avgConfidence = results.results.reduce((sum, r) => sum + r.confidence, 0) / results.total_images;

    return {
      parasitizedCount,
      uninfectedCount,
      avgConfidence,
      totalTime: results.total_processing_time
    };
  };

  const stats = getBatchStats();

  return (
    <>
      <Helmet>
        <title>Batch Classifier - Malaria Detect</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Batch Classifier
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload multiple cell images and classify them all at once. 
            Perfect for processing large datasets efficiently.
          </p>
        </div>

        {/* Label Preference Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-sm border">
            <span className="text-sm font-medium text-gray-700">Label Preference:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setUseInfectedLabels(false)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  !useInfectedLabels
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Parasitized/Uninfected
              </button>
              <button
                onClick={() => setUseInfectedLabels(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  useInfectedLabels
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Infected/Uninfected
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-gray-500 mb-4">
              or click to select files (max 50 images)
            </p>
            <p className="text-sm text-gray-400">
              Supports: JPG, PNG, GIF, BMP, WebP
            </p>
          </div>
        </motion.div>

        {/* Selected Files */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selected Files ({files.length})
                </h3>
                <button
                  onClick={() => setFiles([])}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <FileImage className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-700 truncate">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Process Button */}
        {files.length > 0 && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <button
              onClick={classifyBatch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Process {files.length} Images</span>
            </button>
          </motion.div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="bg-white rounded-lg p-6 shadow-sm border max-w-md mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Images...
              </h3>
              <p className="text-gray-600 mb-4">
                Please wait while we analyze your images
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Batch Statistics */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Batch Statistics
                  </h3>
                  <button
                    onClick={exportResults}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.total_images}
                    </div>
                    <div className="text-sm text-gray-600">Total Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.parasitizedCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      {useInfectedLabels ? 'Infected' : 'Parasitized'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.uninfectedCount}
                    </div>
                    <div className="text-sm text-gray-600">Uninfected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(stats.avgConfidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Confidence</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total Processing Time:</span>
                    <span className="font-medium">{stats.totalTime.toFixed(2)} seconds</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Average Time per Image:</span>
                    <span className="font-medium">{(stats.totalTime / results.total_images).toFixed(3)} seconds</span>
                  </div>
                </div>
              </div>

              {/* Individual Results */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Individual Results
                  </h3>
                  <button
                    onClick={() => setShowConfidence(!showConfidence)}
                    className="text-gray-600 hover:text-gray-700 flex items-center space-x-2"
                  >
                    {showConfidence ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="text-sm">
                      {showConfidence ? 'Hide' : 'Show'} Confidence
                    </span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Image</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Prediction</th>
                        {showConfidence && (
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Confidence</th>
                        )}
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((result, index) => (
                        <tr key={result.result_id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <FileImage className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-700 truncate max-w-xs">
                                {result.filename}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {getPredictionIcon(result.prediction)}
                              <span className={`font-medium ${getPredictionColor(result.prediction)}`}>
                                {result.prediction}
                              </span>
                            </div>
                          </td>
                          {showConfidence && (
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(result.confidence * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {(result.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {result.processing_time.toFixed(3)}s
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BatchClassifier; 