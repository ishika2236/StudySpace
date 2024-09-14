// Global variables
let currentProjectId = null;
let projects = [];

document.addEventListener('DOMContentLoaded', function() {
    updateSidebar();
    loadProjects();
    setupEventListeners();
});

function updateSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <button onclick="goToDashboard()">Go to Dashboard</button>
        <button onclick="viewAllAnalytics()">View All Analytics</button>
    `;
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function viewAllAnalytics() {
    loadAnalytics();
}

function setupEventListeners() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    const streamButton = document.getElementById('stream-button');
    streamButton.addEventListener('click', function() {
        alert('Stream functionality not implemented yet.');
    });
}

function loadProjects() {
    projects = JSON.parse(localStorage.getItem('projects')) || [];
    const urlParams = new URLSearchParams(window.location.search);
    currentProjectId = urlParams.get('projectId');

    setupProjectSelector();
    loadAnalytics();
}

function setupProjectSelector() {
    const selector = document.getElementById('project-selector');
    selector.innerHTML = '<select id="project-select"><option value="all">All Projects</option></select>';
    const select = document.getElementById('project-select');

    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    });

    if (currentProjectId) {
        select.value = currentProjectId;
    }

    select.addEventListener('change', function() {
        currentProjectId = this.value === 'all' ? null : this.value;
        loadAnalytics();
    });
}

function loadAnalytics() {
    if (currentProjectId) {
        const project = projects.find(p => p.id.toString() === currentProjectId);
        if (project) {
            document.getElementById('analytics-title').textContent = `Analytics for ${project.name}`;
            displayProjectAnalytics(project);
        } else {
            alert('Project not found');
        }
    } else {
        document.getElementById('analytics-title').textContent = 'Analytics for All Projects';
        displayAllProjectsAnalytics();
    }
}

function displayProjectAnalytics(project) {
    displayTaskStatusChart(project);
    displayTaskCompletionChart(project);
    displayBudgetOverviewChart(project);
    displayTeamUtilizationChart(project);
    displayTimelineAdherenceChart(project);
    displayRiskAssessmentChart(project);
}

function displayAllProjectsAnalytics() {
    displayOverallTaskStatusChart();
    displayOverallTaskCompletionChart();
    displayOverallBudgetChart();
    displayOverallTeamUtilizationChart();
    displayOverallTimelineAdherenceChart();
    displayOverallRiskAssessmentChart();
}

// Individual chart functions (implementation provided earlier)

// Overall analytics functions
function displayOverallTaskStatusChart() {
    const ctx = document.getElementById('overallTaskStatusChart').getContext('2d');
    const statusCounts = projects.reduce((acc, project) => {
        acc.completed += project.tasks.filter(t => t.status === 'Completed').length;
        acc.inProgress += project.tasks.filter(t => t.status === 'In Progress').length;
        acc.notStarted += project.tasks.filter(t => t.status === 'Not Started').length;
        return acc;
    }, { completed: 0, inProgress: 0, notStarted: 0 });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [statusCounts.completed, statusCounts.inProgress, statusCounts.notStarted],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Overall Task Status Distribution'
            }
        }
    });
}

function displayOverallTaskCompletionChart() {
    const ctx = document.getElementById('overallTaskCompletionChart').getContext('2d');
    const projectNames = projects.map(p => p.name);
    const projectProgress = projects.map(p => {
        const totalTasks = p.tasks.length;
        const completedTasks = p.tasks.filter(t => t.status === 'Completed').length;
        return (completedTasks / totalTasks) * 100 || 0;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: projectNames,
            datasets: [{
                label: 'Project Completion (%)',
                data: projectProgress,
                backgroundColor: '#2196f3'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Overall Project Completion Progress'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function displayOverallBudgetChart() {
    const ctx = document.getElementById('overallBudgetChart').getContext('2d');
    const totalBudget = projects.reduce((sum, p) => sum + p.budget.total, 0);
    const usedBudget = projects.reduce((sum, p) => sum + p.budget.used, 0);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Used Budget', 'Remaining Budget'],
            datasets: [{
                data: [usedBudget, totalBudget - usedBudget],
                backgroundColor: ['#f44336', '#4caf50']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Overall Budget Overview'
            }
        }
    });
}

function displayOverallTeamUtilizationChart() {
    const ctx = document.getElementById('overallTeamUtilizationChart').getContext('2d');
    const allMembers = new Set(projects.flatMap(p => p.generalInfo.teamMembers));
    const memberUtilization = Array.from(allMembers).map(member => {
        const memberTasks = projects.flatMap(p => p.tasks.filter(t => t.responsible === member));
        return {
            name: member,
            utilization: memberTasks.reduce((sum, task) => sum + task.progress, 0) / memberTasks.length || 0
        };
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: memberUtilization.map(m => m.name),
            datasets: [{
                label: 'Utilization (%)',
                data: memberUtilization.map(m => m.utilization),
                backgroundColor: '#9c27b0'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Overall Team Utilization'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function displayOverallTimelineAdherenceChart() {
    const ctx = document.getElementById('overallTimelineAdherenceChart').getContext('2d');
    const projectNames = projects.map(p => p.name);
    const plannedDuration = projects.map(p => p.tasks.reduce((sum, t) => sum + t.estimatedDuration, 0));
    const actualDuration = projects.map(p => p.tasks.reduce((sum, t) => sum + t.actualDuration, 0));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: projectNames,
            datasets: [
                {
                    label: 'Planned Duration',
                    data: plannedDuration,
                    backgroundColor: '#2196f3'
                },
                {
                    label: 'Actual Duration',
                    data: actualDuration,
                    backgroundColor: '#f44336'
                }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Overall Timeline Adherence'
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayOverallRiskAssessmentChart() {
    const ctx = document.getElementById('overallRiskAssessmentChart').getContext('2d');
    const riskCategories = ['Schedule Risk', 'Budget Risk', 'Scope Risk', 'Resource Risk'];
    const averageRiskLevels = riskCategories.map(category => {
        const risks = projects.map(p => {
            switch(category) {
                case 'Schedule Risk': return calculateScheduleRisk(p);
                case 'Budget Risk': return calculateBudgetRisk(p);
                case 'Scope Risk': return calculateScopeRisk(p);
                case 'Resource Risk': return calculateResourceRisk(p);
            }
        });
        return risks.reduce((sum, risk) => sum + risk, 0) / risks.length;
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: riskCategories,
            datasets: [{
                label: 'Average Risk Level',
                data: averageRiskLevels,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Overall Risk Assessment'
            },
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}