#!/usr/bin/env python
"""
Database Export Script

This script exports site configuration data from the database to a JSON file
for use in static site generation. Run this script before pushing to Netlify
to ensure the latest content is available.
"""

import os
import sys
from app.utils.db_exporter import export_site_configs

def main():
    """Export site configuration data from the database"""
    print("\n" + "=" * 80)
    print("SITE CONFIGURATION EXPORT")
    print("=" * 80)
    
    # Export site config data
    try:
        output_file = export_site_configs()
        if output_file:
            print(f"\nSite configuration data exported to {output_file}")
            print("\nYou can now commit this file to your repository for use in Netlify.")
        else:
            print("\nFailed to export site configuration data.")
            sys.exit(1)
    except Exception as e:
        print(f"\nError exporting site configuration data: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 