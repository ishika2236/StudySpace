let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [];

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const columns = ['To Do', 'In Progress', 'Done'];
    
    columns.forEach(status => {
        const column = document.createElement('div');
        column.className = 'column';
        column.innerHTML = `<h2>${status}</h2>`;
        column.dataset.status = status.toLowerCase().replace(' ', '-');
        
        const tasksInColumn = tasks.filter(task => 
            task.status &&
            task.status.toLowerCase().replace(' ', '-') === status.toLowerCase().replace(' ', '-')
        );
        tasksInColumn.forEach(task => {
            const taskElement = createTaskElement(task);
            column.appendChild(taskElement);
        });
        
        board.appendChild(column);
    });
    
    setupDragAndDrop();
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task priority-${task.priority}`;
    taskElement.draggable = true;
    taskElement.dataset.id = task.id;
    taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Project: ${task.project}</p>
        <p>Due: ${task.dueDate} ${task.time}</p> <!-- Display deadline -->
        <button class="delete-task" data-id="${task.id}">Delete</button>
    `;
    taskElement.querySelector('.delete-task').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    return taskElement;
}
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderBoard();
}

function setupDragAndDrop() {
    const taskElements = document.querySelectorAll('.task');
    const columns = document.querySelectorAll('.column');

    taskElements.forEach(task => {
        task.addEventListener('dragstart', dragStart);
        task.addEventListener('dragend', dragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('drop', drop);
    });
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    setTimeout(() => (e.target.style.opacity = '0.5'), 0);
}

function dragEnd(e) {
    e.target.style.opacity = '1';
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
    
    if (taskElement) {
        const newColumn = e.target.closest('.column');
        if (newColumn) {
            newColumn.appendChild(taskElement);
            updateTaskStatus(taskId, newColumn.dataset.status);
        }
    }
}

function updateTaskStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function openModal() {
    document.getElementById('taskModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTask = {
        id: Date.now().toString(),
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        status: formData.get('status') || 'to-do',
        // assignee: formData.get('assignee'),
        project: formData.get('project'),
        dueDate: formData.get('dueDate'),  // Capture the due date
        time: formData.get('time'),        // Capture the time
    };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderBoard();
    closeModal();
    e.target.reset();
});

function applyFilters() {
    const priorityFilter = document.getElementById('priorityFilter').value;
    const projectFilter = document.getElementById('projectFilter').value;
    
    const filteredTasks = tasks.filter(task => 
        (!priorityFilter || task.priority === priorityFilter) &&
        (!projectFilter || task.project === projectFilter)
    );
    
    renderFilteredTasks(filteredTasks);
}

function renderFilteredTasks(filteredTasks) {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const columns = ['To Do', 'In Progress', 'Done'];
    
    columns.forEach(status => {
        const column = document.createElement('div');
        column.className = 'column';
        column.innerHTML = `<h2>${status}</h2>`;
        column.dataset.status = status.toLowerCase().replace(' ', '-');
        
        const tasksInColumn = filteredTasks.filter(task => 
            task.status &&
            task.status.toLowerCase().replace(' ', '-') === status.toLowerCase().replace(' ', '-')
        );
        tasksInColumn.forEach(task => {
            const taskElement = createTaskElement(task);
            column.appendChild(taskElement);
        });
        
        board.appendChild(column);
    });
    
    setupDragAndDrop();
}

function populateProjectOptions() {
    const projectSelects = document.querySelectorAll('#projectFilter, #taskProject');
    projectSelects.forEach(select => {
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.name;
            option.textContent = project.name;
            select.appendChild(option);
        });
    });
}

// Initialize the board
renderBoard();
populateProjectOptions();

// Add event listeners for filters
document.getElementById('priorityFilter').addEventListener('change', applyFilters);
document.getElementById('projectFilter').addEventListener('change', applyFilters);
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
    const mainContent = document.querySelector('.main-right-body');

    sidebar.classList.toggle('hidden');
    mainContent.classList.toggle('expanded');
}