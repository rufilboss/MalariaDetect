import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Download,
  Share2,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Classifier = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [useInfectedLabels, setUseInfectedLabels] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setPrediction(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      toast.success('Image uploaded successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const classifyImage = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post(API_ENDPOINTS.CLASSIFY, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          use_infected_labels: useInfectedLabels
        }
      });

      setPrediction(response.data);
      
      // Save result to localStorage for Results page
      const savedResults = JSON.parse(localStorage.getItem('malariaDetectResults') || '[]');
      savedResults.push(response.data);
      localStorage.setItem('malariaDetectResults', JSON.stringify(savedResults));
      
      toast.success('Classification completed!');
    } catch (error) {
      console.error('Classification error:', error);
      toast.error(error.response?.data?.detail || 'Classification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPrediction(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const downloadResult = () => {
    if (!prediction) return;
    
    const resultText = `
Malaria Cell Classification Result
==================================
Filename: ${prediction.filename}
Prediction: ${prediction.prediction}
Confidence: ${(prediction.confidence * 100).toFixed(2)}%
Processing Time: ${prediction.processing_time.toFixed(3)}s
Timestamp: ${new Date(prediction.timestamp).toLocaleString()}
    `;
    
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `malaria_classification_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResult = async () => {
    if (!prediction) return;
    
    const shareText = `Malaria Cell Classification: ${prediction.prediction} (${(prediction.confidence * 100).toFixed(1)}% confidence)`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Malaria Classification Result',
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success('Result copied to clipboard!');
    }
  };

  return (
    <>
      <Helmet>
        <title>Malaria Detect - Single Image</title>
        <meta name="description" content="Upload and classify a single malaria cell image with our advanced AI model" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Malaria Detect
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload a single cell image and get instant classification results with confidence scores
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${uploadedFile ? 'border-green-500 bg-green-50' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                <AnimatePresence mode="wait">
                  {!uploadedFile ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or click to select a file
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Supports: JPG, PNG, BMP, TIFF (max 10MB)
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <FileImage className="mx-auto h-12 w-12 text-green-500" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Label Preference Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Label Preference</h3>
                  <p className="text-xs text-gray-500">
                    Choose between medical and simplified terminology
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${!useInfectedLabels ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    Parasitized
                  </span>
                  <button
                    onClick={() => setUseInfectedLabels(!useInfectedLabels)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${useInfectedLabels ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${useInfectedLabels ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                  <span className={`text-sm ${useInfectedLabels ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    Infected
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={classifyImage}
                  disabled={!uploadedFile || isLoading}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                    ${!uploadedFile || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Classifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Classify Image
                    </>
                  )}
                </button>
                
                {uploadedFile && (
                  <button
                    onClick={resetUpload}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Classification Results
                </h2>
                
                <AnimatePresence mode="wait">
                  {!prediction ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        Upload an image and click "Classify" to see results
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {/* Prediction */}
                      <div className="text-center">
                        <div className={`
                          inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold
                          ${prediction.prediction === 'Parasitized' || prediction.prediction === 'Infected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                          }
                        `}>
                          {prediction.prediction === 'Parasitized' || prediction.prediction === 'Infected' ? (
                            <XCircle className="h-6 w-6" />
                          ) : (
                            <CheckCircle className="h-6 w-6" />
                          )}
                          {prediction.prediction}
                        </div>
                      </div>

                      {/* Confidence Bar */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Confidence</span>
                          <span>{(prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prediction.confidence * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`
                              h-3 rounded-full transition-colors
                              ${prediction.confidence > 0.8
                                ? 'bg-green-500'
                                : prediction.confidence > 0.6
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              }
                            `}
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Filename</span>
                          <span className="font-medium">{prediction.filename}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Processing Time</span>
                          <span className="font-medium">{prediction.processing_time.toFixed(3)}s</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Timestamp</span>
                          <span className="font-medium">
                            {new Date(prediction.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={downloadResult}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          onClick={shareResult}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Classifier; 