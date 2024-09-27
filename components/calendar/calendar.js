// Get references to the necessary elements
const calendarContainer = document.getElementById('calendar');
const viewSelector = document.querySelector('.view-selector');
const createTaskButton = document.querySelector('.header-actions .create-task');
const createTaskForm = document.getElementById('createTaskForm');
const taskForm = document.getElementById('taskForm');
const taskNameInput = document.getElementById('taskName');
const taskTypeInput = document.getElementById('taskType');
const taskItemInput = document.getElementById('taskItem');
const taskDateInput = document.getElementById('taskDate');
const taskTimeInput = document.getElementById('taskTime');
const createTaskCloseButton = document.querySelector('#createTaskForm .close');

let currentView = 'monthly';
let currentDate = new Date();

// Initialize Calendar
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});

// View Selection
viewSelector.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        changeView(event.target.textContent.toLowerCase());
    }
});

function changeView(view) {
    currentView = view;
    renderCalendar();
}

// Navigation Buttons
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');

prevButton.addEventListener('click', () => navigate(-1));
nextButton.addEventListener('click', () => navigate(1));

function navigate(offset) {
    switch (currentView) {
        case 'daily':
            currentDate.setDate(currentDate.getDate() + offset);
            break;
        case 'weekly':
            currentDate.setDate(currentDate.getDate() + offset * 7);
            break;
        case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + offset);
            break;
        case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + offset);
            break;
    }
    renderCalendar();
}

function renderCalendar() {
    calendarContainer.innerHTML = '';

    switch (currentView) {
        case 'daily':
            renderDailyView();
            break;
        case 'weekly':
            renderWeeklyView();
            break;
        case 'monthly':
            renderMonthlyView();
            break;
        case 'yearly':
            renderYearlyView();
            break;
    }

    getHeaderText();
}
function renderDailyView() {
  const today = new Date();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  const dailyContainer = document.createElement('div');
  dailyContainer.className = 'daily-view';

  // Example of creating time slots (assuming hourly slots)
  for (let hour = 0; hour < 24; hour++) {
      const timeSlot = document.createElement('div');
      timeSlot.className = 'time-slot';
      timeSlot.innerHTML = `<span>${hour}:00</span>`;

      // Create a placeholder for tasks
      const tasksContainer = document.createElement('div');
      tasksContainer.className = 'tasks-container';
      timeSlot.appendChild(tasksContainer);

      dailyContainer.appendChild(timeSlot);
  }

  // Add the daily view to the calendar container
  calendarContainer.appendChild(dailyContainer);

  // Add the current time indicator
  const indicator = document.createElement('div');
  indicator.className = 'current-time-indicator';
  dailyContainer.appendChild(indicator);

  // Update the position of the current time indicator after the view is rendered
  setTimeout(() => {
      const timeSlots = document.querySelectorAll('.daily-view .time-slot');
      if (timeSlots.length > 0) {
          const slotHeight = timeSlots[0].offsetHeight; // Height of one time slot
          const topOffset = currentHour * slotHeight + (currentMinute / 60) * slotHeight;
          indicator.style.top = `${topOffset}px`;
      }
  }, 0);

  // Render tasks
  renderTasksInDailyView();
}

function renderTasksInDailyView() {
  const tasks = getTasksForDate(new Date()); // Replace with the actual date
  const timeSlots = document.querySelectorAll('.daily-view .time-slot');

  tasks.forEach(task => {
      const taskTime = new Date(task.date); // Assuming task.date is a Date object or ISO string
      const taskHour = taskTime.getHours();
      const taskMinute = taskTime.getMinutes();

      // Find the time slot for the task
      const timeSlot = timeSlots[taskHour];

      if (timeSlot) {
          const taskElement = createTaskElement(task);
          // Set task position based on minute
          taskElement.style.marginTop = `${(taskMinute / 60) * timeSlot.offsetHeight}px`;
          timeSlot.querySelector('.tasks-container').appendChild(taskElement);
      }
  });
}

function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task';
  taskElement.textContent = task.name; // Adjust according to your task object structure
  return taskElement;
}




