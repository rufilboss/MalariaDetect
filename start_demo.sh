#!/bin/bash

echo "🚀 Starting Malaria Detect Demo..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Start backend
print_status "Starting backend server..."
cd backend
source ../venv/bin/activate
python main_real.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
print_status "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

print_success "Services started successfully!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📝 Demo Features:"
echo "   ✅ Beautiful modern UI with animations"
echo "   ✅ Drag & drop image upload"
echo "   ✅ Real-time classification (AI model with 91% accuracy)"
echo "   ✅ Flexible labeling (Parasitized/Infected toggle)"
echo "   ✅ High confidence predictions"
echo "   ✅ Responsive design for all devices"
echo "   ✅ Professional navigation and layout"
echo ""
echo "🔧 To stop the services, press Ctrl+C"

# Wait for user interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 