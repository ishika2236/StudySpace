// Global variables
let projects = [];
let currentProjectId = null;

// Function to create a new project
function createProject(name, description) {
    const project = {
        id: Date.now(),
        name: name,
        description: description,
        generalInfo: {
            projectName: name,
            projectDescription: description,
            projectOwner: "",
            projectManager: "",
            teamMembers: [],
            startDate: "",
            plannedEndDate: ""
        },
        projectScope: {
            features: [],
            phases: [],
            deliverables: []
        },
        tasks: [],
        budget: {
            total: 0,
            used: 0,
            costItems: []
        },
        communication: {
            updates: [],
            meetings: []
        }
    };
    projects.push(project);
    return project;
}

// Functions to save and load projects
function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function loadProjects() {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
        projects = JSON.parse(savedProjects);
    }
}

// Function to get the current project
function getCurrentProject() {
    return projects.find(p => p.id === currentProjectId);
}

// Navigation functions
let currentPage = 'projectList';
const pages = ['projectList', 'generalInfo', 'projectScope', 'taskList', 'budgetTracking', 'communication','riskManagement', 'summary'];

function showSetTotalBudgetPrompt() {
    const totalBudget = prompt("Enter the total budget for the project:");
    if (totalBudget !== null && !isNaN(totalBudget)) {
        setTotalBudget(parseFloat(totalBudget));
    }
}

function setTotalBudget(amount) {
    const project = getCurrentProject();
    if (!project) return;

    project.budget.total = amount;
    updateBudgetInfo();
    alert(`Total budget set to $${amount.toFixed(2)}`);
}

function goToDashboard() {
    document.getElementById('summary').style.display = 'none';
    document.getElementById('postSummaryActions').style.display = 'none';
    document.getElementById('projectList').style.display = 'block';
    currentPage = 'projectList';
    updateProgressBar();
}

function nextPage() {
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex < pages.length - 1) {
        document.getElementById(currentPage).style.display = 'none';
        currentPage = pages[currentIndex + 1];
        document.getElementById(currentPage).style.display = 'block';
        updateProgressBar();

        if (currentPage === 'summary') {
            document.getElementById('postSummaryActions').style.display = 'block';
            displayProjectSummary();
        } else {
            document.getElementById('postSummaryActions').style.display = 'none';
        }
    }
}

function prevPage() {
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
        document.getElementById(currentPage).style.display = 'none';
        currentPage = pages[currentIndex - 1];
        document.getElementById(currentPage).style.display = 'block';
        updateProgressBar();

        document.getElementById('postSummaryActions').style.display = 'none';
    }
}