function renderWeeklyView() {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());

    const weekContainer = document.createElement('div');
    weekContainer.className = 'weekly-view';

    for (let i = 0; i < 7; i++) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        dayColumn.innerHTML = `<strong>${currentDay.toLocaleDateString('default', { weekday: 'short', month: 'numeric', day: 'numeric' })}</strong>`;
        weekContainer.appendChild(dayColumn);

        const tasks = getTasksForDate(currentDay);
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            dayColumn.appendChild(taskElement);
        });
    }

    calendarContainer.appendChild(weekContainer);
}

function renderMonthlyView() {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthContainer = document.createElement('div');
    monthContainer.className = 'monthly-view';

    // Header Row for Days
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.className = 'header-cell';
        headerCell.textContent = day;
        headerRow.appendChild(headerCell);
    });
    monthContainer.appendChild(headerRow);

    // Empty Cells before the start of the month
    const emptyCells = Array.from({ length: firstDay }, () => {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell';
        return emptyCell;
    });

    // Days of the Month
    const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.innerHTML = `<strong>${i + 1}</strong>`;
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
        const tasks = getTasksForDate(cellDate);
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            cell.appendChild(taskElement);
        });
        return cell;
    });

    // Combine empty cells and day cells
    const allCells = emptyCells.concat(dayCells);

    allCells.forEach(cell => monthContainer.appendChild(cell));

    calendarContainer.appendChild(monthContainer);
}

function renderYearlyView() {
    const yearContainer = document.createElement('div');
    yearContainer.className = 'yearly-view';

    for (let month = 0; month < 12; month++) {
        const monthCell = document.createElement('div');
        monthCell.className = 'yearly-month';
        const monthDate = new Date(currentDate.getFullYear(), month, 1);
        monthCell.textContent = monthDate.toLocaleDateString('default', { month: 'long' });
        yearContainer.appendChild(monthCell);
    }

    calendarContainer.appendChild(yearContainer);
}

function getHeaderText() {
    const headerTextElement = document.querySelector('.header-text');
    const options = { year: 'numeric', month: 'long' };

    let headerText;
    switch (currentView) {
        case 'daily':
            headerText = ` ${currentDate.toLocaleDateString('default', { ...options, day: 'numeric' })}`;
            break;
        case 'weekly':
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            headerText = ` ${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', { month: 'short', day: 'numeric' })}`;
            break;
        case 'monthly':
            headerText = ` ${currentDate.toLocaleDateString('default', options)}`;
            break;
        case 'yearly':
            headerText = ` ${currentDate.getFullYear()}`;
            break;
    }

    headerTextElement.textContent = headerText;
}


function getTasksForDate(date) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === date.toDateString();
    });
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task priority-${task.priority}`;
    taskElement.innerHTML = `
        <span>${task.title}</span>
        <span>${task.time}</span>
    `;
    return taskElement;
}

// Show the form when "Create Task" button is clicked
createTaskButton.addEventListener('click', () => {
    createTaskForm.style.display = 'block';
});

// Hide the form when the "Close" button is clicked
createTaskCloseButton.addEventListener('click', () => {
    createTaskForm.style.display = 'none';
});

// Handle form submission
taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const task = {
        id: Date.now().toString(),
        title: taskNameInput.value,
        type: taskTypeInput.value,
        item: taskItemInput.value,
        dueDate: taskDateInput.value,
        time: taskTimeInput.value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        status: 'To Do',
        assignee: document.getElementById('taskAssignee').value,
        project: document.getElementById('taskProject').value,
        reminder: document.getElementById('taskReminder').checked
    };

    // Save task to local storage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Clear the form
    taskForm.reset();

    // Hide the form
    createTaskForm.style.display = 'none';

    // Re-render the calendar
    renderCalendar();
});

// Add delete functionality
function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderCalendar();
}

// Modify createTaskElement function
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task priority-${task.priority}`;
    taskElement.innerHTML = `
        <span>${task.title}</span>
    `;
    
    return taskElement;
}

// Update task items based on selected type
taskTypeInput.addEventListener('change', () => {
    const type = taskTypeInput.value;
    taskItemInput.innerHTML = '<option value="">Select Item</option>';

    const storedData = JSON.parse(localStorage.getItem('projects')) || {};
    const items = storedData[type] || [];
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        taskItemInput.appendChild(option);
    });
});

// Initial render
renderCalendar();
