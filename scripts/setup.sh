#!/bin/bash

# Malaria Detect Setup Script
# This script sets up the entire project environment

set -e

echo "🚀 Setting up Malaria Detect Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python $PYTHON_VERSION found"
    else
        print_error "Python 3 is required but not installed"
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION found"
    else
        print_error "Node.js is required but not installed"
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker found"
    else
        print_warning "Docker not found. Docker installation is optional for local development"
    fi
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    source venv/bin/activate
    
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    print_success "Python dependencies installed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        npm install
        print_success "Node.js dependencies installed"
    else
        print_status "Node.js dependencies already installed"
    fi
    
    cd ..
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/models
    mkdir -p backend/data
    mkdir -p backend/static
    mkdir -p backend/logs
    mkdir -p frontend/build
    mkdir -p nginx/ssl
    
    print_success "Directories created"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    python -c "
from utils.database import DatabaseManager
import asyncio

async def setup_db():
    db = DatabaseManager()
    await db.initialize()
    print('Database initialized successfully')

asyncio.run(setup_db())
"
    cd ..
    
    print_success "Database setup complete"
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Malaria Detect Environment Variables

# Backend Configuration
ENVIRONMENT=development
DATABASE_URL=sqlite:///malaria_classifier.db
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_VERSION=2.0.0

# Model Configuration
MODEL_PATH=backend/models/saved_model
MODEL_INFO_PATH=backend/models/model_info.json

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=backend/logs/app.log
EOF
        print_success "Environment file created"
    else
        print_status "Environment file already exists"
    fi
}

# Create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Backend startup script
    cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "Starting Malaria Classifier Backend..."
cd backend
source ../venv/bin/activate
python main.py
EOF
    chmod +x start_backend.sh
    
    # Frontend startup script
    cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "Starting Malaria Classifier Frontend..."
cd frontend
npm start
EOF
    chmod +x start_frontend.sh
    
    # Full startup script
    cat > start_all.sh << 'EOF'
#!/bin/bash
echo "Starting Malaria Detect Application..."

# Start backend in background
./start_backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
./start_frontend.sh &
FRONTEND_PID=$!

echo "Application started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Access the application at: http://localhost:3000"
echo "API documentation at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
    chmod +x start_all.sh
    
    print_success "Startup scripts created"
}

# Main setup function
main() {
    print_status "Starting setup process..."
    
    # Check prerequisites
    check_python
    check_node
    check_docker
    
    # Create directories
    create_directories
    
    # Setup Python environment
    setup_python_env
    
    # Setup frontend
    setup_frontend
    
    # Setup database
    setup_database
    
    # Create environment file
    create_env_file
    
    # Create startup scripts
    create_startup_scripts
    
    print_success "Setup completed successfully!"
    echo ""
    echo "🎉 Malaria Detect is ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Activate the virtual environment: source venv/bin/activate"
    echo "2. Start the application: ./start_all.sh"
    echo "3. Access the web interface: http://localhost:3000"
    echo "4. View API documentation: http://localhost:8000/docs"
    echo ""
    echo "For development:"
    echo "- Backend only: ./start_backend.sh"
    echo "- Frontend only: ./start_frontend.sh"
    echo ""
    echo "For production deployment:"
    echo "- Use Docker: docker-compose up -d"
    echo "- Or deploy to Netlify/Vercel for frontend"
    echo "- Deploy backend to Heroku/Railway/DigitalOcean"
}

# Run main function
main "$@" 