function updateProgressBar() {
    const progress = (pages.indexOf(currentPage) + 1) / pages.length * 100;
    document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
}
function deleteProject(projectId) {
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
        if (confirm('Are you sure you want to delete this project?')) {
            projects.splice(index, 1);
            saveProjects();
            displayProjectList();
            alert('Project deleted successfully!');
        }
    }
}
// Project list functions
function displayProjectList() {
    const projectListItems = document.getElementById('projectListItems');
    projectListItems.innerHTML = '';
    projects.forEach(project => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${project.name}
            <div class="controls">
            <button onclick="loadProject(${project.id})">View</button>
            <button onclick="editProject(${project.id})">Edit</button>
            <button onclick="viewAnalytics(${project.id})">Analytics</button>
            <button onclick="deleteProject(${project.id})">Delete</button>
            </div>
        `;
        projectListItems.appendChild(li);
    });
}

function showNewProjectForm() {
    document.getElementById('projectList').style.display = 'none';
    document.getElementById('newProjectForm').style.display = 'block';
}

function createNewProject() {
    const name = document.getElementById('newProjectName').value;
    const description = document.getElementById('newProjectDescription').value;
    if (name) {
        const project = createProject(name, description);
        loadProject(project.id);
    } else {
        alert('Please enter a project name.');
    }
}

function loadProject(projectId) {
    currentProjectId = projectId;
    const project = getCurrentProject();
    if (project) {
        document.getElementById('projectList').style.display = 'none';
        document.getElementById('newProjectForm').style.display = 'none';
        document.getElementById('projectDashboard').style.display = 'block';
        document.getElementById('projectTitle').textContent = project.name;
        populateProjectData();
        currentPage = 'generalInfo';
        pages.forEach(page => {
            document.getElementById(page).style.display = page === 'generalInfo' ? 'block' : 'none';
        });
        updateProgressBar();
        updateSidebar();
    }
}

function editProject(projectId) {
    loadProject(projectId);
    enableProjectEditing();
}

function viewAnalytics(projectId) {
    window.location.href = `analytics.html?projectId=${projectId}`;
}

function populateProjectData() {
    const project = getCurrentProject();
    if (!project) return;

    // Populate General Info
    document.getElementById('projectName').value = project.generalInfo.projectName;
    document.getElementById('projectDescription').value = project.generalInfo.projectDescription;
    document.getElementById('projectOwner').value = project.generalInfo.projectOwner;
    document.getElementById('projectManager').value = project.generalInfo.projectManager;
    document.getElementById('teamMembers').value = project.generalInfo.teamMembers.join(', ');
    document.getElementById('startDate').value = project.generalInfo.startDate;
    document.getElementById('plannedEndDate').value = project.generalInfo.plannedEndDate;

    // Populate Project Scope
    displayItems('features');
    displayItems('phases');
    displayItems('deliverables');

    // Populate Task List
    displayTasks();

    // Populate Budget Tracking
    document.getElementById('totalBudget').textContent = project.budget.total.toFixed(2);
    updateBudgetInfo();
    displayCostItems();

    // Populate Communication
    displayUpdates();
    displayMeetings();
    updateMeetingInvitees();

    // Populate Summary
    displayProjectSummary();
}

// General Info functions
function updateProjectInfo() {
    const project = getCurrentProject();
    if (!project) return;

    project.generalInfo.projectName = document.getElementById('projectName').value;
    project.generalInfo.projectDescription = document.getElementById('projectDescription').value;
    project.generalInfo.projectOwner = document.getElementById('projectOwner').value;
    project.generalInfo.projectManager = document.getElementById('projectManager').value;
    project.generalInfo.startDate = document.getElementById('startDate').value;
    project.generalInfo.plannedEndDate = document.getElementById('plannedEndDate').value;
    
    const teamMembersInput = document.getElementById('teamMembers').value;
    project.generalInfo.teamMembers = teamMembersInput.split(',').map(member => member.trim()).filter(member => member);
    
    updateMeetingInvitees();
}

function updateMeetingInvitees() {
    const project = getCurrentProject();
    if (!project) return;

    const inviteesSelect = document.getElementById('meetingInvitees');
    inviteesSelect.innerHTML = '<option value="all">All</option>';
    project.generalInfo.teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        inviteesSelect.appendChild(option);
    });
}

// Project Scope functions
function updateProjectScope() {
    const project = getCurrentProject();
    if (!project) return;

    project.projectScope.features = document.getElementById('features').value.split('\n').filter(feature => feature.trim() !== '');
    project.projectScope.phases = document.getElementById('phases').value.split('\n').filter(phase => phase.trim() !== '');
    project.projectScope.deliverables = document.getElementById('deliverables').value.split('\n').filter(deliverable => deliverable.trim() !== '');
}

function addItem(category) {
    const project = getCurrentProject();
    if (!project) return;

    const newItemInput = document.getElementById(`new${category.charAt(0).toUpperCase() + category.slice(1, -1)}`);
    const newItem = newItemInput.value.trim();
    
    if (newItem) {
        project.projectScope[category].push(newItem);
        displayItems(category);
        newItemInput.value = '';
    } else {
        alert(`Please enter a valid ${category.slice(0, -1)}.`);
    }
}

function displayItems(category) {
    const project = getCurrentProject();
    if (!project) return;

    const container = document.getElementById(`${category}Container`);
    container.innerHTML = '';
    project.projectScope[category].forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = `${category.slice(0, -1)}-item`;
        itemElement.innerHTML = `
            • ${item}
            <button onclick="removeItem('${category}', ${index})">Remove</button>
        `;
        container.appendChild(itemElement);
    });
}

function removeItem(category, index) {
    const project = getCurrentProject();
    if (!project) return;

    project.projectScope[category].splice(index, 1);
    displayItems(category);
}

// Task functions
function addTask() {
    const project = getCurrentProject();
    if (!project) return;

    const task = {
        id: Date.now(),
        name: document.getElementById('taskName').value,
        responsible: document.getElementById('taskResponsible').value,
        importance: document.getElementById('taskImportance').value,
        deadline: document.getElementById('taskDeadline').value,
        estimatedDuration: parseFloat(document.getElementById('estimatedDuration').value) || 0,
        budget: parseFloat(document.getElementById('taskBudget').value) || 0,
        actualDuration: 0,
        status: 'Not Started',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0]
    };

    project.tasks.push(task);
    project.budget.used += task.budget;

    displayTasks();
    updateBudgetInfo();
    updateAnalytics();
    clearTaskForm();
}

function displayTasks() {
    const project = getCurrentProject();
    if (!project) return;

    const taskList = document.getElementById('taskListContainer');
    taskList.innerHTML = '';

    project.tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            • <strong>${task.name}</strong> - ${task.responsible}<br>
            Importance: ${task.importance} | Deadline: ${task.deadline}<br>
            Estimated Duration: ${task.estimatedDuration} hours | Actual Duration: ${task.actualDuration} hours<br>
            Budget: $${task.budget} | Progress: ${task.progress}%<br>
            Status: 
            <select onchange="updateTaskStatus(${index}, this.value)">
                <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
            Actual Duration: <input type="number" value="${task.actualDuration}" onchange="updateTaskDuration(${index}, this.value)">
            Progress: <input type="number" min="0" max="100" value="${task.progress}" onchange="updateTaskProgress(${index}, this.value)">
        `;
        taskList.appendChild(taskElement);
    });
}

