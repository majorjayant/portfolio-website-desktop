from PIL import Image, ImageDraw, ImageFont
import os

# Ensure the directory exists
os.makedirs("app/static/img", exist_ok=True)

# Colors from our theme
PRIMARY_COLOR = (13, 20, 26)  # #0d141a
ACCENT_COLOR = (122, 107, 95)  # #7a6b5f
BG_LIGHT = (245, 245, 245)  # #f5f5f5
WHITE = (255, 255, 255)

def create_logo():
    """Create a simple logo with 'JPG' text."""
    img = Image.new('RGBA', (200, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a circle
    draw.ellipse((10, 10, 70, 70), outline=ACCENT_COLOR, width=2)
    
    # Draw text
    draw.text((80, 25), "JAYANT", fill=PRIMARY_COLOR)
    
    img.save('app/static/img/logo.png')
    print("Logo created: app/static/img/logo.png")

def create_banner():
    """Create a gradient banner image."""
    width, height = 1920, 480
    img = Image.new('RGB', (width, height), PRIMARY_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Create a subtle pattern
    for i in range(0, width, 40):
        for j in range(0, height, 40):
            draw.rectangle((i, j, i+30, j+30), fill=(20, 30, 40), outline=None)
    
    # Add some circles for design
    draw.ellipse((width-400, 50, width-100, 350), outline=ACCENT_COLOR, width=3)
    draw.ellipse((width-350, 100, width-150, 300), outline=ACCENT_COLOR, width=2)
    
    img.save('app/static/img/banner.jpg', quality=90)
    print("Banner created: app/static/img/banner.jpg")

def create_profile_photo():
    """Create a placeholder profile photo with an avatar silhouette."""
    size = 500
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
    
    # In newer versions, the radius parameter may not be available
    # Using a more compatible approach
    draw.rectangle((body_left, body_top, 
                   body_left + body_width, size), 
                   fill=WHITE)
    
    img.save('app/static/img/profile.jpg', quality=90)
    print("Profile photo created: app/static/img/profile.jpg")

def create_project_thumbnails():
    """Create placeholder thumbnails for projects."""
    categories = ['prd', 'brd', 'srs', 'manual', 'gap', 'roadmap']
    
    for idx, category in enumerate(categories):
        img = Image.new('RGB', (400, 300), PRIMARY_COLOR)
        draw = ImageDraw.Draw(img)
        
        # Add some color variation
        color_shift = idx * 20
        bg_color = (
            min(255, PRIMARY_COLOR[0] + color_shift),
            min(255, PRIMARY_COLOR[1] + color_shift),
            min(255, PRIMARY_COLOR[2] + color_shift)
        )
        
        # Create background
        draw.rectangle((0, 0, 400, 300), fill=bg_color)
        
        # Add category text
        draw.text((150, 140), category.upper(), fill=WHITE)
        
        img.save(f'app/static/img/project_{category}.jpg', quality=80)
        print(f"Project thumbnail created: app/static/img/project_{category}.jpg")

if __name__ == "__main__":
    create_logo()
    create_banner()
    create_profile_photo()
    create_project_thumbnails() 