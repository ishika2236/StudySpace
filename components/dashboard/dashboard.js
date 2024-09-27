
    document.addEventListener('DOMContentLoaded', function() {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
        let exams = JSON.parse(localStorage.getItem('exams')) || [];
        let currentlyPlayingTask = null;
        let timer = null;

        function updateTaskList() {
            const taskListContainer = document.getElementById('task-list-container');
            taskListContainer.innerHTML = '';
            
            const sortedTasks = tasks
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 4);

            sortedTasks.forEach((task) => {
                const taskElement = document.createElement('div');
                taskElement.className = 'db-task';
                taskElement.innerHTML = `
                    <div class="task-details">
                        <div class="task-name"><h5>${task.title}</h5></div>
                        <div class="task-ref"><a href="">${task.project}</a></div>
                    </div>
                    <div class="task-actions">
                        <button class="task-play-btn" data-task-id="${task.id}">
                            <i class="fas fa-${task.status === 'active' ? 'pause' : 'play'}"></i>
                        </button>
                    </div>
                `;
                taskListContainer.appendChild(taskElement);
            });
            
            document.getElementById('task-count').textContent = tasks.length;

            // Add event listeners to buttons
            addTaskButtonListeners();
        }

        function addTaskButtonListeners() {
            document.querySelectorAll('.task-play-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const taskId = parseInt(this.getAttribute('data-task-id'));
                    toggleTask(taskId);
                });
            });

            document.querySelectorAll('.task-complete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const taskId = parseInt(this.getAttribute('data-task-id'));
                    completeTask(taskId);
                });
            });
        }

        // function toggleTask(taskId) {
        //     const task = tasks.find(t => t.id === taskId);
        //     if (!task) return;

        //     if (currentlyPlayingTask && currentlyPlayingTask.id !== taskId) {
        //         pauseTask(currentlyPlayingTask.id);
        //     }

        //     if (task.status === 'active') {
        //         pauseTask(taskId);
        //     } else {
        //         startTask(taskId);
        //     }

        //     updateTaskList();
        //     updateCurrentTaskDisplay();
        // }

        function startTask(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            task.status = 'active';
            task.startTime = new Date().getTime();
            currentlyPlayingTask = task;

            localStorage.setItem('tasks', JSON.stringify(tasks));
            startTimer();
        }

        function pauseTask(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            task.status = 'inactive';
            task.elapsedTime = (task.elapsedTime || 0) + (new Date().getTime() - (task.startTime || new Date().getTime()));
            task.startTime = null;

            if (currentlyPlayingTask && currentlyPlayingTask.id === taskId) {
                currentlyPlayingTask = null;
                stopTimer();
            }

            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function completeTask(taskId) {
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                if (currentlyPlayingTask && currentlyPlayingTask.id === taskId) {
                    pauseTask(taskId);
                }
                tasks[taskIndex].status = 'done';
                localStorage.setItem('tasks', JSON.stringify(tasks));
                updateTaskList();
                updateCurrentTaskDisplay();
            }
        }


        function startTimer() {
            stopTimer();
            timer = setInterval(updateTimer, 1000);
        }

        function stopTimer() {
            clearInterval(timer);
        }

        function updateTimer() {
            if (currentlyPlayingTask) {
                const elapsedTime = (currentlyPlayingTask.elapsedTime || 0) + 
                    (new Date().getTime() - currentlyPlayingTask.startTime);
                const hours = Math.floor(elapsedTime / 3600000);
                const minutes = Math.floor((elapsedTime % 3600000) / 60000);
                const seconds = Math.floor((elapsedTime % 60000) / 1000);
                document.getElementById('time-elapsed').textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }

        function updateCurrentTaskDisplay() {
            const currentTaskHeading = document.getElementById('current-task-heading');
            const currentTaskProject = document.getElementById('current-task-project');
            const toggleBtn = document.getElementById('toggle-btn');

            if (currentlyPlayingTask) {
                currentTaskHeading.textContent = currentlyPlayingTask.title;
                currentTaskProject.textContent = currentlyPlayingTask.project;
                toggleBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                currentTaskHeading.textContent = 'No task running';
                currentTaskProject.textContent = '';
                toggleBtn.innerHTML = '<i class="fas fa-play"></i>';
                document.getElementById('time-elapsed').textContent = '00:00:00';
            }
        }

        function updateAssignments() {
            const assignmentsContainer = document.getElementById('assignments-container');
            assignmentsContainer.innerHTML = '';
            
            assignments.forEach(assignment => {
                const assignmentElement = document.createElement('div');
                assignmentElement.className = 'item-due';
                assignmentElement.innerHTML = `
                    <h5>${assignment.name}</h5>
                    <p>Due: ${assignment.dueDate}</p>
                `;
                assignmentsContainer.appendChild(assignmentElement);
            });
        }

        function updateExams() {
            const examsContainer = document.getElementById('exams-container');
            examsContainer.innerHTML = '';
            
            exams.forEach(exam => {
                const examElement = document.createElement('div');
                examElement.className = 'item-due';
                examElement.innerHTML = `
                    <h5>${exam.name}</h5>
                    <p>Date: ${exam.date}</p>
                `;
                examsContainer.appendChild(examElement);
            });
        }

        // document.getElementById('toggle-btn').addEventListener('click', function() {
        //     if (currentlyPlayingTask) {
        //         toggleTask(currentlyPlayingTask.id);
        //     } else if (tasks.length > 0) {
        //         toggleTask(tasks[0].id);
        //     }
        // });

        function checkReminders() {
            const now = new Date();
            tasks.forEach(task => {
                if (task.reminder) {
                    const reminderTime = new Date(`${task.dueDate}T${task.time}`);
                    if (now >= reminderTime && now < new Date(reminderTime.getTime() + 60000)) {
                        playAlarm();
                        alert(`Reminder: ${task.title}`);
                    }
                }
            });
        }

        function playAlarm() {
            const audio = new Audio('path/to/your/alarm-sound.mp3');
            audio.play();
        }
        
        
        function updateCourses() {
            const courses = JSON.parse(localStorage.getItem('courses')) || [];
            const coursesContainer = document.getElementById('courses-container');
            coursesContainer.innerHTML = '';
            
            courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.className = 'course-item';
                courseElement.innerHTML = `
                    <h5>${course.name}</h5>
                    <p>${course.instructor}</p>
                `;
                coursesContainer.appendChild(courseElement);
            });
        }
        // document.querySelector('.toggle-btn').addEventListener('click', toggleSidebar);
    

        // Initial setup
        updateTaskList();
        updateAssignments();
        updateExams();
        // updateCurrentTaskDisplay();
        function updateDashboardActivity() {
    // Update Activity Chart
    updateActivityChart();

    // Update Projects Worked
    updateProjectsWorked();

    // Update Reminders
    updateReminders();
    updateCourses()
}