function updateTaskStatus(index, status) {
    const project = getCurrentProject();
    if (!project) return;

    project.tasks[index].status = status;
    if (status === 'Completed') {
        project.tasks[index].progress = 100;
        if (project.tasks[index].actualDuration === 0) {
            const startDate = new Date(project.tasks[index].startDate);
            const endDate = new Date();
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            project.tasks[index].actualDuration = diffDays * 8;
        }
    }
    displayTasks();
    updateAnalytics();
    saveProjects();
}

function updateTaskDuration(index, duration) {
    const project = getCurrentProject();
    if (!project) return;

    project.tasks[index].actualDuration = parseFloat(duration);
    displayTasks();
    updateAnalytics();
    saveProjects();
}

function updateTaskProgress(index, progress) {
    const project = getCurrentProject();
    if (!project) return;

    project.tasks[index].progress = parseFloat(progress);
    if (progress == 100) {
        project.tasks[index].status = 'Completed';
    } else if (progress > 0) {
        project.tasks[index].status = 'In Progress';
    }
    displayTasks();
    updateAnalytics();
    saveProjects();
}

function clearTaskForm() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskResponsible').value = '';
    document.getElementById('taskImportance').value = 'Low';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('estimatedDuration').value = '';
    document.getElementById('taskBudget').value = '';
}

function updateBudgetInfo() {
    const project = getCurrentProject();
    if (!project) return;

    document.getElementById('budgetUsed').textContent = project.budget.used.toFixed(2);
    const remainingBudget = project.budget.total - project.budget.used;
    document.getElementById('remainingBudget').textContent = remainingBudget.toFixed(2);
    const overrun = project.budget.used - project.budget.total;
    document.getElementById('costOverruns').textContent = (overrun > 0 ? overrun : 0).toFixed(2);
    saveProjects();
}


function displayCostItems() {
    const project = getCurrentProject();
    if (!project) return;

    const costItemsContainer = document.getElementById('costItems');
    costItemsContainer.innerHTML = '';
    project.budget.costItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cost-item';
        itemElement.innerHTML = `
            • <strong>${item.name}</strong>: $${item.amount}
            <button onclick="removeCostItem(${index})">Remove</button>
        `;
        costItemsContainer.appendChild(itemElement);
    });
}

function addCostItem() {
    const project = getCurrentProject();
    if (!project) return;

    const name = document.getElementById('costItemName').value;
    const amount = parseFloat(document.getElementById('costItemAmount').value) || 0;
    
    if (name) {
        project.budget.costItems.push({ name, amount });
        project.budget.used += amount;
        displayCostItems();
        updateBudgetInfo();
        document.getElementById('costItemName').value = '';
        document.getElementById('costItemAmount').value = '';
        saveProjects();
    } else {
        alert('Please enter a valid name for the cost item.');
    }
}
function removeCostItem(index) {
    const project = getCurrentProject();
    if (!project) return;

    const removedItem = project.budget.costItems.splice(index, 1)[0];
    project.budget.used -= removedItem.amount;
    displayCostItems();
    updateBudgetInfo();
    saveProjects();
}

