// sidebar.js

function loadSidebar() {
  fetch('../sidebar/sidebar.html')
    .then(response => response.text())
    .then(data => {

      document.body.innerHTML = data + document.body.innerHTML;
    })
    .catch(error => console.error('Error loading sidebar:', error));
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');

  if (sidebar && mainContent) {
    sidebar.classList.toggle('hidden');
    mainContent.style.marginLeft = sidebar.classList.contains('hidden') ? '0' : '250px';
  }
}

function loadContent(page) {
  const mainContent = document.getElementById('main-content');
  
  if (mainContent) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        mainContent.innerHTML = xhr.responseText;
      } else if (xhr.readyState === XMLHttpRequest.DONE) {
        console.error('Failed to load content:', xhr.statusText);
      }
    };
    const url = `./${page}/${page}.html`; 
    xhr.open('GET', url, true);
    xhr.send();
  } else {
    console.error('Main content element not found.');
  }
}

// Call `loadSidebar` when the page loads
window.onload = function() {
  loadSidebar();
};
