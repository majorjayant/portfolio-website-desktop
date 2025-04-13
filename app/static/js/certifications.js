// Certification Cards Component
document.addEventListener('DOMContentLoaded', function() {
  // Don't auto-initialize - wait for data to be fetched by main.js
  // We'll check for data every 500ms for up to 10 seconds (20 attempts)
  let attempts = 0;
  const maxAttempts = 20;
  
  const checkAndInitialize = function() {
    if (window.certificationsData && window.certificationsData.length > 0) {
      console.log("Certification data found, initializing certification cards");
      initCertificationCards();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkAndInitialize, 500);
    } else {
      console.log("No certification data found after waiting, initializing with sample data");
      initCertificationCards();
    }
  };
  
  // Start checking for data
  checkAndInitialize();
});

// Initialize the certification cards with animations and interactive features
function initCertificationCards() {
  const certificationSection = document.querySelector('.certifications-section');
  if (!certificationSection) {
    console.error("Certification section not found");
    return;
  }
  
  const container = document.querySelector('.certifications-container');
  if (!container) {
    console.error("Certifications container not found");
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Add the section title with animation
  const sectionTitle = certificationSection.querySelector('.section-title');
  if (sectionTitle) {
    sectionTitle.classList.add('animated-title');
  }
  
  // Add grid layout container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'certification-grid';
  container.appendChild(gridContainer);
  
  // Get certifications data from the global variable or fetch it
  let certifications = window.certificationsData || [];
  console.log("Using certification data:", certifications);
  
  if (!certifications || certifications.length === 0) {
    // If no certifications data is available, use sample data
    certifications = getSampleCertifications();
    console.log("Using sample certification data");
    
    // Add a message if no data is available
    if (certifications.length === 0) {
      const noData = document.createElement('p');
      noData.textContent = 'No certifications available';
      noData.className = 'no-data-message';
      container.appendChild(noData);
      return;
    }
  }
  
  // Set the color scheme based on the references
  const colors = [
    { bg: '#6c584c', light: '#8a7868' },  // dark brown
    { bg: '#a38566', light: '#c0a488' },  // medium brown
    { bg: '#d1b38a', light: '#e5cbaa' },  // light brown/tan
    { bg: '#e9dac1', light: '#f5ecdf' },  // cream/beige
  ];
  
  // Create each certification card
  certifications.forEach((cert, index) => {
    const colorIndex = index % colors.length;
    const card = createCertificationCard(cert, colors[colorIndex], index);
    gridContainer.appendChild(card);
    
    // Add staggered animation effect
    setTimeout(() => {
      card.classList.add('card-visible');
    }, 100 * index);
  });
  
  // Add modal element for certification details
  addCertificationModal();
  
  // Add hover effects and click listeners
  setupInteractivity();
}

// Create a single certification card
function createCertificationCard(certification, color, index) {
  const card = document.createElement('div');
  card.className = 'certification-card';
  card.dataset.certIndex = index;
  card.dataset.certId = certification.id || '';
  card.style.backgroundColor = color.bg;
  card.style.borderColor = color.light;
  
  // Parse dates for proper display
  const issuedDate = certification.issued_date ? new Date(certification.issued_date) : null;
  const expiryDate = certification.expiry_date ? new Date(certification.expiry_date) : null;
  
  const formattedIssuedDate = issuedDate ? 
    `${getMonthName(issuedDate.getMonth())} ${issuedDate.getFullYear()}` : '';
  
  // Get the first letter or abbreviation for the logo
  const logoText = getLogoAbbreviation(certification.issuer_name);
  
  // Build the card HTML
  card.innerHTML = `
    <div class="cert-header">
      <div class="cert-logo" style="background-color: ${color.light}">
        <span>${logoText}</span>
      </div>
      <div class="cert-date">${formattedIssuedDate}</div>
    </div>
    <div class="cert-body">
      <h3 class="cert-title">${certification.certification_name}</h3>
      <p class="cert-issuer">${certification.issuer_name}</p>
      ${certification.credential_id ? `<p class="cert-id">ID: ${certification.credential_id}</p>` : ''}
      <div class="cert-tags">
        ${getTagsHTML(certification.issuer_name)}
      </div>
      <a href="#" class="cert-details-link">View details <span>&rarr;</span></a>
    </div>
    <div class="lighting-effect"></div>
  `;
  
  return card;
}

// Generate tags based on certification issuer
function getTagsHTML(issuer) {
  let tags = [];
  
  if (issuer.toLowerCase().includes('aws')) {
    tags = ['Cloud Architecture', 'AWS Services'];
  } else if (issuer.toLowerCase().includes('scrum')) {
    tags = ['Agile', 'Scrum'];
  } else if (issuer.toLowerCase().includes('google') || issuer.toLowerCase().includes('gcp')) {
    tags = ['GCP', 'Cloud Solutions'];
  } else if (issuer.toLowerCase().includes('azure') || issuer.toLowerCase().includes('microsoft')) {
    tags = ['Azure', 'Cloud Development'];
  } else if (issuer.toLowerCase().includes('kubernetes') || issuer.toLowerCase().includes('k8s')) {
    tags = ['Kubernetes', 'Container Orchestration'];
  } else if (issuer.toLowerCase().includes('mongo')) {
    tags = ['MongoDB', 'NoSQL'];
  } else {
    tags = ['Technology', 'Certification'];
  }
  
  return tags.map(tag => `<span class="cert-tag">${tag}</span>`).join('');
}

// Get a logo abbreviation from the issuer name
function getLogoAbbreviation(issuer) {
  if (!issuer) return '?';
  
  if (issuer.toLowerCase().includes('aws')) {
    return 'AWS';
  } else if (issuer.toLowerCase().includes('scrum')) {
    return 'Scrum';
  } else if (issuer.toLowerCase().includes('google')) {
    return 'GCP';
  } else if (issuer.toLowerCase().includes('azure') || issuer.toLowerCase().includes('microsoft')) {
    return 'Azure';
  } else if (issuer.toLowerCase().includes('kubernetes')) {
    return 'K8s';
  } else if (issuer.toLowerCase().includes('mongo')) {
    return 'MongoDB';
  } else {
    // Extract initials from the name
    return issuer.split(/\s+/).map(word => word[0]).join('').slice(0, 3).toUpperCase();
  }
}

// Add modal for displaying certification details
function addCertificationModal() {
  // Check if modal already exists
  if (document.getElementById('certification-modal')) return;
  
  const modal = document.createElement('div');
  modal.id = 'certification-modal';
  modal.className = 'certification-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close">&times;</button>
      <div class="modal-body">
        <!-- Content will be dynamically inserted here -->
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button functionality
  const closeButton = modal.querySelector('.modal-close');
  closeButton.addEventListener('click', () => {
    modal.classList.remove('modal-open');
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('modal-open');
    }
  });
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal-open')) {
      modal.classList.remove('modal-open');
    }
  });
}

