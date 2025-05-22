function addGradientBackground() {
  const mainElement = document.querySelector('main');
  
  if (mainElement) {
    const gradientSpan = document.createElement('span');
    gradientSpan.id = 'custom-gradient-background';
    mainElement.insertBefore(gradientSpan, mainElement.firstChild);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addGradientBackground);
} else {
  addGradientBackground();
}