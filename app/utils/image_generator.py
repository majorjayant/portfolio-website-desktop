from PIL import Image, ImageDraw, ImageFont
import os
import textwrap
import io
import math

# Colors from our theme
PRIMARY_COLOR = (13, 20, 26)  # #0d141a
ACCENT_COLOR = (122, 107, 95)  # #7a6b5f
LIGHT_ACCENT = (162, 149, 127)  # #a2957f
BG_LIGHT = (245, 245, 245)  # #f5f5f5
WHITE = (255, 255, 255)
BG_DARK = (40, 40, 40)  # Dark gray

def create_logo(logo_text="JAYANT", description=""):
    """Create a simple logo with text based on description."""
    # Determine color scheme from description
    color_variation = 0  # Default
    if description:
        if "blue" in description.lower() or "cool" in description.lower():
            color_variation = 1  # Blue/Red scheme
        elif "green" in description.lower() or "natural" in description.lower() or "earth" in description.lower():
            color_variation = 2  # Green/Gold scheme
    
    # Select color scheme based on variation
    color_schemes = [
        {"primary": PRIMARY_COLOR, "accent": ACCENT_COLOR, "bg": (0, 0, 0, 0)},  # Default
        {"primary": (41, 82, 133), "accent": (205, 92, 92), "bg": (0, 0, 0, 0)},  # Blue/Red
        {"primary": (53, 94, 59), "accent": (218, 165, 32), "bg": (0, 0, 0, 0)}   # Green/Gold
    ]
    
    colors = color_schemes[color_variation % len(color_schemes)]
    
    # Determine layout style from description
    style_variation = 0  # Default (Circle with text on right)
    if description:
        if "circle" in description.lower() and "text" in description.lower() and "center" in description.lower():
            style_variation = 1  # Text in circle
        elif "square" in description.lower() or "box" in description.lower() or "frame" in description.lower():
            style_variation = 2  # Square framed
        elif "abstract" in description.lower() or "creative" in description.lower() or "unique" in description.lower():
            style_variation = 3  # Abstract styled
    
    # Different layout styles based on variation
    if style_variation == 0:  # Circle with text on right
        img = Image.new('RGBA', (200, 80), colors["bg"])
        draw = ImageDraw.Draw(img)
        # Draw circle element
        draw.ellipse((10, 10, 70, 70), outline=colors["accent"], width=2)
        # Draw text
        draw.text((80, 25), logo_text, fill=colors["primary"])
        
    elif style_variation == 1:  # Text in circle
        img = Image.new('RGBA', (200, 200), colors["bg"])
        draw = ImageDraw.Draw(img)
        # Draw larger circle
        draw.ellipse((20, 20, 180, 180), outline=colors["accent"], width=3)
        # Draw inner circle
        draw.ellipse((40, 40, 160, 160), outline=colors["accent"], width=1)
        # Draw text in center
        text_width = len(logo_text) * 8  # Approximate text width
        text_x = (200 - text_width) // 2
        draw.text((text_x, 90), logo_text, fill=colors["primary"])
        
    elif style_variation == 2:  # Square framed
        img = Image.new('RGBA', (220, 100), colors["bg"])
        draw = ImageDraw.Draw(img)
        # Draw square frame
        draw.rectangle((20, 10, 200, 90), outline=colors["accent"], width=2)
        # Draw text
        draw.text((50, 40), logo_text, fill=colors["primary"])
        
    else:  # Abstract styled
        img = Image.new('RGBA', (240, 120), colors["bg"])
        draw = ImageDraw.Draw(img)
        # Draw diagonal line
        draw.line((0, 0, 240, 120), fill=colors["accent"], width=3)
        # Draw counter diagonal
        draw.line((0, 120, 240, 0), fill=colors["accent"], width=3)
        # Draw text box
        draw.rectangle((60, 40, 180, 80), fill=colors["bg"], outline=colors["accent"])
        # Draw text
        draw.text((70, 50), logo_text, fill=colors["primary"])
    
    # Apply special elements based on description
    if description:
        if "minimalist" in description.lower():
            # For minimalist, remove some elements for cleaner look
            img = Image.new('RGBA', img.size, colors["bg"])
            draw = ImageDraw.Draw(img)
            draw.text((img.width//4, img.height//3), logo_text, fill=colors["primary"])
            
        if "tech" in description.lower():
            # Add tech-like elements
            draw = ImageDraw.Draw(img)
            for i in range(3):
                size = 5 + i*3
                pos_x = img.width - 30 - i*10
                pos_y = 20 + i*10
                draw.rectangle((pos_x, pos_y, pos_x+size, pos_y+size), 
                              fill=colors["accent"])
                
        if "elegant" in description.lower():
            # Add swirl or curved lines for elegance
            draw = ImageDraw.Draw(img)
            for i in range(0, 180, 20):
                r = 30
                x1 = img.width - 40 + int(r * math.cos(math.radians(i)))
                y1 = 40 + int(r * math.sin(math.radians(i)))
                x2 = img.width - 40 + int(r * math.cos(math.radians(i+10)))
                y2 = 40 + int(r * math.sin(math.radians(i+10)))
                draw.line((x1, y1, x2, y2), fill=colors["accent"], width=2)
    
    return img

def create_banner(width=1920, height=480, pattern=True, description=""):
    """Create a gradient banner image based on description."""
    # Choose banner color based on description
    bg_color = PRIMARY_COLOR  # Default
    
    if description:
        if "blue" in description.lower():
            bg_color = (20, 40, 80)  # Dark blue
        elif "green" in description.lower():
            bg_color = (20, 60, 40)  # Dark green
        elif "red" in description.lower():
            bg_color = (80, 20, 30)  # Dark red
        elif "dark" in description.lower():
            bg_color = (10, 10, 15)  # Very dark
        elif "light" in description.lower():
            bg_color = (240, 240, 245)  # Light color
    
    # Create banner with background color
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    accent_color = ACCENT_COLOR
    if "contrast" in description.lower():
        # Create high contrast accent
        r, g, b = bg_color
        accent_color = (255-r, 255-g, 255-b)
    
    # Add pattern if requested
    if pattern:
        # Different pattern styles based on description
        if "gradient" in description.lower():
            # Create a gradient
            for i in range(width):
                # Horizontal gradient
                color_val = i * 30 // width
                line_color = (bg_color[0] + color_val, bg_color[1] + color_val, bg_color[2] + color_val)
                draw.line([(i, 0), (i, height)], fill=line_color)
                
        elif "diagonal" in description.lower():
            # Diagonal lines
            for i in range(0, width+height, 40):
                draw.line([(0, i), (i, 0)], fill=accent_color, width=1)
                
        elif "minimalist" in description.lower():
            # Just a single line
            draw.line([(0, height//2), (width, height//2)], fill=accent_color, width=2)
            
        else:
            # Default pattern - grid
            for i in range(0, width, 40):
                for j in range(0, height, 40):
                    draw.rectangle((i, j, i+30, j+30), 
                                  fill=(bg_color[0]+10, bg_color[1]+10, bg_color[2]+10), 
                                  outline=None)
    
    # Add circles for design, unless minimalist is specified
    if "minimalist" not in description.lower():
        draw.ellipse((width-400, 50, width-100, 350), outline=accent_color, width=3)
        draw.ellipse((width-350, 100, width-150, 300), outline=accent_color, width=2)
    
    # Add text if specified in description
    if "text" in description.lower() and "center" in description.lower():
        # Extract potential text from description
        text_start = description.find("text") + 4
        text_content = description[text_start:].strip()
        if text_content:
            # Take the first few words after "text"
            words = text_content.split()
            display_text = " ".join(words[:3])  # First 3 words
            text_width = len(display_text) * 15
            text_x = width // 2 - text_width // 2
            text_y = height // 2 - 15
            draw.text((text_x, text_y), display_text.upper(), fill=accent_color)
    
    return img

def create_profile_photo(size=500, description=""):
    """Create a placeholder profile photo with an avatar silhouette, customized by description."""
    # Choose background color based on description
    bg_color = BG_LIGHT  # Default
    
    if description:
        if "blue" in description.lower():
            bg_color = (200, 220, 240)  # Light blue
        elif "green" in description.lower():
            bg_color = (220, 240, 220)  # Light green
        elif "dark" in description.lower():
            bg_color = (40, 40, 40)  # Dark gray
        elif "black" in description.lower():
            bg_color = (10, 10, 10)  # Black
    
    # Create the profile photo
    img = Image.new('RGB', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Choose avatar style based on description
    avatar_style = "circle"  # Default
    if description:
        if "square" in description.lower():
            avatar_style = "square"
        elif "abstract" in description.lower() or "modern" in description.lower():
            avatar_style = "abstract"
    
    # Choose avatar color
    avatar_color = ACCENT_COLOR
    if "professional" in description.lower():
        avatar_color = (80, 100, 120)  # Blue-gray professional
    elif "creative" in description.lower():
        avatar_color = (180, 80, 100)  # Creative pink/purple
    
    # Draw avatar based on style
    if avatar_style == "circle":
        # Draw circle background
        draw.ellipse((0, 0, size, size), fill=avatar_color)
        
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
        
        draw.rectangle((body_left, body_top, 
                      body_left + body_width, size), 
                      fill=WHITE)
    
    elif avatar_style == "square":
        # Draw square avatar
        padding = int(size * 0.1)
        draw.rectangle((padding, padding, size - padding, size - padding), fill=avatar_color)
        
        # Abstract face
        eye_size = int(size * 0.05)
        left_eye_pos = (int(size * 0.3), int(size * 0.3))
        right_eye_pos = (int(size * 0.7), int(size * 0.3))
        
        draw.rectangle((left_eye_pos[0], left_eye_pos[1], 
                      left_eye_pos[0] + eye_size, left_eye_pos[1] + eye_size), 
                      fill=WHITE)
        draw.rectangle((right_eye_pos[0], right_eye_pos[1], 
                      right_eye_pos[0] + eye_size, right_eye_pos[1] + eye_size), 
                      fill=WHITE)
        
        # Simple mouth
        mouth_width = int(size * 0.3)
        mouth_left = int(size/2 - mouth_width/2)
        mouth_top = int(size * 0.6)
        
        draw.rectangle((mouth_left, mouth_top, 
                      mouth_left + mouth_width, mouth_top + eye_size), 
                      fill=WHITE)
    
    else:  # abstract
        # Create an abstract representation
        draw.ellipse((0, 0, size, size), fill=avatar_color)
        
        # Abstract shapes
        for i in range(3):
            shape_size = int(size * (0.2 + i * 0.1))
            x = int(size * (0.3 + i * 0.2))
            y = int(size * (0.3 + i * 0.1))
            
            if i % 2 == 0:
                draw.ellipse((x, y, x + shape_size, y + shape_size), 
                           fill=(255, 255, 255, 150))
            else:
                draw.rectangle((x, y, x + shape_size, y + shape_size), 
                             fill=(255, 255, 255, 150))
    
    return img

def create_project_thumbnail(category, width=400, height=300, description=""):
    """Create a placeholder thumbnail for a project category based on description."""
    # Choose background color based on description and category
    bg_color = PRIMARY_COLOR  # Default
    
    # Category-based default colors
    if category.lower() == "prd":
        bg_color = (20, 60, 100)  # Blue for Product Requirements
    elif category.lower() == "brd":
        bg_color = (60, 30, 90)  # Purple for Business Requirements
    elif category.lower() == "srs":
        bg_color = (30, 80, 60)  # Green for Software Requirements
    elif category.lower() == "manual":
        bg_color = (90, 50, 30)  # Brown for User Manual
    elif category.lower() == "research":
        bg_color = (80, 40, 70)  # Purple-red for Research
    
    # Override with description-based colors
    if description:
        if "blue" in description.lower():
            bg_color = (30, 60, 120)
        elif "green" in description.lower():
            bg_color = (30, 100, 60)
        elif "red" in description.lower():
            bg_color = (150, 30, 40)
        elif "dark" in description.lower():
            # Darken the color
            bg_color = (bg_color[0]//2, bg_color[1]//2, bg_color[2]//2)
    
    # Create background
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Pattern based on description
    if "pattern" in description.lower() or "grid" in description.lower():
        # Grid pattern
        for x in range(0, width, 20):
            for y in range(0, height, 20):
                draw.rectangle((x, y, x+10, y+10), 
                              fill=(bg_color[0]+20, bg_color[1]+20, bg_color[2]+20))
    
    elif "lines" in description.lower():
        # Line pattern
        for y in range(0, height, 10):
            draw.line([(0, y), (width, y)], 
                     fill=(bg_color[0]+30, bg_color[1]+30, bg_color[2]+30), 
                     width=1)
    
    # Add category text with shadow effect for better visibility
    text_x = width//2 - 40
    text_y = height//2 - 10
    
    # Shadow
    draw.text((text_x+2, text_y+2), category.upper(), fill=(0, 0, 0, 128))
    # Main text
    draw.text((text_x, text_y), category.upper(), fill=WHITE)
    
    # Add decorative elements based on category
    if "code" in description.lower() or "tech" in description.lower():
        # Add code-like elements
        for i in range(5):
            line_y = height//4 + i * 15
            line_width = 100 + (i % 3) * 30
            draw.line([(width//10, line_y), (width//10 + line_width, line_y)], 
                     fill=(255, 255, 255, 150), width=2)
    
    elif "chart" in description.lower() or "analytics" in description.lower():
        # Add chart-like element
        chart_left = width//6
        chart_bottom = height - height//6
        chart_width = width - 2*(width//6)
        chart_height = height - 2*(height//6)
        
        # Chart outline
        draw.rectangle((chart_left, chart_bottom-chart_height, 
                       chart_left+chart_width, chart_bottom), 
                       outline=WHITE, width=1)
        
        # Chart bars or lines
        bar_width = chart_width // 5
        for i in range(5):
            bar_height = (i+1) * chart_height // 6
            if "bar" in description.lower():
                # Bar chart
                draw.rectangle((chart_left + i*bar_width, chart_bottom-bar_height, 
                               chart_left + (i+1)*bar_width - 2, chart_bottom), 
                               fill=(255, 255, 255, 180))
            else:
                # Line chart
                if i > 0:
                    prev_x = chart_left + (i-1)*(chart_width//4)
                    prev_y = chart_bottom - (i)*(chart_height//6)
                    current_x = chart_left + i*(chart_width//4)
                    current_y = chart_bottom - (i+1)*(chart_height//6)
                    draw.line([(prev_x, prev_y), (current_x, current_y)], 
                             fill=WHITE, width=2)
    
    return img

def create_icon(icon_type, size=200, description=""):
    """Create an icon image with a specific type, customized by description."""
    # Choose background color based on description
    bg_color = ACCENT_COLOR  # Default
    
    if description:
        if "blue" in description.lower():
            bg_color = (41, 128, 185)  # Blue
        elif "green" in description.lower():
            bg_color = (39, 174, 96)  # Green
        elif "red" in description.lower():
            bg_color = (192, 57, 43)  # Red
        elif "yellow" in description.lower() or "gold" in description.lower():
            bg_color = (241, 196, 15)  # Yellow
        elif "purple" in description.lower():
            bg_color = (142, 68, 173)  # Purple
        elif "gray" in description.lower() or "grey" in description.lower():
            bg_color = (127, 140, 141)  # Gray
    
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Choose icon style based on description
    icon_style = "filled"  # Default
    if "outline" in description.lower() or "stroke" in description.lower():
        icon_style = "outline"
    elif "gradient" in description.lower():
        icon_style = "gradient"
    
    # Draw the base circle or background
    if icon_style == "outline":
        # Only draw outline
        draw.ellipse((0, 0, size, size), outline=bg_color, width=3)
    elif icon_style == "gradient":
        # Create a simple radial gradient
        for i in range(size//2, 0, -1):
            alpha = 255 - (i * 200 // (size//2))
            draw.ellipse((size//2-i, size//2-i, size//2+i, size//2+i), 
                        fill=(bg_color[0], bg_color[1], bg_color[2], alpha))
    else:
        # Filled circle
        draw.ellipse((0, 0, size, size), fill=bg_color)
    
    # Draw different icon types
    padding = size // 5
    
    if icon_type.lower() == "document":
        # Draw document icon
        if icon_style == "outline":
            draw.rectangle((padding, padding, size-padding, size-padding), 
                          outline=WHITE, width=2)
            # Draw lines on the document
            line_gap = (size - 2*padding) // 4
            for i in range(3):
                y = padding + (i+1) * line_gap
                draw.line((padding+10, y, size-padding-10, y), fill=WHITE, width=2)
        else:
            draw.rectangle((padding, padding, size-padding, size-padding), fill=WHITE)
            # Draw lines on the document
            line_gap = (size - 2*padding) // 4
            for i in range(3):
                y = padding + (i+1) * line_gap
                line_color = bg_color if icon_style == "filled" else (100, 100, 100)
                draw.line((padding+10, y, size-padding-10, y), fill=line_color, width=2)
    
    elif icon_type.lower() == "chart":
        # Draw chart icon
        if icon_style == "outline":
            # Draw x and y axes
            draw.line((padding, size-padding, size-padding, size-padding), fill=WHITE, width=2)  # x-axis
            draw.line((padding, padding, padding, size-padding), fill=WHITE, width=2)  # y-axis
            
            # Draw bars
            bar_width = (size - 2*padding) // 4
            for i in range(4):
                bar_height = (i+1) * (size//6)
                x = padding + i * bar_width
                y = size-padding-bar_height
                draw.rectangle((x, y, x+bar_width-5, size-padding), outline=WHITE, width=1)
        else:
            # Draw bars
            bar_width = (size - 2*padding) // 4
            for i in range(4):
                bar_height = (i+1) * (size//6)
                x = padding + i * bar_width
                y = size-padding-bar_height
                draw.rectangle((x, y, x+bar_width-5, size-padding), fill=WHITE)
    
    elif icon_type.lower() == "lightbulb":
        # Draw lightbulb icon
        center_x, center_y = size//2, size//2
        radius = size//3
        
        if icon_style == "outline":
            # Bulb outline
            draw.ellipse((center_x-radius, center_y-radius, center_x+radius, center_y+radius), 
                        outline=WHITE, width=2)
            # Base
            base_width = radius * 0.8
            draw.rectangle((center_x-base_width//2, center_y+radius-10, 
                           center_x+base_width//2, center_y+radius+20), 
                          outline=WHITE, width=2)
            
            # Add "light rays"
            ray_length = radius // 2
            for angle in range(0, 360, 45):
                rad = math.radians(angle)
                x1 = center_x + int((radius + 5) * math.cos(rad))
                y1 = center_y + int((radius + 5) * math.sin(rad))
                x2 = center_x + int((radius + ray_length) * math.cos(rad))
                y2 = center_y + int((radius + ray_length) * math.sin(rad))
                draw.line((x1, y1, x2, y2), fill=WHITE, width=1)
                
        else:
            # Bulb
            draw.ellipse((center_x-radius, center_y-radius, center_x+radius, center_y+radius), 
                        fill=WHITE)
            # Base
            base_width = radius * 0.8
            draw.rectangle((center_x-base_width//2, center_y+radius-10, 
                           center_x+base_width//2, center_y+radius+20), 
                          fill=WHITE)
    
    else:
        # Default icon - just a circle
        smaller_radius = size//3
        if icon_style == "outline":
            draw.ellipse((size//2-smaller_radius, size//2-smaller_radius, 
                         size//2+smaller_radius, size//2+smaller_radius), 
                        outline=WHITE, width=2)
        else:
            draw.ellipse((size//2-smaller_radius, size//2-smaller_radius, 
                         size//2+smaller_radius, size//2+smaller_radius), 
                        fill=WHITE)
    
    return img

def create_text_banner(text, width=1200, height=300, description=""):
    """Create a banner with custom text, customized by description."""
    # Choose background color based on description
    bg_color = PRIMARY_COLOR  # Default
    
    if description:
        if "blue" in description.lower():
            bg_color = (20, 40, 80)  # Dark blue
        elif "green" in description.lower():
            bg_color = (20, 60, 40)  # Dark green
        elif "red" in description.lower():
            bg_color = (80, 20, 30)  # Dark red
        elif "dark" in description.lower():
            bg_color = (10, 10, 15)  # Very dark
        elif "light" in description.lower():
            bg_color = (240, 240, 245)  # Light color
    
    # Create image with background
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Choose pattern based on description
    pattern_type = "grid"  # Default
    
    if description:
        if "gradient" in description.lower():
            pattern_type = "gradient"
        elif "diagonal" in description.lower():
            pattern_type = "diagonal"
        elif "minimalist" in description.lower() or "clean" in description.lower():
            pattern_type = "minimalist"
        elif "dots" in description.lower():
            pattern_type = "dots"
    
    # Create background pattern
    if pattern_type == "grid":
        for i in range(0, width, 40):
            for j in range(0, height, 40):
                color_adjust = (i + j) % 30
                draw.rectangle((i, j, i+30, j+30), 
                              fill=(bg_color[0]+color_adjust, 
                                    bg_color[1]+color_adjust, 
                                    bg_color[2]+color_adjust), 
                              outline=None)
    
    elif pattern_type == "gradient":
        for i in range(width):
            color_val = i * 40 // width
            line_color = (min(bg_color[0] + color_val, 255), 
                         min(bg_color[1] + color_val, 255), 
                         min(bg_color[2] + color_val, 255))
            draw.line([(i, 0), (i, height)], fill=line_color)
    
    elif pattern_type == "diagonal":
        for i in range(-height, width, 40):
            draw.line([(i, 0), (i + height, height)], 
                     fill=(bg_color[0]+20, bg_color[1]+20, bg_color[2]+20), 
                     width=20)
    
    elif pattern_type == "dots":
        for i in range(0, width, 30):
            for j in range(0, height, 30):
                draw.ellipse((i, j, i+5, j+5), 
                            fill=(bg_color[0]+40, bg_color[1]+40, bg_color[2]+40))
    
    # Choose text color based on background and description
    text_color = WHITE  # Default
    
    r, g, b = bg_color
    brightness = (r * 299 + g * 587 + b * 114) / 1000
    
    if brightness > 127:
        text_color = (30, 30, 30)  # Dark text for light backgrounds
    
    if description:
        if "white text" in description.lower():
            text_color = WHITE
        elif "black text" in description.lower():
            text_color = (0, 0, 0)
        elif "colored text" in description.lower():
            # Choose a contrasting color
            text_color = (255-bg_color[0], 255-bg_color[1], 255-bg_color[2])
    
    # Choose text style based on description
    text_style = "centered"  # Default
    
    if description:
        if "left" in description.lower():
            text_style = "left"
        elif "right" in description.lower():
            text_style = "right"
        elif "shadow" in description.lower():
            text_style = "shadow"
        elif "outline" in description.lower():
            text_style = "outline"
    
    # Draw text based on style
    wrapped_text = textwrap.fill(text, width=30)
    
    if text_style == "centered":
        draw.text((width//2 - 150, height//2 - 20), wrapped_text, fill=text_color)
    
    elif text_style == "left":
        draw.text((width//10, height//2 - 20), wrapped_text, fill=text_color)
    
    elif text_style == "right":
        draw.text((width - width//4, height//2 - 20), wrapped_text, fill=text_color)
    
    elif text_style == "shadow":
        # Draw shadow
        draw.text((width//2 - 148, height//2 - 18), wrapped_text, fill=(0, 0, 0))
        # Draw main text
        draw.text((width//2 - 150, height//2 - 20), wrapped_text, fill=text_color)
    
    elif text_style == "outline":
        # Draw outline by drawing text multiple times with offsets
        for off_x, off_y in [(-1,-1), (-1,1), (1,-1), (1,1)]:
            draw.text((width//2 - 150 + off_x, height//2 - 20 + off_y), 
                     wrapped_text, fill=(0, 0, 0))
        # Draw main text
        draw.text((width//2 - 150, height//2 - 20), wrapped_text, fill=text_color)
    
    return img

def get_content_type(img_format):
    """Get MIME type based on image format"""
    format_map = {
        'PNG': 'image/png',
        'JPEG': 'image/jpeg',
        'JPG': 'image/jpeg',
        'GIF': 'image/gif',
        'WEBP': 'image/webp'
    }
    return format_map.get(img_format.upper(), 'image/jpeg')

def generate_image(image_type, **kwargs):
    """Generate an image based on the given type and parameters"""
    # Get common parameters
    description = kwargs.get('description', '')
    
    if image_type == 'logo':
        logo_text = kwargs.get('logo_text', 'LOGO')
        img = create_logo(logo_text=logo_text, description=description)
        img_format = 'PNG'  # Use PNG for logos to preserve transparency
    
    elif image_type == 'banner':
        width = int(kwargs.get('width', 1920))
        height = int(kwargs.get('height', 480))
        pattern = True
        img = create_banner(width=width, height=height, pattern=pattern, description=description)
        img_format = 'JPEG'
    
    elif image_type == 'profile':
        size = int(kwargs.get('size', 500))
        img = create_profile_photo(size=size, description=description)
        img_format = 'JPEG'
    
    elif image_type == 'project':
        category = kwargs.get('category', 'PRD')
        width = int(kwargs.get('width', 400))
        height = int(kwargs.get('height', 300))
        img = create_project_thumbnail(category=category, width=width, height=height, description=description)
        img_format = 'JPEG'
    
    elif image_type == 'icon':
        icon_type = kwargs.get('icon_type', 'document')
        size = int(kwargs.get('size', 200))
        img = create_icon(icon_type=icon_type, size=size, description=description)
        img_format = 'PNG'  # Use PNG for icons to preserve transparency
    
    elif image_type == 'text':
        text = kwargs.get('text', 'Sample Text')
        width = int(kwargs.get('width', 1200))
        height = int(kwargs.get('height', 300))
        img = create_text_banner(text=text, width=width, height=height, description=description)
        img_format = 'JPEG'
    
    else:
        # Default to a blank image if type not recognized
        img = Image.new('RGB', (400, 300), BG_DARK)
        draw = ImageDraw.Draw(img)
        draw.text((150, 140), "Unknown Type", fill=WHITE)
        img_format = 'JPEG'
    
    # Convert RGBA images to RGB when using JPEG format
    if img_format == 'JPEG' and img.mode == 'RGBA':
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
        img = background
    
    # Get the content type
    content_type = get_content_type(img_format)
    
    return img, content_type, img_format 