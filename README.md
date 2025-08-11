# 🦠 Malaria Detect

An advanced web application for automated malaria cell classification using deep learning. This project provides a comprehensive solution for medical professionals and researchers to quickly and accurately classify blood cell images as infected or uninfected with malaria parasites.

## 🌟 Features

### 🎯 Core Functionality

- **Single Image Classification**: Upload individual cell images for instant classification
- **Batch Processing**: Process multiple images simultaneously (up to 50 images)
- **Real-time Predictions**: Get results with confidence scores in seconds
- **Advanced AI Model**: CNN-based deep learning model with 95%+ accuracy

### 🎨 User Experience

- **Modern Web Interface**: Beautiful, responsive React frontend
- **Drag & Drop Upload**: Intuitive file upload with preview
- **Real-time Feedback**: Live progress indicators and status updates
- **Mobile Responsive**: Works seamlessly on all devices
- **Dark Mode Support**: Comfortable viewing in any lighting condition

### 🔧 Technical Features

- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Image Preprocessing**: Advanced image enhancement and validation
- **Result History**: Track and manage classification results
- **User Authentication**: Secure user management system
- **Statistics Dashboard**: Detailed analytics and insights
- **Model Versioning**: Track and manage model improvements

### 🚀 Deployment & Automation

- **Docker Support**: Containerized deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Model Auto-retraining**: Automated model updates with new data
- **Health Monitoring**: Built-in health checks and monitoring
- **Scalable Architecture**: Ready for production scaling

## 🏗️ Architecture

```sh
malaria-cell-classifier/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application entry point
│   ├── models/             # ML model and utilities
│   ├── utils/              # Helper utilities
│   ├── schemas/            # Pydantic models
│   └── tests/              # Backend tests
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets
├── scripts/                # Setup and utility scripts
├── nginx/                  # Nginx configuration
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/rufilboss/MalariaDetect.git
cd MalariaDetect
```

### 2. Automated Setup

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Start the Application

```bash
./start_all.sh
```

### 4. Access the Application

- **Web Interface**: `http://localhost:3000`
- **API Documentation**: `http://localhost:8000/docs`
- **API Health Check**: `http://localhost:8000/`

## 📖 Manual Setup

### Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend
cd backend
python main.py
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

## 🐳 Docker Deployment

### Local Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 🌐 Deployment Options

### Frontend Deployment

- **Netlify**: Connect your GitHub repository for automatic deployments
- **Vercel**: Deploy with zero configuration
- **AWS S3 + CloudFront**: For high-performance static hosting

### Backend Deployment

- **Heroku**: Easy deployment with Git integration
- **Railway**: Modern platform with automatic scaling
- **DigitalOcean App Platform**: Managed container deployment
- **AWS ECS**: Enterprise-grade container orchestration

### Database Options

- **SQLite**: Default for development (included)
- **PostgreSQL**: Production-ready database
- **MongoDB**: NoSQL option for flexible data storage

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
ENVIRONMENT=production
DATABASE_URL=postgresql://user:password@localhost/malaria_db
SECRET_KEY=your-secret-key-here
DEBUG=False

# Frontend Configuration
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_VERSION=2.0.0

# Model Configuration
MODEL_PATH=backend/models/saved_model
MODEL_INFO_PATH=backend/models/model_info.json
```

### API Configuration

The API supports the following endpoints:

- `POST /classify` - Single image classification
- `POST /classify/batch` - Batch image classification
- `GET /results/{result_id}` - Get specific result
- `GET /results/user/{user_id}` - Get user results
- `GET /stats` - Get API statistics
- `POST /model/retrain` - Trigger model retraining
- `GET /model/status` - Get model status

## 📊 Model Information

### Architecture

- **Type**: Convolutional Neural Network (CNN)
- **Input Size**: 128x128x3 RGB images
- **Output**: Binary classification (Parasitized/Uninfected)
- **Accuracy**: 95%+ on validation set
- **Training Data**: 27,558 cell images

### Model Layers

```sh
Conv2D(16) → MaxPool2D → Dropout(0.2)
Conv2D(32) → MaxPool2D → Dropout(0.3)
Conv2D(64) → MaxPool2D → Dropout(0.3)
Flatten → Dense(64) → Dropout(0.5) → Dense(1, sigmoid)
```

### Performance Metrics

- **Training Accuracy**: 95.6%
- **Validation Accuracy**: 94.5%
- **Average Processing Time**: < 1 second per image
- **Model Size**: ~2MB

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/React code
- Write tests for new features
- Update documentation as needed

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### End-to-End Tests

```bash
npm run test:e2e
```

## 📈 Performance Optimization

### Model Optimization

- Model quantization for faster inference
- TensorRT integration for GPU acceleration
- Batch processing optimization

### API Optimization

- Response caching with Redis
- Database query optimization
- Async processing for batch operations

### Frontend Optimization

- Code splitting and lazy loading
- Image compression and optimization
- Service worker for offline support

## 🔒 Security

### API Security

- JWT authentication
- Rate limiting
- Input validation and sanitization
- CORS configuration

### Data Privacy

- Secure file upload handling
- Data encryption at rest
- GDPR compliance features
- Audit logging

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Dataset provided by [NIH Malaria Dataset](https://lhncbc.nlm.nih.gov/publication/pub9932)
- Built with FastAPI, React, and TensorFlow
- Icons from Lucide React
- UI components from Headless UI

## 📞 Support

- **Documentation**: [Wiki](https://github.com/rufilboss/MalariaDetect/wiki)
- **Issues**: [GitHub Issues](https://github.com/rufilboss/MalariaDetect/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rufilboss/MalariaDetect/discussions)
- **Email**: [support@malariadetect.com](emailto:support@malariadetect.com)

## 🏆 Team

This project was developed by a team of 5 students as part and finall of their traning project. The team focused on creating a production-ready solution that could compete with commercial alternatives.

---

**Made with ❤️ for better healthcare through AI**