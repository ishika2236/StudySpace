
let projects = JSON.parse(localStorage.getItem('projects')) || [];

        const projectForm = document.getElementById('projectForm');
        const projectList = document.getElementById('projectList');

        function renderProjects() {
            projectList.innerHTML = '';
            projects.forEach((project, index) => {
                const projectItem = document.createElement('div');
                projectItem.classList.add('project-item');
                projectItem.innerHTML = `
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    <p><strong>Deadline:</strong> ${project.deadline}</p>
                    <button onclick="deleteProject(${index})">Delete</button>
                `;
                projectList.appendChild(projectItem);
            });
        }

        function addProject(event) {
            event.preventDefault();
            const project = {
                name: document.getElementById('projectName').value,
                description: document.getElementById('projectDescription').value,
                deadline: document.getElementById('projectDeadline').value
            };
            projects.push(project);
            localStorage.setItem('projects', JSON.stringify(projects));
            renderProjects();
            projectForm.reset();
        }

        function deleteProject(index) {
            projects.splice(index, 1);
            localStorage.setItem('projects', JSON.stringify(projects));
            renderProjects();
        }

        function downloadJSON() {
            const dataStr = JSON.stringify(projects, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = 'project_data.json';

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }

        projectForm.addEventListener('submit', addProject);
        // downloadJSONBtn.addEventListener('click', downloadJSON);
        document.addEventListener('DomContentLoaded',function(){
            renderProjects();
        })