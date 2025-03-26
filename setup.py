#!/usr/bin/env python
"""
Setup script for the Portfolio Website
This script sets up the development environment and runs the application.
"""

import os
import sys
import subprocess
import platform

def print_header(message):
    """Print a header message"""
    print("\n" + "=" * 80)
    print(message)
    print("=" * 80)

def check_python_version():
    """Check the Python version"""
    print_header("Checking Python version")
    
    # Get Python version
    python_version = sys.version.split()[0]
    print(f"Python version: {python_version}")
    
    # Check if version is 3.6+
    major, minor, *_ = python_version.split(".")
    if int(major) < 3 or (int(major) == 3 and int(minor) < 6):
        print("Error: Python 3.6+ is required")
        sys.exit(1)
    
    print("Python version is compatible")

def create_virtual_env():
    """Create a virtual environment if it doesn't exist"""
    print_header("Setting up virtual environment")
    
    venv_dir = "venv"
    if os.path.exists(venv_dir):
        print(f"Virtual environment already exists at {venv_dir}")
        return True
    
    try:
        print(f"Creating virtual environment at {venv_dir}")
        subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
        print("Virtual environment created successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error creating virtual environment: {str(e)}")
        return False

def install_dependencies():
    """Install dependencies from requirements.txt"""
    print_header("Installing dependencies")
    
    # Determine the pip command based on the OS
    if platform.system() == "Windows":
        pip_cmd = os.path.join("venv", "Scripts", "pip")
    else:
        pip_cmd = os.path.join("venv", "bin", "pip")
    
    # Check if requirements.txt exists
    if not os.path.exists("requirements.txt"):
        print("Error: requirements.txt not found")
        return False
    
    try:
        print("Installing dependencies from requirements.txt")
        subprocess.run([pip_cmd, "install", "-r", "requirements.txt"], check=True)
        print("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {str(e)}")
        return False

def setup_environment():
    """Set up environment variables"""
    print_header("Setting up environment variables")
    
    # Create .env file if it doesn't exist
    env_file = ".env"
    if os.path.exists(env_file):
        print(f"{env_file} file already exists")
        return
    
    with open(env_file, "w") as f:
        f.write("# Flask environment variables\n")
        f.write("FLASK_APP=run.py\n")
        f.write("FLASK_ENV=development\n")
        f.write("FLASK_DEBUG=1\n")
        f.write("\n# Database configuration\n")
        f.write("DATABASE_URL=sqlite:///app.db\n")
        f.write("\n# Secret key (generate a new one for production)\n")
        f.write("SECRET_KEY=dev-secret-key-change-in-production\n")
    
    print(f"{env_file} created with default development settings")

def run_application():
    """Run the Flask application"""
    print_header("Running the application")
    
    # Determine the Python command based on the OS
    if platform.system() == "Windows":
        python_cmd = os.path.join("venv", "Scripts", "python")
    else:
        python_cmd = os.path.join("venv", "bin", "python")
    
    try:
        print("Starting Flask development server...")
        subprocess.run([python_cmd, "run.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running application: {str(e)}")
    except KeyboardInterrupt:
        print("\nApplication stopped by user")

def main():
    """Main function"""
    print_header("Portfolio Website Setup")
    
    # Check Python version
    check_python_version()
    
    # Create virtual environment
    if not create_virtual_env():
        print("Failed to create virtual environment")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("Failed to install dependencies")
        sys.exit(1)
    
    # Set up environment
    setup_environment()
    
    # Ask user if they want to run the application
    run_app = input("\nDo you want to run the application now? (y/n): ").lower()
    if run_app in ["y", "yes"]:
        run_application()
    else:
        # Show instructions
        if platform.system() == "Windows":
            activate_cmd = "venv\\Scripts\\activate"
            run_cmd = "python run.py"
        else:
            activate_cmd = "source venv/bin/activate"
            run_cmd = "python run.py"
        
        print("\nTo run the application later:")
        print(f"1. Activate the virtual environment: {activate_cmd}")
        print(f"2. Run the application: {run_cmd}")
    
    print("\nSetup completed!")

if __name__ == "__main__":
    main() 