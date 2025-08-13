#!/bin/bash

# Start the Malaria Detect API
echo "Starting Malaria Detect API..."
echo "Using main_real.py for production deployment"

# Run the application with uvicorn
exec uvicorn main_real:app --host 0.0.0.0 --port $PORT 