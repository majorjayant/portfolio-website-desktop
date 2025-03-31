// Default site configuration
const defaultConfig = {
    site_name: 'Portfolio Website',
    site_description: 'Welcome to my portfolio',
    image_favicon_url: '/img/favicon.ico',
    image_logo_url: '/img/logo.png',
    image_banner_url: '/img/banner.jpg',
    about_title: 'About Me',
    about_subtitle: 'Get to know me better',
    about_description: 'I am a passionate developer with expertise in web development and design. My goal is to create beautiful, functional, and user-friendly websites and applications.',
    about_photo1_url: '/img/about1.jpg',
    about_photo2_url: '/img/about2.jpg',
    about_photo3_url: '/img/about3.jpg',
    about_photo4_url: '/img/about4.jpg',
    about_photo1_alt: 'About Photo 1',
    about_photo2_alt: 'About Photo 2',
    about_photo3_alt: 'About Photo 3',
    about_photo4_alt: 'About Photo 4'
};

// Send the configuration as JSON
const responseBody = JSON.stringify(defaultConfig);

// Set the content type to JSON
document.contentType = 'application/json';

// Output the JSON
document.write(responseBody); 