// Communication functions
function addUpdate() {
    const project = getCurrentProject();
    if (!project) return;

    const update = {
        content: document.getElementById('updateContent').value,
        date: new Date().toISOString()
    };
    project.communication.updates.push(update);
    displayUpdates();
    document.getElementById('updateContent').value = '';
    saveProjects();
}

function displayUpdates() {
    const project = getCurrentProject();
    if (!project) return;

    const updatesContainer = document.getElementById('updatesContainer');
    updatesContainer.innerHTML = '';
    project.communication.updates.forEach(update => {
        const updateElement = document.createElement('div');
        updateElement.className = 'update-item';
        updateElement.innerHTML = `
            • <strong>${new Date(update.date).toLocaleString()}</strong><br>
            ${update.content}
        `;
        updatesContainer.appendChild(updateElement);
    });
}

function scheduleMeeting() {
    const project = getCurrentProject();
    if (!project) return;

    const meeting = {
        title: document.getElementById('meetingTitle').value,
        dateTime: document.getElementById('meetingDateTime').value,
        agenda: document.getElementById('meetingAgenda').value,
        invitees: Array.from(document.getElementById('meetingInvitees').selectedOptions).map(option => option.value)
    };
    project.communication.meetings.push(meeting);
    displayMeetings();
    alert('Meeting scheduled successfully!');
    clearMeetingForm();
    saveProjects();
}

function clearMeetingForm() {
    document.getElementById('meetingTitle').value = '';
    document.getElementById('meetingDateTime').value = '';
    document.getElementById('meetingAgenda').value = '';
    document.getElementById('meetingInvitees').selectedIndex = -1;
}

function displayMeetings() {
    const project = getCurrentProject();
    if (!project) return;

    const meetingsContainer = document.getElementById('meetingsContainer');
    meetingsContainer.innerHTML = '';
    project.communication.meetings.forEach(meeting => {
        const meetingElement = document.createElement('div');
        meetingElement.className = 'meeting-item';
        meetingElement.innerHTML = `
            • <strong>${meeting.title}</strong><br>
            Date/Time: ${new Date(meeting.dateTime).toLocaleString()}<br>
            Agenda: ${meeting.agenda}<br>
            Invitees: ${meeting.invitees.join(', ')}
        `;
        meetingsContainer.appendChild(meetingElement);
    });
}

// Project summary function
function displayProjectSummary() {
    const project = getCurrentProject();
    if (!project) return;

    const summary = document.getElementById('summary');
    summary.innerHTML = `
        <h2>Project Summary</h2>
        <h3>General Information</h3>
        <p><strong>Project Name:</strong> ${project.generalInfo.projectName}</p>
        <p><strong>Project Description:</strong> ${project.generalInfo.projectDescription}</p>
        <p><strong>Project Owner:</strong> ${project.generalInfo.projectOwner}</p>
        <p><strong>Project Manager:</strong> ${project.generalInfo.projectManager}</p>
        <p><strong>Team Members:</strong> ${project.generalInfo.teamMembers.join(', ')}</p>
        <p><strong>Start Date:</strong> ${project.generalInfo.startDate}</p>
        <p><strong>Planned End Date:</strong> ${project.generalInfo.plannedEndDate}</p>

        <h3>Project Scope</h3>
        <p><strong>Features:</strong> ${project.projectScope.features.join(', ')}</p>
        <p><strong>Phases:</strong> ${project.projectScope.phases.join(', ')}</p>
        <p><strong>Deliverables:</strong> ${project.projectScope.deliverables.join(', ')}</p>

        <h3>Tasks</h3>
        <p><strong>Total Tasks:</strong> ${project.tasks.length}</p>
        <p><strong>Completed Tasks:</strong> ${project.tasks.filter(task => task.status === 'Completed').length}</p>

        <h3>Budget</h3>
        <p><strong>Total Budget:</strong> $${project.budget.total.toFixed(2)}</p>
        <p><strong>Budget Used:</strong> $${project.budget.used.toFixed(2)}</p>
        <p><strong>Remaining Budget:</strong> $${(project.budget.total - project.budget.used).toFixed(2)}</p>
        <p><strong>Cost Overruns:</strong> $${Math.max(0, project.budget.used - project.budget.total).toFixed(2)}</p>

        <h3>Communication</h3>
        <p><strong>Project Updates:</strong> ${project.communication.updates.length}</p>
        <p><strong>Scheduled Meetings:</strong> ${project.communication.meetings.length}</p>
    `;
}

