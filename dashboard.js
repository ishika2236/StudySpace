document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    updateSidebar();

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    const streamButton = document.getElementById('stream-button');
    streamButton.addEventListener('click', function() {
        alert('Stream functionality not implemented yet.');
    });
});

function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const activeProjectsList = document.getElementById('active-projects-list');
    activeProjectsList.innerHTML = '';

    projects.forEach(project => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${project.name}
            <button onclick="editProject(${project.id})">Edit</button>
            <button onclick="viewAnalytics(${project.id})">View Analytics</button>
        `;
        activeProjectsList.appendChild(li);
    });
}

function editProject(projectId) {
    window.location.href = `input.html?projectId=${projectId}`;
}

function viewAnalytics(projectId) {
    window.location.href = `analytics.html?projectId=${projectId}`;
}

function updateSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <button onclick="showNewProjectForm()">Add Project</button>
        <button onclick="viewAllAnalytics()">View All Analytics</button>
    `;
}

function showNewProjectForm() {
    window.location.href = 'input.html';
}

function viewAllAnalytics() {
    window.location.href = 'analytics.html';
}