function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
  
    if (sidebar && mainContent) {  // Ensure elements exist
      sidebar.classList.toggle('hidden');
      
      // Adjust margin based on sidebar visibility
      if (sidebar.classList.contains('hidden')) {
        mainContent.style.marginLeft = '0';
      } else {
        mainContent.style.marginLeft = '250px'; // Adjust this to match sidebar width
      }
    } else {
      console.error('Sidebar or main content element not found.');
    }
  }
  
  function loadContent(page) {
    const mainContent = document.getElementById('main-content');
    
    if (mainContent) {  // Ensure mainContent exists
      const xhr = new XMLHttpRequest();
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          mainContent.innerHTML = xhr.responseText;
        } else if (xhr.readyState === XMLHttpRequest.DONE) {
          console.error('Failed to load content:', xhr.statusText);
        }
      };
      
      // Construct URL based on page parameter
      const url = `http://127.0.0.1:5500/components/${page}/${page}.html`;
      
      xhr.open('GET', url, true);
      xhr.send();
    } else {
      console.error('Main content element not found.');
    }
  }
  