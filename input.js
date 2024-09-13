let projectData = {
    generalInfo: {
        projectName: "",
        projectDescription: "",
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

let currentPage = 'generalInfo';
const pages = ['generalInfo', 'projectScope', 'taskList', 'budgetTracking', 'communication', 'summary'];

function nextPage() {
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex < pages.length - 1) {
        document.getElementById(currentPage).style.display = 'none';
        currentPage = pages[currentIndex + 1];
        document.getElementById(currentPage).style.display = 'block';
        updateProgressBar();
    }
}

function prevPage() {
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
        document.getElementById(currentPage).style.display = 'none';
        currentPage = pages[currentIndex - 1];
        document.getElementById(currentPage).style.display = 'block';
        updateProgressBar();
    }
}

function updateProgressBar() {
    const progress = (pages.indexOf(currentPage) + 1) / pages.length * 100;
    document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
}

function updateProjectInfo() {
    projectData.generalInfo.projectName = document.getElementById('projectName').value;
    projectData.generalInfo.projectDescription = document.getElementById('projectDescription').value;
    projectData.generalInfo.projectOwner = document.getElementById('projectOwner').value;
    projectData.generalInfo.projectManager = document.getElementById('projectManager').value;
    projectData.generalInfo.startDate = document.getElementById('startDate').value;
    projectData.generalInfo.plannedEndDate = document.getElementById('plannedEndDate').value;
    
    const teamMembersInput = document.getElementById('teamMembers').value;
    projectData.generalInfo.teamMembers = teamMembersInput.split(',').map(member => member.trim()).filter(member => member);
    
    updateMeetingInvitees();
}

function updateMeetingInvitees() {
    const inviteesSelect = document.getElementById('meetingInvitees');
    inviteesSelect.innerHTML = '<option value="all">All</option>';
    projectData.generalInfo.teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        inviteesSelect.appendChild(option);
    });
}
function updateProjectScope() {
    projectData.projectScope.features = document.getElementById('features').value.split('\n').filter(feature => feature.trim() !== '');
    projectData.projectScope.phases = document.getElementById('phases').value.split('\n').filter(phase => phase.trim() !== '');
    projectData.projectScope.deliverables = document.getElementById('deliverables').value.split('\n').filter(deliverable => deliverable.trim() !== '');
}

function addItem(category) {
    const newItemInput = document.getElementById(`new${category.charAt(0).toUpperCase() + category.slice(1, -1)}`);
    const newItem = newItemInput.value.trim();
    
    if (newItem) {
        projectData.projectScope[category].push(newItem);
        displayItems(category);
        newItemInput.value = '';
    } else {
        alert(`Please enter a valid ${category.slice(0, -1)}.`);
    }
}