// Setup interactivity for the certification cards
function setupInteractivity() {
  const cards = document.querySelectorAll('.certification-card');
  const container = document.querySelector('.certification-grid');
  
  // Add mouse move effect for lighting
  if (container) {
    container.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('.certification-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
          const effect = card.querySelector('.lighting-effect');
          if (effect) {
            effect.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)`;
            effect.style.opacity = '1';
          }
        } else {
          const effect = card.querySelector('.lighting-effect');
          if (effect) {
            effect.style.opacity = '0';
          }
        }
      });
    });
  }
  
  // Add click handlers to open modal
  cards.forEach(card => {
    card.addEventListener('click', () => {
      openCertificationModal(parseInt(card.dataset.certIndex));
    });
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
      card.classList.add('card-hover');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('card-hover');
    });
    
    // Also add click handler for the 'View details' link
    const detailsLink = card.querySelector('.cert-details-link');
    if (detailsLink) {
      detailsLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent the card click handler from firing
        openCertificationModal(parseInt(card.dataset.certIndex));
      });
    }
  });
}

// Open the certification modal with details
function openCertificationModal(index) {
  const certifications = window.certificationsData || getSampleCertifications();
  if (!certifications || !certifications[index]) return;
  
  const certification = certifications[index];
  const modal = document.getElementById('certification-modal');
  if (!modal) return;
  
  const modalBody = modal.querySelector('.modal-body');
  if (!modalBody) return;
  
  // Get logo abbr
  const logoText = getLogoAbbreviation(certification.issuer_name);
  
  // Format dates
  const issuedDate = certification.issued_date ? new Date(certification.issued_date) : null;
  const formattedIssuedDate = issuedDate ? 
    `${getMonthName(issuedDate.getMonth())} ${issuedDate.getFullYear()}` : '';
  
  // Generate HTML for modal content
  modalBody.innerHTML = `
    <div class="modal-content-inner">
      <div class="modal-cert-logo">
        <span>${logoText}</span>
      </div>
      
      <h2 class="modal-cert-title">${certification.certification_name}</h2>
      <p class="modal-cert-issuer">${certification.issuer_name}</p>
      
      <div class="modal-cert-date">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-calendar">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        ${formattedIssuedDate}
      </div>
      
      <div class="modal-credential-id">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-credential">
          <path d="M12 15l-4-4 6-6 4 4-6 6z"></path>
          <path d="M14 9l-4-4"></path>
          <path d="M21 21H3v-4l5-5 4 4 9-9"></path>
        </svg>
        Credential ID<br>
        <span>${certification.credential_id || 'N/A'}</span>
      </div>
      
      <div class="modal-cert-description">
        <h3>Description</h3>
        <p>${certification.description || 'Demonstrated knowledge and ability in applying the skills and techniques required for this certification.'}</p>
      </div>
      
      <div class="modal-cert-skills">
        <h3>Skills</h3>
        <div class="modal-cert-tags">
          ${getDetailedTagsHTML(certification.issuer_name)}
        </div>
      </div>
      
      ${certification.credential_link ? 
        `<a href="${certification.credential_link}" target="_blank" class="modal-cert-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 2H9a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"></path>
            <path d="M12 18h.01"></path>
            <path d="M12 6v8"></path>
          </svg>
          View Certificate
        </a>` : ''
      }
    </div>
  `;
  
  // Open the modal
  modal.classList.add('modal-open');
}

// Get more detailed tags for the modal
function getDetailedTagsHTML(issuer) {
  let tags = [];
  
  if (issuer.toLowerCase().includes('aws')) {
    tags = ['Cloud Architecture', 'AWS Services', 'Cloud Solutions', 'Infrastructure as Code', 'Team Leadership'];
  } else if (issuer.toLowerCase().includes('scrum')) {
    tags = ['Agile', 'Scrum', 'Team Leadership', 'Sprint Planning'];
  } else if (issuer.toLowerCase().includes('google') || issuer.toLowerCase().includes('gcp')) {
    tags = ['GCP', 'Cloud Solutions', 'Cloud Architecture', 'Google Cloud'];
  } else if (issuer.toLowerCase().includes('azure') || issuer.toLowerCase().includes('microsoft')) {
    tags = ['Azure', 'Cloud Development', 'Microsoft', 'Cloud Services'];
  } else if (issuer.toLowerCase().includes('kubernetes') || issuer.toLowerCase().includes('k8s')) {
    tags = ['Kubernetes', 'Container Orchestration', 'Cloud Native', 'DevOps'];
  } else if (issuer.toLowerCase().includes('mongo')) {
    tags = ['MongoDB', 'NoSQL', 'Database Design', 'Data Modeling'];
  } else {
    tags = ['Technology', 'Professional Development', 'Certification'];
  }
  
  return tags.map(tag => `<span class="modal-cert-tag">${tag}</span>`).join('');
}

// Helper function to get month name
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

// Sample certification data for testing
function getSampleCertifications() {
  return [
    {
      id: 1,
      certification_name: "AWS Certified Solutions Architect",
      issuer_name: "Amazon Web Services",
      credential_id: "AWS-123456",
      issued_date: "2023-01-15",
      expiry_date: "2026-01-15",
      description: "Demonstrated knowledge of AWS framework and ability to apply it effectively in cloud architecture solutions."
    },
    {
      id: 2,
      certification_name: "Professional Scrum Master I",
      issuer_name: "Scrum.org",
      credential_id: "PSM-987654",
      issued_date: "2022-03-10",
      description: "Demonstrated knowledge of Scrum framework and ability to apply it effectively in team environments."
    },
    {
      id: 3,
      certification_name: "Google Cloud Professional Architect",
      issuer_name: "Google Cloud",
      credential_id: "GCP-456789",
      issued_date: "2021-11-22",
      description: "Validated expertise in designing, developing, and managing dynamic solutions on the Google Cloud platform."
    },
    {
      id: 4,
      certification_name: "Microsoft Certified: Azure Developer Associate",
      issuer_name: "Microsoft",
      credential_id: "AZ-204-123456",
      issued_date: "2021-08-05",
      description: "Demonstrated ability to design, build, test, and maintain cloud applications and services on Microsoft Azure."
    },
    {
      id: 5,
      certification_name: "Certified Kubernetes Administrator",
      issuer_name: "Cloud Native Computing Foundation",
      credential_id: "CKA-654321",
      issued_date: "2021-05-18",
      description: "Demonstrated proficiency in managing Kubernetes clusters and containerized applications at scale."
    },
    {
      id: 6,
      certification_name: "MongoDB Certified Developer Associate",
      issuer_name: "MongoDB University",
      credential_id: "MCD-789012",
      issued_date: "2021-02-12",
      description: "Validated skills in developing applications using MongoDB's document data model and query language."
    }
  ];
} 