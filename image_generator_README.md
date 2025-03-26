# Portfolio Image Generator

This tool allows you to easily generate custom images for your portfolio website.

## Features

- Create logos with custom text
- Generate banner images with customizable sizes
- Create placeholder profile photos
- Generate thumbnails for project categories
- Create custom icons (document, chart, lightbulb)
- Generate text banners with your custom message

## Usage

There are two ways to use this image generator:

### 1. Interactive Mode

Run the interactive script for a menu-guided experience:

```
python create_image.py
```

Follow the prompts to select the type of image and customize its parameters.

### 2. Command Line Mode

Use the command-line interface for more direct control:

```
python image_generator.py --type TYPE [options]
```

#### Options:

- `--type`: Type of image to generate (logo, banner, profile, project, icon, text)
- `--text`: Text to display (for logo or text banner)
- `--category`: Category name (for project thumbnail)
- `--icon-type`: Type of icon to create (document, chart, lightbulb)
- `--width`: Width of the image
- `--height`: Height of the image
- `--output`: Output path for the image

### Examples:

Create a logo:
```
python image_generator.py --type logo --text "JAYANT"
```

Create a banner:
```
python image_generator.py --type banner --width 1500 --height 400
```

Create a project thumbnail:
```
python image_generator.py --type project --category "PRD" --width 400 --height 300
```

Create an icon:
```
python image_generator.py --type icon --icon-type document --width 200
```

Create a text banner:
```
python image_generator.py --type text --text "Welcome to my Portfolio" --width 1200 --height 300
```

## Images Directory

All generated images are saved in the `app/static/img/` directory by default, which is where the Flask application expects to find them.

## Requirements

- Python 3.6+
- Pillow library (`pip install pillow`) 