function displayItems(category) {
    const container = document.getElementById(`${category}Container`);
    container.innerHTML = '';
    projectData.projectScope[category].forEach((item, index) => {
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
    projectData.projectScope[category].splice(index, 1);
    displayItems(category);
}
function addTask() {
    const task = {
        name: document.getElementById('taskName').value,
        responsible: document.getElementById('taskResponsible').value,
        importance: document.getElementById('taskImportance').value,
        deadline: document.getElementById('taskDeadline').value,
        estimatedDuration: parseFloat(document.getElementById('estimatedDuration').value) || 0,
        budget: parseFloat(document.getElementById('taskBudget').value) || 0,
        actualDuration: 0,
        status: 'Not Started',
        progress: 0
    };

    projectData.tasks.push(task);
    if (!projectData.budget) {
        projectData.budget = { total: 0, used: 0, costItems: [] };
    }
    projectData.budget.used += task.budget;

    displayTasks();
    updateBudgetInfo();
    clearTaskForm();
}

function clearTaskForm() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskResponsible').value = '';
    document.getElementById('taskImportance').value = 'Low';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('estimatedDuration').value = '';
    document.getElementById('taskBudget').value = '';
}

function displayTasks() {
    const taskList = document.getElementById('taskListContainer');
    taskList.innerHTML = '';

    projectData.tasks.forEach((task, index) => {
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
    projectData.tasks[index].status = status;
    if (status === 'Completed') {
        projectData.tasks[index].progress = 100;
    }
    displayTasks();
    displayProjectSummary();
}

function updateTaskDuration(index, duration) {
    projectData.tasks[index].actualDuration = parseFloat(duration);
    displayTasks();
    displayProjectSummary();
}

function updateTaskProgress(index, progress) {
    projectData.tasks[index].progress = parseFloat(progress);
    if (progress == 100) {
        projectData.tasks[index].status = 'Completed';
    } else if (progress > 0) {
        projectData.tasks[index].status = 'In Progress';
    }
    displayTasks();
    displayProjectSummary();
}

function updateBudgetInfo() {
    document.getElementById('budgetUsed').textContent = projectData.budget.used.toFixed(2);
    const overrun = projectData.budget.used - projectData.budget.total;
    document.getElementById('costOverruns').textContent = (overrun > 0 ? overrun : 0).toFixed(2);
}

function displayCostItems() {
    const costItemsContainer = document.getElementById('costItems');
    costItemsContainer.innerHTML = '';
    projectData.budget.costItems.forEach((item, index) => {
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
    const name = document.getElementById('costItemName').value;
    const amount = parseFloat(document.getElementById('costItemAmount').value) || 0;
    
    if (name) {
        if (!projectData.budget) {
            projectData.budget = { total: 0, used: 0, costItems: [] };
        }
        projectData.budget.costItems.push({ name, amount });
        projectData.budget.used += amount;
        displayCostItems();
        updateBudgetInfo();
        document.getElementById('costItemName').value = '';
        document.getElementById('costItemAmount').value = '';
    } else {
        alert('Please enter a valid name for the cost item.');
    }
}

function removeCostItem(index) {
    const removedItem = projectData.budget.costItems.splice(index, 1)[0];
    projectData.budget.used -= removedItem.amount;
    displayCostItems();
    updateBudgetInfo();
}

function addUpdate() {
    const update = {
        content: document.getElementById('updateContent').value,
        date: new Date().toISOString()
    };
    projectData.communication.updates.push(update);
    displayUpdates();
    document.getElementById('updateContent').value = '';
}

function displayUpdates() {
    const updatesContainer = document.getElementById('updatesContainer');
    updatesContainer.innerHTML = '';
    projectData.communication.updates.forEach(update => {
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
    const meeting = {
        title: document.getElementById('meetingTitle').value,
        dateTime: document.getElementById('meetingDateTime').value,
        agenda: document.getElementById('meetingAgenda').value,
        invitees: Array.from(document.getElementById('meetingInvitees').selectedOptions).map(option => option.value)
    };
    projectData.communication.meetings.push(meeting);
    displayMeetings();
    alert('Meeting scheduled successfully!');
    clearMeetingForm();
}

function clearMeetingForm() {
    document.getElementById('meetingTitle').value = '';
    document.getElementById('meetingDateTime').value = '';
    document.getElementById('meetingAgenda').value = '';
    document.getElementById('meetingInvitees').selectedIndex = -1;
}

function displayMeetings() {
    const meetingsContainer = document.getElementById('meetingsContainer');
    meetingsContainer.innerHTML = '';
    projectData.communication.meetings.forEach(meeting => {
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

function displayProjectSummary() {
    const summary = document.getElementById('summary');
    summary.innerHTML = `
        <h2>Project Summary</h2>
        <h3>General Information</h3>
        <p><strong>Project Name:</strong> ${projectData.generalInfo.projectName}</p>
        <p><strong>Project Description:</strong> ${projectData.generalInfo.projectDescription}</p>
        <p><strong>Project Owner:</strong> ${projectData.generalInfo.projectOwner}</p>
        <p><strong>Project Manager:</strong> ${projectData.generalInfo.projectManager}</p>
        <p><strong>Team Members:</strong> ${projectData.generalInfo.teamMembers.join(', ')}</p>
        <p><strong>Start Date:</strong> ${projectData.generalInfo.startDate}</p>
        <p><strong>Planned End Date:</strong> ${projectData.generalInfo.plannedEndDate}</p>
        
        <h3>Project Scope</h3>
        <p><strong>Features:</strong></p>
        <ul>${projectData.projectScope.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
        <p><strong>Phases:</strong></p>
        <ul>${projectData.projectScope.phases.map(phase => `<li>${phase}</li>`).join('')}</ul>
        <p><strong>Deliverables:</strong></p>
        <ul>${projectData.projectScope.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}</ul>
    `;

    const totalTasks = projectData.tasks.length;
    const completedTasks = projectData.tasks.filter(task => task.status === 'Completed').length;
    const totalProgress = projectData.tasks.reduce((sum, task) => sum + task.progress, 0) / (totalTasks || 1);
    const totalEstimatedDuration = projectData.tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    const totalActualDuration = projectData.tasks.reduce((sum, task) => sum + task.actualDuration, 0);

    summary.innerHTML += `
        <h3>Tasks</h3>
        <p><strong>Total Tasks:</strong> ${totalTasks}</p>
        <p><strong>Completed Tasks:</strong> ${completedTasks}</p>
        <p><strong>Overall Progress:</strong> ${totalProgress.toFixed(2)}%</p>
        <p><strong>Total Estimated Duration:</strong> ${totalEstimatedDuration} hours</p>
        <p><strong>Total Actual Duration:</strong> ${totalActualDuration} hours</p>
        
        <h3>Budget</h3>
        <p><strong>Total Budget:</strong> $${projectData.budget.total}</p>
        <p><strong>Budget Used:</strong> $${projectData.budget.used}</p>
        <p><strong>Cost Overrun:</strong> $${Math.max(0, projectData.budget.used - projectData.budget.total)}</p>
        
        <h3>Communication</h3>
        <p><strong>Number of Updates:</strong> ${projectData.communication.updates.length}</p>
        <p><strong>Number of Meetings:</strong> ${projectData.communication.meetings.length}</p>
    `;
}

function exportToJSON() {
    const jsonData = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function saveProject() {
    localStorage.setItem('projectData', JSON.stringify(projectData));
    exportToJSON();
    alert('Project saved successfully! project_data.json file has been downloaded.');
}

function loadProject() {
    const savedData = localStorage.getItem('projectData');
    if (savedData) {
        projectData = JSON.parse(savedData);
        fillFormFields();
        displayTeamMembers();
        displayItems('features');
        displayItems('phases');
        displayItems('deliverables');
        displayTasks();
        updateBudgetInfo();
        displayCostItems();
        displayUpdates();
        displayMeetings();
        displayProjectSummary();
    }
}

function fillFormFields() {
    document.getElementById('projectName').value = projectData.generalInfo.projectName;
    document.getElementById('projectDescription').value = projectData.generalInfo.projectDescription;
    document.getElementById('projectOwner').value = projectData.generalInfo.projectOwner;
    document.getElementById('projectManager').value = projectData.generalInfo.projectManager;
    document.getElementById('startDate').value = projectData.generalInfo.startDate;
    document.getElementById('plannedEndDate').value = projectData.generalInfo.plannedEndDate;
    document.getElementById('totalBudget').value = projectData.budget.total;
}

window.onload = function() {
    loadProject();
    updateProgressBar();
    
    // Event listeners for navigation buttons
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent === 'Next') {
            button.addEventListener('click', nextPage);
        } else if (button.textContent === 'Previous') {
            button.addEventListener('click', prevPage);
        }
    });

    // Event listeners for adding items
    document.getElementById('addFeature').addEventListener('click', () => addItem('features'));
    document.getElementById('addPhase').addEventListener('click', () => addItem('phases'));
    document.getElementById('addDeliverable').addEventListener('click', () => addItem('deliverables'));
    
    // Event listener for adding task
    document.getElementById('addTask').addEventListener('click', addTask);

    // Event listener for adding cost item
    document.getElementById('addCostItem').addEventListener('click', addCostItem);

    // Event listener for adding update
    document.getElementById('addUpdate').addEventListener('click', addUpdate);

    // Event listener for scheduling meeting
    document.getElementById('scheduleMeeting').addEventListener('click', scheduleMeeting);

    // Event listener for total budget input
    document.getElementById('totalBudget').addEventListener('change', function() {
        projectData.budget.total = parseFloat(this.value) || 0;
        updateBudgetInfo();
    });

    // Event listeners for updating project info
    ['projectName', 'projectDescription', 'projectOwner', 'projectManager', 'teamMembers', 'startDate', 'plannedEndDate'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateProjectInfo);
    });
};