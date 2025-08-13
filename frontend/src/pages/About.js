import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  CpuChipIcon,
  BeakerIcon,
  UserGroupIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ChartBarIcon,
  CameraIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const About = () => {
  // Team data with actual member images
  const teamMembers = [
    {
      id: 1,
      name: "Mujaheedah Olorunju Zakariyyah",
      role: "Project Lead",
      image: require("../images/mujeedah.jpg"),
      description: "A Google-certified Project Management Professional (PMP). Leading the development of our AI-powered malaria detection system with expertise in machine learning and web development.",
      skills: ["Python", "React", "TensorFlow", "FastAPI"]
    },
    {
      id: 2,
      name: "Ilyas Rufai", 
      role: "Full-Stack Engineer",
      image: require("../images/rufilboss.jpg"),
      description: "Specializing in deep learning models and computer vision for medical image analysis.",
      skills: ["TensorFlow", "OpenCV", "Python", "React", "FastAPI", "Data Science", "Chart.js", "Docker"]
    },
    {
      id: 3,
      name: "AdbulRahman Musa",
      role: "Software Engineer",
      image: require("../images/musa.png"),
      // image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      description: "Creating beautiful and intuitive user interfaces for healthcare professionals.",
      skills: ["React", "JavaScript", "CSS", "UI/UX"]
    },
    {
      id: 4,
      name: "Makinde Sanni",
      role: "AI & ML Engineer",
      image: require("../images/makindesanni.png"),
      description: "AI and medical robotics enthusiast with a strong interest in data science, passionate about leveraging technology to solve real-world problems.",
      skills: ["Data Analysis", "Statistics", "Python", "Pandas"]
    }, 
    {
      id: 5,
      name: "Ismail Sirajudeen Temitope",
      role: "Software Engineer",
      image: require("../images/ismail.png"),
      description: "Building robust APIs and ensuring system reliability and performance.",
      skills: ["Python", "FastAPI", "PostgreSQL", "Docker"]
    },
    {
      id: 6,
      name: "Ajirola Amudat",
      role: "Software Engineer",
      image: require("../images/ajirola.png"),
      description: "Managing deployment, CI/CD pipelines, and ensuring system scalability.",
      skills: ["Docker", "AWS", "GitHub Actions", "Linux"]
    },
    {
      id: 7,
      name: "Team Member 7",
      role: "UI/UX Designer",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      description: "Designing user experiences that make medical diagnosis accessible and efficient.",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"]
    }
  ];

  const technologies = [
    { name: "TensorFlow", icon: CpuChipIcon, description: "Deep learning framework for model training" },
    { name: "React", icon: CodeBracketIcon, description: "Frontend framework for user interface" },
    { name: "FastAPI", icon: RocketLaunchIcon, description: "High-performance backend API" },
    { name: "OpenCV", icon: CameraIcon, description: "Computer vision for image processing" },
    { name: "Chart.js", icon: ChartBarIcon, description: "Data visualization and analytics" },
    { name: "Docker", icon: BeakerIcon, description: "Containerization for deployment" }
  ];

  const features = [
    {
      title: "AI-Powered Detection",
      description: "Advanced convolutional neural networks trained on thousands of cell images",
      icon: CpuChipIcon
    },
    {
      title: "Real-time Analysis",
      description: "Instant classification results with high accuracy and confidence scores",
      icon: ChartBarIcon
    },
    {
      title: "Batch Processing",
      description: "Process multiple images simultaneously for efficient screening",
      icon: CameraIcon
    },
    {
      title: "Medical Grade",
      description: "Built with healthcare standards in mind for reliable diagnoses",
      icon: ShieldCheckIcon
    }
  ];

  return (
    <>
      <Helmet>
        <title>About - Malaria Detect</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6"
            >
              <HeartIcon className="h-10 w-10" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Malaria Detect
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing malaria diagnosis through artificial intelligence and cutting-edge technology
            </p>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-16">
          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Malaria Detect is dedicated to leveraging artificial intelligence to provide rapid, 
                accurate, and accessible malaria diagnosis. Our goal is to support healthcare 
                professionals in early detection and treatment, ultimately saving lives in 
                malaria-endemic regions worldwide.
              </p>
            </div>
          </motion.section>

          {/* How It Works */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our AI-powered system analyzes blood cell images to detect malaria parasites with remarkable accuracy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Technology Stack */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Technology Stack
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Built with modern technologies for performance, scalability, and reliability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-shrink-0">
                    <tech.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tech.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {tech.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                A diverse team of 7 passionate developers, designers, and researchers working together 
                to make malaria diagnosis accessible to everyone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      {member.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Have questions about our malaria detection system? We'd love to hear from you!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">rufilboss@gmail.com</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <PhoneIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">+234 (901) 238-9838</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">University Campus</p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default About; 