function updateActivityChart() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const today = new Date();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityData = {};

    // Initialize activityData for the past 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        activityData[weekDays[date.getDay()]] = 0;
    }

    // Calculate completed tasks for each day
    tasks.forEach(task => {
        if (task.status === 'done') {
            const taskDate = new Date(task.dueDate);
            const dayName = weekDays[taskDate.getDay()];
            if (activityData.hasOwnProperty(dayName)) {
                activityData[dayName]++;
            }
        }
    });

    // Update the UI
    const activityBars = document.querySelector('.activity-bars');
    activityBars.innerHTML = '';
    Object.entries(activityData).forEach(([day, count]) => {
        const percentage =tasks.length > 0 ? (count / tasks.length) * 100 : 0;
        activityBars.innerHTML += `
            <div class="activity-bar">
                <div class="bar" style="height: ${percentage}%"></div>
                <div class="day">${day}</div>
                <div class="percentage">${percentage.toFixed(0)}%</div>
            </div>
        `;
    });

    // Update overall activity percentage
    const totalCompleted = Object.values(activityData).reduce((sum, count) => sum + count, 0);
    const overallPercentage = tasks.length > 0 ? 100-((totalCompleted / tasks.length) * 100) : 0;
    document.getElementById('activity-percentage').textContent = `${overallPercentage.toFixed(0)}%`;
}

