from PIL import Image, ImageDraw, ImageFont
import os
import argparse
import textwrap

# Ensure the directory exists
os.makedirs("app/static/img", exist_ok=True)

# Colors from our theme
PRIMARY_COLOR = (13, 20, 26)  # #0d141a
ACCENT_COLOR = (122, 107, 95)  # #7a6b5f
LIGHT_ACCENT = (162, 149, 127)  # #a2957f
BG_LIGHT = (245, 245, 245)  # #f5f5f5
WHITE = (255, 255, 255)

def create_logo(text="JAYANT", output_path="app/static/img/logo.png"):
    """Create a simple logo with text."""
    img = Image.new('RGBA', (200, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a circle
    draw.ellipse((10, 10, 70, 70), outline=ACCENT_COLOR, width=2)
    
    # Draw text
    draw.text((80, 25), text, fill=PRIMARY_COLOR)
    
    img.save(output_path)
    print(f"Logo created: {output_path}")
    return output_path

def create_banner(width=1920, height=480, pattern=True, output_path="app/static/img/banner.jpg"):
    """Create a gradient banner image."""
    img = Image.new('RGB', (width, height), PRIMARY_COLOR)
    draw = ImageDraw.Draw(img)
    
    if pattern:
        # Create a subtle pattern
        for i in range(0, width, 40):
            for j in range(0, height, 40):
                draw.rectangle((i, j, i+30, j+30), fill=(20, 30, 40), outline=None)
    
    # Add some circles for design
    draw.ellipse((width-400, 50, width-100, 350), outline=ACCENT_COLOR, width=3)
    draw.ellipse((width-350, 100, width-150, 300), outline=ACCENT_COLOR, width=2)
    
    img.save(output_path, quality=90)
    print(f"Banner created: {output_path}")
    return output_path

def create_profile_photo(size=500, output_path="app/static/img/profile.jpg"):
    """Create a placeholder profile photo with an avatar silhouette."""
    img = Image.new('RGB', (size, size), BG_LIGHT)
    draw = ImageDraw.Draw(img)
    
    # Draw circle background
    draw.ellipse((0, 0, size, size), fill=ACCENT_COLOR)
    
    # Draw a simple avatar silhouette
    # Head
    head_size = int(size * 0.4)
    head_pos = (int(size/2 - head_size/2), int(size * 0.2))
    draw.ellipse((head_pos[0], head_pos[1], 
                 head_pos[0] + head_size, head_pos[1] + head_size), 
                 fill=WHITE)
    
    # Body
    body_top = head_pos[1] + head_size - 20
    body_width = int(size * 0.5)
    body_left = int(size/2 - body_width/2)
    
    # Using a compatible approach
    draw.rectangle((body_left, body_top, 
                   body_left + body_width, size), 
                   fill=WHITE)
    
    img.save(output_path, quality=90)
    print(f"Profile photo created: {output_path}")
    return output_path

def create_project_thumbnail(category, width=400, height=300, output_path=None):
    """Create a placeholder thumbnail for a project category."""
    if output_path is None:
        output_path = f"app/static/img/project_{category.lower()}.jpg"
    
    img = Image.new('RGB', (width, height), PRIMARY_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Create background
    draw.rectangle((0, 0, width, height), fill=PRIMARY_COLOR)
    
    # Add category text
    draw.text((width//2 - 40, height//2 - 10), category.upper(), fill=WHITE)
    
    img.save(output_path, quality=80)
    print(f"Project thumbnail created: {output_path}")
    return output_path

def create_icon(icon_type, size=200, output_path=None):
    """Create an icon image with a specific type."""
    if output_path is None:
        output_path = f"app/static/img/icon_{icon_type.lower()}.png"
    
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw the background circle
    draw.ellipse((0, 0, size, size), fill=ACCENT_COLOR)
    
    # Draw different icon types
    if icon_type.lower() == "document":
        # Draw document icon
        padding = size // 5
        draw.rectangle((padding, padding, size-padding, size-padding), fill=WHITE)
        # Draw lines on the document
        line_gap = (size - 2*padding) // 4
        for i in range(3):
            y = padding + (i+1) * line_gap
            draw.line((padding+10, y, size-padding-10, y), fill=ACCENT_COLOR, width=2)
    
    elif icon_type.lower() == "chart":
        # Draw chart icon
        padding = size // 5
        # Draw bars
        bar_width = (size - 2*padding) // 4
        for i in range(4):
            bar_height = (i+1) * (size//6)
            x = padding + i * bar_width
            draw.rectangle((x, size-padding-bar_height, x+bar_width-5, size-padding), fill=WHITE)
    
    elif icon_type.lower() == "lightbulb":
        # Draw lightbulb icon
        center_x, center_y = size//2, size//2
        radius = size//3
        # Bulb
        draw.ellipse((center_x-radius, center_y-radius, center_x+radius, center_y+radius), fill=WHITE)
        # Base
        base_width = radius * 0.8
        draw.rectangle((center_x-base_width//2, center_y+radius-10, center_x+base_width//2, center_y+radius+20), fill=WHITE)
    
    else:
        # Default icon - just a circle
        smaller_radius = size//3
        draw.ellipse((size//2-smaller_radius, size//2-smaller_radius, 
                     size//2+smaller_radius, size//2+smaller_radius), fill=WHITE)
    
    img.save(output_path)
    print(f"Icon created: {output_path}")
    return output_path

def create_text_banner(text, width=1200, height=300, output_path=None):
    """Create a banner with custom text."""
    if output_path is None:
        # Create a safe filename from text
        safe_text = "".join(c if c.isalnum() else "_" for c in text[:20])
        output_path = f"app/static/img/text_banner_{safe_text}.jpg"
    
    img = Image.new('RGB', (width, height), PRIMARY_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Create a background pattern
    for i in range(0, width, 40):
        for j in range(0, height, 40):
            draw.rectangle((i, j, i+30, j+30), fill=(20, 30, 40), outline=None)
    
    # Draw text
    # Wrap text to fit width
    wrapped_text = textwrap.fill(text, width=30)
    draw.text((width//2 - 150, height//2 - 20), wrapped_text, fill=WHITE)
    
    img.save(output_path, quality=90)
    print(f"Text banner created: {output_path}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description='Generate images for portfolio website')
    parser.add_argument('--type', choices=['logo', 'banner', 'profile', 'project', 'icon', 'text'], 
                        required=True, help='Type of image to generate')
    parser.add_argument('--text', help='Text to display (for logo or text banner)')
    parser.add_argument('--category', help='Category name (for project thumbnail)')
    parser.add_argument('--icon-type', choices=['document', 'chart', 'lightbulb'], 
                        help='Type of icon to create')
    parser.add_argument('--width', type=int, help='Width of the image')
    parser.add_argument('--height', type=int, help='Height of the image')
    parser.add_argument('--output', help='Output path for the image')
    
    args = parser.parse_args()
    
    if args.type == 'logo':
        text = args.text or "JAYANT"
        create_logo(text=text, output_path=args.output)
    
    elif args.type == 'banner':
        width = args.width or 1920
        height = args.height or 480
        create_banner(width=width, height=height, output_path=args.output)
    
    elif args.type == 'profile':
        size = args.width or 500
        create_profile_photo(size=size, output_path=args.output)
    
    elif args.type == 'project':
        if not args.category:
            print("Error: --category is required for project thumbnails")
            return
        width = args.width or 400
        height = args.height or 300
        create_project_thumbnail(args.category, width=width, height=height, output_path=args.output)
    
    elif args.type == 'icon':
        icon_type = args.icon_type or "default"
        size = args.width or 200
        create_icon(icon_type, size=size, output_path=args.output)
    
    elif args.type == 'text':
        if not args.text:
            print("Error: --text is required for text banners")
            return
        width = args.width or 1200
        height = args.height or 300
        create_text_banner(args.text, width=width, height=height, output_path=args.output)

if __name__ == "__main__":
    main() 