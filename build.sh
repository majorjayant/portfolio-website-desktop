#!/bin/bash

# Exit on error
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Setting environment variables..."
export FLASK_APP=application.py
export FLASK_ENV=production
export STATIC_DEPLOYMENT=false

echo "Creating necessary directories..."
mkdir -p app/static/temp

echo "Running database migrations..."
flask db upgrade

echo "Creating admin user..."
python -c "from app import create_app; from app.models import Admin; app = create_app(); app.app_context().push(); Admin.create_admin('admin', 'admin') if not Admin.query.first() else None"

echo "Build completed successfully!" 