function updateProjectsWorked() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Calculate project progress
    const projectProgress = projects.map(project => {
        const projectTasks = tasks.filter(task => task.project === project.name);
        const completedTasks = projectTasks.filter(task => task.status === 'done');
        const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
        return { name: project.name, progress };
    });

    // Sort projects by progress
    projectProgress.sort((a, b) => b.progress - a.progress);

    // Update the UI for the circular chart
    const projectsCircle = document.querySelector('.projects-circle');
    projectsCircle.innerHTML = `<div class="projects-inner">${projectProgress.length}</div>`;

    // Update the project list with all projects and their completion percentages
    const projectList = document.getElementById('project-breakdown');
    projectList.innerHTML = projectProgress.map(project => `
        <li>
            <span class="project-name">${project.name}</span>
            <div class="project-progress-bar">
                <div class="progress" style="width: ${project.progress.toFixed(0)}%"></div>
            </div>
            <span class="project-progress-percentage">${project.progress.toFixed(0)}%</span>
        </li>
    `).join('');

    // Update overall projects percentage
    const overallProgress = projectProgress.length > 0
        ? projectProgress.reduce((sum, project) => sum + project.progress, 0) / projectProgress.length
        : 0;
    document.getElementById('projects-percentage').textContent = `${overallProgress.toFixed(0)}%`;
}

function updateReminders() {
    const reminders = JSON.parse(localStorage.getItem('tasks')) || [];
    const remindersContainer = document.getElementById('reminders-container');
    remindersContainer.innerHTML = '';

    // Filter and sort reminders
    const upcomingReminders = reminders
        .filter(task => task.reminder && new Date(task.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 3);

    upcomingReminders.forEach(reminder => {
        const reminderElement = document.createElement('div');
        reminderElement.className = 'reminder';
        reminderElement.innerHTML = `
            <div class="reminder-time">${formatTime(reminder.time)}</div>
            <div class="reminder-title">${reminder.title}</div>
            <div class="reminder-priority ${reminder.priority}">${reminder.priority}</div>
        `;
        remindersContainer.appendChild(reminderElement);
    });
}

function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
}

// Call updateDashboardActivity initially and set up interval to update regularly
updateDashboardActivity();

        // Check for reminders every minute
        setInterval(checkReminders, 60000);
    });

    let timer;
    let timeLeft = 1500; // 25 minutes in seconds
    let isRunning = false;
    let currentProgram = { sessions: 5, focusTime: 25, breakTime: 5 };
    let currentSession = 1;
    let isFocusTime = true;

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const sessionType = isFocusTime ? "Focus" : "Break";
        document.getElementById('sessionInfo').textContent = 
            `${sessionType} Session ${currentSession}/${currentProgram.sessions}`;
    }

    function selectProgram(program) {
        const [sessions, focusTime, breakTime] = program.split('-').map(Number);
        currentProgram = { sessions, focusTime, breakTime };
        reset();
        highlightSelectedTile(program);
    }

    function highlightSelectedTile(program) {
        document.querySelectorAll('.program-tile').forEach(tile => {
            tile.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    function toggleCustomInputs() {
        const customInputs = document.getElementById('customProgramInputs');
        customInputs.style.display = customInputs.style.display === 'none' ? 'block' : 'none';
    }

    function setCustomProgram() {
        const sessions = parseInt(document.getElementById('customSessions').value);
        const focusTime = parseInt(document.getElementById('customFocusTime').value);
        const breakTime = parseInt(document.getElementById('customBreakTime').value);
        
        if (sessions > 0 && focusTime > 0 && breakTime > 0) {
            currentProgram = { sessions, focusTime, breakTime };
            reset();
            toggleCustomInputs();
        } else {
            alert('Please enter valid values for all fields.');
        }
    }
   
    function startStop() {
        if (isRunning) {
            clearInterval(timer);
            document.getElementById('startStop').textContent = 'Start';
        } else {
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    if (isFocusTime && currentSession < currentProgram.sessions) {
                        // Switch to break time
                        isFocusTime = false;
                        timeLeft = currentProgram.breakTime * 60;
                    } else if (!isFocusTime && currentSession < currentProgram.sessions) {
                        // Switch to next focus session
                        isFocusTime = true;
                        currentSession++;
                        timeLeft = currentProgram.focusTime * 60;
                    } else {
                        // Program complete
                        clearInterval(timer);
                        alert('Pomodoro program completed!');
                        reset();
                        return;
                    }
                    updateDisplay();
                }
            }, 1000);
            document.getElementById('startStop').textContent = 'Pause';
        }
        isRunning = !isRunning;
    }

    function reset() {
        clearInterval(timer);
        isRunning = false;
        currentSession = 1;
        isFocusTime = true;
        timeLeft = currentProgram.focusTime * 60;
        document.getElementById('startStop').textContent = 'Start';
        updateDisplay();
    }

    updateDisplay();
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
    const mainContent = document.querySelector('.main-right-body');

    sidebar.classList.toggle('hidden');
    mainContent.classList.toggle('expanded');
}
