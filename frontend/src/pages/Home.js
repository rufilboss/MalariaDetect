import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Microscope, 
  Upload, 
  Zap, 
  Shield, 
  BarChart3, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Microscope,
      title: 'Advanced AI Model',
      description: 'State-of-the-art CNN with 95%+ accuracy for reliable malaria detection'
    },
    {
      icon: Upload,
      title: 'Batch Processing',
      description: 'Process multiple images simultaneously for efficient workflow'
    },
    {
      icon: Zap,
      title: 'Real-time Results',
      description: 'Get instant classification results with confidence scores'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track performance and view detailed statistics'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share results and collaborate with your team'
    }
  ];

  const stats = [
    { label: 'Accuracy', value: '95%+' },
    { label: 'Processing Time', value: '< 1s' },
    { label: 'Images Processed', value: '27K+' },
    { label: 'Active Users', value: '500+' }
  ];

  return (
    <>
      <Helmet>
        <title>Malaria Detect - AI-Powered Diagnosis</title>
        <meta name="description" content="Advanced malaria cell classification using deep learning. Upload cell images and get instant, accurate results." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Malaria Cell
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    {' '}Classifier
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Advanced AI-powered solution for automated malaria cell classification. 
                  Upload blood cell images and get instant, accurate results with confidence scores.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/classify"
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Microscope className="w-5 h-5 mr-2" />
                    Start Classifying
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Solution?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built with cutting-edge technology and designed for medical professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of medical professionals who trust our AI-powered 
                malaria classification system
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/classify"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your First Image
                </Link>
                <Link
                  to="/batch-classify"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Batch Processing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Simple three-step process to get your results
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Upload Image',
                  description: 'Drag and drop your blood cell image or click to browse'
                },
                {
                  step: '2',
                  title: 'AI Analysis',
                  description: 'Our advanced CNN model analyzes the image in seconds'
                },
                {
                  step: '3',
                  title: 'Get Results',
                  description: 'Receive classification with confidence score and detailed report'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home; 