// Analytics functions
function updateAnalytics() {
    const project = getCurrentProject();
    if (!project) return;

    // Calculate task completion rate
    const completedTasks = project.tasks.filter(task => task.status === 'Completed').length;
    const totalTasks = project.tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate budget usage
    const budgetUsageRate = project.budget.total > 0 ? (project.budget.used / project.budget.total) * 100 : 0;

    // Update analytics display
    const analyticsContainer = document.getElementById('analytics');
    analyticsContainer.innerHTML = `
        <h3>Project Analytics</h3>
        <p><strong>Task Completion Rate:</strong> ${completionRate.toFixed(2)}%</p>
        <p><strong>Budget Usage:</strong> ${budgetUsageRate.toFixed(2)}%</p>
    `;
}

// Function to export project data
function exportProjectData() {
    const project = getCurrentProject();
    if (!project) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", project.name + "_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function saveProject() {
    saveProjects();
    alert('Project saved successfully!');
}

// New function to update sidebar
function updateSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <button onclick="goToDashboard()">Go to Project List</button>
        <button onclick="showNewProjectForm()">Add Project</button>
        <button><a href="http://127.0.0.1:5500/stream.html">Join Stream</a></button>
        

    `;
}

// Function to enable project editing
function enableProjectEditing() {
    const inputs = document.querySelectorAll('#projectDashboard input, #projectDashboard textarea');
    inputs.forEach(input => input.removeAttribute('disabled'));

    document.getElementById('saveProject').style.display = 'inline-block';
    document.getElementById('editProject').style.display = 'none';
}

// Function to import project data
function importProjectData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedProject = JSON.parse(e.target.result);
                projects.push(importedProject);
                saveProjects();
                displayProjectList();
                alert('Project imported successfully!');
            } catch (error) {
                alert('Error importing project: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}
function addRisk() {
    const project = getCurrentProject();
    if (!project) return;

    const risk = {
        id: Date.now(),
        name: document.getElementById('riskName').value,
        description: document.getElementById('riskDescription').value,
        probability: document.getElementById('riskProbability').value,
        impact: document.getElementById('riskImpact').value,
        mitigationPlan: document.getElementById('riskMitigation').value
    };

    if (!project.risks) {
        project.risks = [];
    }

    project.risks.push(risk);
    displayRisks();
    clearRiskForm();
    saveProjects();
}

function displayRisks() {
    const project = getCurrentProject();
    if (!project || !project.risks) return;

    const riskListContainer = document.getElementById('riskListContainer');
    riskListContainer.innerHTML = '';

    project.risks.forEach((risk, index) => {
        const riskElement = document.createElement('div');
        riskElement.className = 'risk-item';
        riskElement.innerHTML = `
            • <strong>${risk.name}</strong><br>
            Description: ${risk.description}<br>
            Probability: ${risk.probability} | Impact: ${risk.impact}<br>
            Mitigation Plan: ${risk.mitigationPlan}<br>
            <button onclick="removeRisk(${index})">Remove</button>
        `;
        riskListContainer.appendChild(riskElement);
    });
}
function removeRisk(index) {
    const project = getCurrentProject();
    if (!project || !project.risks) return;

    project.risks.splice(index, 1);
    displayRisks();
    saveProjects();
}

function clearRiskForm() {
    document.getElementById('riskName').value = '';
    document.getElementById('riskDescription').value = '';
    document.getElementById('riskProbability').value = 'Low';
    document.getElementById('riskImpact').value = 'Low';
    document.getElementById('riskMitigation').value = '';
}

// Initialize the application
loadProjects();
displayProjectList();
updateSidebar();
// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const editProjectBtn = document.getElementById('editProject');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const streamButton = document.getElementById('stream-button');

    editProjectBtn.addEventListener('click', function() {
        enableProjectEditing();
    });

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    streamButton.addEventListener('click', function() {
        alert('Stream functionality not implemented yet.');
    });

    document.getElementById('importProjectFile').addEventListener('change', importProjectData);
    document.getElementById('exportProjectBtn').addEventListener('click', exportProjectData);
    document.getElementById('saveProjectBtn').addEventListener('click', saveProject);
    document.getElementById('addRiskBtn').addEventListener('click', addRisk);

    updateSidebar();
});