#!/usr/bin/env python
"""
Simple script to check if all required build dependencies are installed
"""

import sys
import importlib
import os

# List of required packages for the build
REQUIRED_PACKAGES = [
    'flask',
    'jinja2',
    'python-dotenv',
    'boto3',
    'botocore'
]

def check_package(package_name):
    """Check if a package is installed"""
    try:
        importlib.import_module(package_name.replace('-', '_'))
        return True
    except ImportError:
        return False

def main():
    """Main function to check dependencies"""
    print("Checking build requirements...")
    
    # Check Python version
    python_version = sys.version_info
    print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Check for all required packages
    missing_packages = []
    for package in REQUIRED_PACKAGES:
        if check_package(package):
            print(f"✓ {package} installed")
        else:
            print(f"✗ {package} NOT installed")
            missing_packages.append(package)
    
    # Check environment variables
    print("\nChecking environment variables:")
    env_vars = [
        'AWS_REGION', 
        'STATIC_DEPLOYMENT'
    ]
    
    for var in env_vars:
        if var in os.environ:
            print(f"✓ {var} is set")
        else:
            print(f"! {var} is not set (may be set in a later step)")
    
    # Final summary
    if missing_packages:
        print("\n❌ Missing required packages: " + ", ".join(missing_packages))
        sys.exit(1)
    else:
        print("\n✅ All required packages are installed")
        sys.exit(0)

if __name__ == "__main__":
    main() 