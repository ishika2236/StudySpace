// calendar.js

// Get references to the necessary elements
const calendarContainer = document.getElementById('calendar');
const viewSelector = document.querySelector('.view-selector');
const createTaskButton = document.querySelector('.header-actions .create-task');
const createMeetingButton = document.querySelector('.header-actions .create-meeting');
const createTaskForm = document.getElementById('createTaskForm');
const createTaskInput = createTaskForm.querySelector('input[name="task"]');
const createTaskTypeInput = createTaskForm.querySelector('select[name="taskType"]');
const createTaskSubmitButton = createTaskForm.querySelector('button[type="submit"]');
const createTaskCloseButton = createTaskForm.querySelector('.close');

let currentView = 'monthly';
let currentDate = new Date();

// Function to change the calendar view
function changeView(view) {
  currentView = view;
  renderCalendar();
}

const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
// const createMeetingButton = document.querySelector('.create-meeting');

prevButton.addEventListener('click', () => {
  navigate(-1);
});

nextButton.addEventListener('click', () => {
  navigate(1);
});

function navigate(offset) {
  switch (currentView) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + offset);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + offset * 7);
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + offset);
      break;
    default:
      currentDate.setMonth(currentDate.getMonth() + offset);
  }
  renderCalendar();
}
// Function to render the calendar based on the current view
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

  getHeaderText() ;
}

// Function to render the daily view
function renderDailyView() {
  // Implement the logic to render the daily view
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = document.createElement('div');
    timeSlot.className = 'time-slot';
    timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
    calendarContainer.appendChild(timeSlot);

    // Add tasks for the current hour
    const tasks = getTasksForDate(currentDate, hour);
    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      timeSlot.appendChild(taskElement);
    });
  }

  updateCurrentTimeIndicator();
}

// Function to render the weekly view
function renderWeeklyView() {
  // Implement the logic to render the weekly view
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  for (let i = 0; i < 7; i++) {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'calendar-cell';
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + i);
    dayColumn.innerHTML = `<strong>${currentDay.toLocaleDateString('default', { weekday: 'short', month: 'numeric', day: 'numeric' })}</strong>`;
    calendarContainer.appendChild(dayColumn);

    const tasks = getTasksForDate(currentDay);
    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      dayColumn.appendChild(taskElement);
    });
  }
}

// Function to render the monthly view
function renderMonthlyView() {
  // Implement the logic to render the monthly view
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  for (let i = 0; i < 7; i++) {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-cell';
    dayHeader.innerHTML = `<strong>${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</strong>`;
    calendarContainer.appendChild(dayHeader);
  }

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-cell';
    calendarContainer.appendChild(emptyCell);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    cell.innerHTML = `<strong>${i}</strong>`;
    calendarContainer.appendChild(cell);

    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const tasks = getTasksForDate(cellDate);
    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      cell.appendChild(taskElement);
    });
  }
}

// Function to render the yearly view
function renderYearlyView() {
  // Implement the logic to render the yearly view
  for (let month = 0; month < 12; month++) {
    const monthCell = document.createElement('div');
    monthCell.className = 'yearly-month';
    const monthDate = new Date(currentDate.getFullYear(), month, 1);
    monthCell.textContent = monthDate.toLocaleDateString('default', { month: 'long' });
    calendarContainer.appendChild(monthCell);
  }
}
function getHeaderText() {
  const options = { year: 'numeric', month: 'long' };
  switch (currentView) {
    case 'daily':
      return `Daily View - ${currentDate.toLocaleDateString('default', { ...options, day: 'numeric' })}`;
    case 'weekly':
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `Weekly View - ${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', options)}`;
    case 'monthly':
      return `Monthly View - ${currentDate.toLocaleDateString('default', options)}`;
    case 'yearly':
      return `Yearly View - ${currentDate.getFullYear()}`;
  }
}
// Function to handle creating a new task
function createTask() {
  const taskName = createTaskInput.value.trim();
  const taskType = createTaskTypeInput.value;

  if (taskName) {
    // Save the task to local storage or your preferred data storage
    saveTask(taskName, taskType);
    closeModal('createTaskForm');
    renderCalendar();
  }
}

// Function to save a task
function saveTask(name, type) {
  // Implement the logic to save the task to local storage or your preferred data storage
  const storedData = JSON.parse(localStorage.getItem('projectData')) || {};
  if (!storedData.tasks) storedData.tasks = [];
  storedData.tasks.push({ name, type, done: false });
  localStorage.setItem('projectData', JSON.stringify(storedData));
}

// Function to create a task element
function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.className = `task task-${task.type} ${task.done ? 'done' : ''}`;
  taskElement.textContent = task.name;

  const deadline = new Date(task.deadline);
  const deadlineSpan = document.createElement('span');
  deadlineSpan.className = 'task-deadline';
  deadlineSpan.textContent = ` (${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  taskElement.appendChild(deadlineSpan);

  return taskElement;
}

// Function to get tasks for a given date (and hour if specified)
function getTasksForDate(date, hour = null) {
  const storedData = JSON.parse(localStorage.getItem('projectData')) || {};
  const tasks = storedData.tasks || [];

  return tasks.filter(item => {
    const itemDate = new Date(item.deadline);
    if (hour !== null) {
      return itemDate.toDateString() === date.toDateString() && itemDate.getHours() === hour;
    }
    return itemDate.toDateString() === date.toDateString();
  });
}

// Function to update the current time indicator
function updateCurrentTimeIndicator() {
  if (currentView === 'daily') {
    const now = new Date();
    if (now.toDateString() === currentDate.toDateString()) {
      const timeSlots = document.querySelectorAll('.time-slot');
      timeSlots.forEach((slot, index) => {
        if (now.getHours() === index) {
          const indicator = document.createElement('div');
          indicator.className = 'current-time-indicator';
          indicator.style.top = `${(now.getMinutes() / 60) * 100}%`;
          slot.appendChild(indicator);
        }
      });
    }
  }
}

// Function to close a modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Event listeners
viewSelector.addEventListener('click', (event) => {
  if (event.target.matches('.view-selector button')) {
    const view = event.target.textContent.toLowerCase();
    changeView(view);
  }
});

createTaskButton.addEventListener('click', () => {
  createTaskForm.style.display = 'block';
});

createTaskCloseButton.addEventListener('click', () => {
  closeModal('createTaskForm');
});

createTaskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  createTask();
});

// Initial render
renderCalendar();
