#!/usr/bin/env python
"""
Check build requirements for the Portfolio Website
This script verifies that all requirements for building the static site are met.
"""

import os
import sys
import importlib.util
import traceback

print("\n" + "=" * 80)
print("BUILD REQUIREMENTS CHECK")
print("=" * 80)

# Python environment information
print("\nPython Environment:")
print("  Python version:", sys.version)
print("  Python executable:", sys.executable)
print("  Platform:", sys.platform)
print("  Working directory:", os.getcwd())

# List of required modules
required_modules = [
    "flask",
    "jinja2",
    "dotenv",
    "boto3",
    "botocore"
]

# Check for required modules
print("\nChecking for required modules:")
all_modules_available = True

for module_name in required_modules:
    try:
        spec = importlib.util.find_spec(module_name)
        if spec is None:
            print("  ✗", module_name, "is NOT installed")
            all_modules_available = False
        else:
            try:
                module = importlib.import_module(module_name)
                version = getattr(module, "__version__", "unknown")
                print("  ✓", module_name, "is installed (version:", version, ")")
            except Exception as e:
                print("  ?", module_name, "is installed but couldn't get version:", str(e))
    except ImportError:
        print("  ✗", module_name, "is NOT installed")
        all_modules_available = False

# Check for critical project files
print("\nChecking critical project files:")
critical_files = [
    "build_static_site.py",
    "app/index_standalone.py",
    "requirements-dev.txt",
    "amplify.yml"
]

all_files_exist = True
for file_path in critical_files:
    if os.path.exists(file_path):
        print("  ✓", file_path, "exists")
    else:
        print("  ✗", file_path, "does NOT exist")
        all_files_exist = False

# Check environment variables
print("\nChecking environment variables:")
important_env_vars = [
    "STATIC_DEPLOYMENT",
    "REGION",
    "IMAGE_FAVICON_URL",
    "IMAGE_LOGO_URL",
    "IMAGE_BANNER_URL",
    "IMAGE_ABOUT_PROFILE_URL"
]

for var in important_env_vars:
    value = os.environ.get(var)
    if value:
        # Show only first 30 chars to avoid cluttering output
        display_value = value[:30] + "..." if len(value) > 30 else value
        print("  ✓", var, "is set to:", display_value)
    else:
        print("  ✗", var, "is NOT set")

# Check output directory structure
print("\nChecking output directory structure:")
output_dir = "app/static"
if os.path.exists(output_dir):
    print("  ✓ Output directory", output_dir, "exists")
    # Check if index.html would be created there
    if os.path.exists(os.path.join(output_dir, "index.html")):
        print("  ✓", output_dir + "/index.html exists")
    else:
        print("  ?", output_dir + "/index.html does not exist yet (will be created during build)")
else:
    print("  ✗ Output directory", output_dir, "does NOT exist")
    try:
        os.makedirs(output_dir, exist_ok=True)
        print("    ✓ Created", output_dir, "directory")
    except Exception as e:
        print("    ✗ Failed to create", output_dir + ":", str(e))

# Summary
print("\n" + "=" * 80)
print("BUILD REQUIREMENTS SUMMARY")
print("=" * 80)

if all_modules_available:
    print("✓ All required Python modules are installed")
else:
    print("✗ Some required Python modules are missing")

if all_files_exist:
    print("✓ All critical project files exist")
else:
    print("✗ Some critical project files are missing")

print("\nRecommendations:")
if not all_modules_available:
    print("- Install missing Python modules with: pip install -r requirements-dev.txt")
if not all_files_exist:
    print("- Make sure all critical files are present in the project")

print("\nThis check completed successfully.") 