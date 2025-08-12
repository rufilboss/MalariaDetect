import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import axios from 'axios';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Statistics = () => {
  const [modelStatus, setModelStatus] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statusResponse, statsResponse] = await Promise.all([
        axios.get('/model/status'),
        axios.get('/stats')
      ]);
      
      setModelStatus(statusResponse.data);
      setApiStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Chart data for model performance
  const performanceData = {
    labels: ['Training Accuracy', 'Validation Accuracy', 'Test Accuracy'],
    datasets: [
      {
        label: 'Accuracy (%)',
        data: [
          modelStatus?.model_info?.final_train_accuracy * 100 || 0,
          modelStatus?.model_info?.final_val_accuracy * 100 || 0,
          modelStatus?.model_info?.final_test_accuracy * 100 || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for classification distribution
  const classificationData = {
    labels: ['Parasitized', 'Uninfected'],
    datasets: [
      {
        data: [
          apiStats?.parasitized_count || 0,
          apiStats?.uninfected_count || 0
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart data for processing time trends
  const processingTimeData = {
    labels: ['Last Hour', 'Last 6 Hours', 'Last 12 Hours', 'Last 24 Hours'],
    datasets: [
      {
        label: 'Average Processing Time (ms)',
        data: [
          apiStats?.avg_processing_time_1h || 0,
          apiStats?.avg_processing_time_6h || 0,
          apiStats?.avg_processing_time_12h || 0,
          apiStats?.average_processing_time || 0
        ],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Statistics - Malaria Detect</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistics Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time insights into model performance and system metrics</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        {/* Model Status Alert */}
        {modelStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-lg border ${
              modelStatus.model_loaded
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {modelStatus.model_loaded ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">
                {modelStatus.model_loaded ? 'Model is loaded and ready' : 'Model is not loaded'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Model Accuracy"
            value={`${((modelStatus?.accuracy || 0) * 100).toFixed(1)}%`}
            icon={ChartBarIcon}
            color="bg-green-500"
            subtitle="Validation accuracy"
          />
          <StatCard
            title="Total Classifications"
            value={apiStats?.total_classifications || 0}
            icon={CpuChipIcon}
            color="bg-blue-500"
            subtitle="All time"
          />
          <StatCard
            title="Avg Processing Time"
            value={`${(apiStats?.average_processing_time || 0).toFixed(2)}ms`}
            icon={ClockIcon}
            color="bg-purple-500"
            subtitle="Per image"
          />
          <StatCard
            title="Model Parameters"
            value={modelStatus?.total_parameters?.toLocaleString() || 0}
            icon={InformationCircleIcon}
            color="bg-orange-500"
            subtitle="Trainable parameters"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Model Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
            <Bar data={performanceData} options={chartOptions} />
          </motion.div>

          {/* Classification Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification Distribution</h3>
            <Doughnut data={classificationData} options={chartOptions} />
          </motion.div>
        </div>

        {/* Processing Time Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Time Trends</h3>
          <Line data={processingTimeData} options={chartOptions} />
        </motion.div>

        {/* Model Information */}
        {modelStatus?.model_info && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Architecture</p>
                <p className="text-gray-900">{modelStatus.model_info.architecture || 'CNN'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Input Shape</p>
                <p className="text-gray-900">{modelStatus.input_shape?.join(' × ') || '128 × 128 × 3'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-gray-900">{modelStatus.class_names?.join(', ') || 'Uninfected, Parasitized'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Version</p>
                <p className="text-gray-900">{modelStatus.model_info.version || '1.0'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-gray-900">
                  {modelStatus.model_info.created_at 
                    ? new Date(modelStatus.model_info.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`font-medium ${modelStatus.model_loaded ? 'text-green-600' : 'text-red-600'}`}>
                  {modelStatus.model_loaded ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Statistics; 