import image_generator

def print_menu():
    """Display the main menu for image generator."""
    print("\n===== Portfolio Image Generator =====")
    print("1. Create Logo")
    print("2. Create Banner")
    print("3. Create Profile Photo")
    print("4. Create Project Thumbnail")
    print("5. Create Icon")
    print("6. Create Text Banner")
    print("0. Exit")
    print("=====================================")

def get_integer_input(prompt, default=None):
    """Get integer input with optional default value."""
    try:
        value = input(f"{prompt}{f' [default: {default}]' if default else ''}: ")
        if not value and default is not None:
            return default
        return int(value)
    except ValueError:
        print("Please enter a valid number.")
        return get_integer_input(prompt, default)

def create_logo():
    """Create a logo with user input."""
    text = input("Enter text for logo [default: JAYANT]: ") or "JAYANT"
    output = input("Enter output path [default: app/static/img/logo.png]: ") or "app/static/img/logo.png"
    
    image_generator.create_logo(text=text, output_path=output)

def create_banner():
    """Create a banner with user input."""
    width = get_integer_input("Enter width", 1920)
    height = get_integer_input("Enter height", 480)
    pattern = input("Add pattern? (y/n) [default: y]: ").lower() != 'n'
    output = input("Enter output path [default: app/static/img/banner.jpg]: ") or "app/static/img/banner.jpg"
    
    image_generator.create_banner(width=width, height=height, pattern=pattern, output_path=output)

def create_profile_photo():
    """Create a profile photo with user input."""
    size = get_integer_input("Enter size", 500)
    output = input("Enter output path [default: app/static/img/profile.jpg]: ") or "app/static/img/profile.jpg"
    
    image_generator.create_profile_photo(size=size, output_path=output)

def create_project_thumbnail():
    """Create a project thumbnail with user input."""
    category = input("Enter project category (e.g., prd, brd, srs): ")
    if not category:
        print("Category is required.")
        return
        
    width = get_integer_input("Enter width", 400)
    height = get_integer_input("Enter height", 300)
    output = input(f"Enter output path [default: app/static/img/project_{category}.jpg]: ") or f"app/static/img/project_{category}.jpg"
    
    image_generator.create_project_thumbnail(category, width=width, height=height, output_path=output)

def create_icon():
    """Create an icon with user input."""
    print("\nIcon Types:")
    print("1. Document")
    print("2. Chart")
    print("3. Lightbulb")
    print("4. Default (simple circle)")
    
    icon_type_choice = get_integer_input("Choose icon type", 4)
    icon_types = {1: "document", 2: "chart", 3: "lightbulb", 4: "default"}
    icon_type = icon_types.get(icon_type_choice, "default")
    
    size = get_integer_input("Enter size", 200)
    output = input(f"Enter output path [default: app/static/img/icon_{icon_type}.png]: ") or f"app/static/img/icon_{icon_type}.png"
    
    image_generator.create_icon(icon_type, size=size, output_path=output)

def create_text_banner():
    """Create a text banner with user input."""
    text = input("Enter text for banner: ")
    if not text:
        print("Text is required for a text banner.")
        return
        
    width = get_integer_input("Enter width", 1200)
    height = get_integer_input("Enter height", 300)
    
    # Create a safe filename from text
    safe_text = "".join(c if c.isalnum() else "_" for c in text[:20])
    default_output = f"app/static/img/text_banner_{safe_text}.jpg"
    
    output = input(f"Enter output path [default: {default_output}]: ") or default_output
    
    image_generator.create_text_banner(text, width=width, height=height, output_path=output)

def main():
    """Main function for interactive image generation."""
    while True:
        print_menu()
        choice = input("Enter your choice (0-6): ")
        
        if choice == '0':
            print("Exiting Image Generator. Goodbye!")
            break
        elif choice == '1':
            create_logo()
        elif choice == '2':
            create_banner()
        elif choice == '3':
            create_profile_photo()
        elif choice == '4':
            create_project_thumbnail()
        elif choice == '5':
            create_icon()
        elif choice == '6':
            create_text_banner()
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 