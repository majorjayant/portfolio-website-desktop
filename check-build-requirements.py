"""
Script to verify build requirements are installed
"""

import sys
import importlib.util
import os

# List of required packages
REQUIRED_PACKAGES = [
    "flask",
    "jinja2",
    "dotenv",
    "boto3",
    "botocore",
    "requests"
]

def check_package(package_name):
    """Check if a package is installed"""
    try:
        spec = importlib.util.find_spec(package_name)
        if spec is None:
            print(f"❌ Package {package_name} is NOT installed")
            return False
        else:
            print(f"✓ Package {package_name} is installed")
            return True
    except ImportError:
        print(f"❌ Error checking package {package_name}")
        return False

def main():
    """Main function to check all required packages"""
    print("Checking build requirements...")
    print(f"Python version: {sys.version}")
    print(f"Current working directory: {os.getcwd()}")
    
    # Check for static directory
    static_dir = os.path.join("app", "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
        print(f"✓ Created {static_dir} directory")
    else:
        print(f"✓ {static_dir} directory exists")
    
    # Check for data directory
    data_dir = os.path.join("app", "static", "data")
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"✓ Created {data_dir} directory")
    else:
        print(f"✓ {data_dir} directory exists")
    
    # Check for required packages
    missing_packages = []
    for package in REQUIRED_PACKAGES:
        if not check_package(package):
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Error: Missing {len(missing_packages)} required packages: {', '.join(missing_packages)}")
        return 1
    else:
        print("✓ All required packages are installed")
        return 0

if __name__ == "__main__":
    sys.exit(main())
