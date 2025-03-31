#!/bin/bash
# Amplify build debugging helper script

echo "============================================="
echo "AMPLIFY BUILD DIAGNOSTIC SCRIPT"
echo "============================================="

# System information
echo -e "\n--- SYSTEM INFORMATION ---"
echo "Operating System: $(uname -a)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Python environment
echo -e "\n--- PYTHON ENVIRONMENT ---"
echo "Python version: $(python --version 2>&1)"
echo "Python path: $(which python 2>&1)"
echo "Pip version: $(pip --version 2>&1)"
echo "Python executable: $(python -c "import sys; print(sys.executable)" 2>&1)"
echo "Python path:"
python -c "import sys; print('\n'.join(sys.path))" 2>&1

# Check critical files
echo -e "\n--- CRITICAL FILES CHECK ---"
echo "Checking amplify.yml:"
if [ -f "amplify.yml" ]; then
    echo "✓ amplify.yml exists"
    cat amplify.yml
else
    echo "✗ amplify.yml not found!"
fi

echo -e "\nChecking requirements-dev.txt:"
if [ -f "requirements-dev.txt" ]; then
    echo "✓ requirements-dev.txt exists"
    cat requirements-dev.txt
else
    echo "✗ requirements-dev.txt not found!"
fi

echo -e "\nChecking build_static_site.py:"
if [ -f "build_static_site.py" ]; then
    echo "✓ build_static_site.py exists"
    head -n 20 build_static_site.py
    echo "..."
else
    echo "✗ build_static_site.py not found!"
fi

# Check output directory
echo -e "\n--- OUTPUT DIRECTORY CHECK ---"
if [ -d "app/static" ]; then
    echo "✓ app/static directory exists"
    ls -la app/static
    
    echo -e "\nChecking for index.html:"
    if [ -f "app/static/index.html" ]; then
        echo "✓ index.html exists"
        echo "First 20 lines of index.html:"
        head -n 20 app/static/index.html
    else
        echo "✗ index.html not found!"
    fi
else
    echo "✗ app/static directory not found!"
fi

# Environment variables
echo -e "\n--- ENVIRONMENT VARIABLES ---"
echo "AWS_REGION: $AWS_REGION"
echo "STATIC_DEPLOYMENT: $STATIC_DEPLOYMENT"

# Generate summary of findings
echo -e "\n============================================="
echo "DIAGNOSTIC SUMMARY"
echo "============================================="

if [ -f "amplify.yml" ] && [ -f "requirements-dev.txt" ] && [ -f "build_static_site.py" ]; then
    echo "✓ All build configuration files are present"
else
    echo "✗ Some build configuration files are missing!"
fi

if [ -d "app/static" ] && [ -f "app/static/index.html" ]; then
    echo "✓ Output directory and index.html exist"
else
    echo "✗ Output directory or index.html is missing!"
fi

echo -e "\nPlease attach this output when reporting issues."
echo "=============================================" 