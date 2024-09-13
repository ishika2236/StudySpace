document.addEventListener('DOMContentLoaded', function() {
    const projectData = JSON.parse(localStorage.getItem('projectData')) || {};
    const analytics = projectData.analytics || {};

    // Set up Chart.js default styles for dark theme
    Chart.defaults.color = '#e0e0e0';
    Chart.defaults.borderColor = '#555';

    // Task Status Pie Chart
    const taskStatusCtx = document.getElementById('taskStatusChart').getContext('2d');
    new Chart(taskStatusCtx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                label: 'Task Status',
                data: analytics.taskStatus || [0, 0, 0],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Task Status Distribution'
                }
            }
        }
    });

    // Task Completion Rate Line Chart
    const taskCompletionCtx = document.getElementById('taskCompletionChart').getContext('2d');
    new Chart(taskCompletionCtx, {
        type: 'line',
        data: {
            labels: projectData.tasks.map(task => task.name),
            datasets: [{
                label: 'Task Completion Rate',
                data: analytics.taskCompletionRate || [],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Task Completion Rate'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Daily Active Tasks
    const dailyActiveTasksCtx = document.getElementById('dailyActiveTasksChart').getContext('2d');
    new Chart(dailyActiveTasksCtx, {
        type: 'bar',
        data: {
            labels: ['Active Tasks'],
            datasets: [{
                label: 'Daily Active Tasks',
                data: [analytics.dailyActiveTasks || 0],
                backgroundColor: '#2196f3'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Daily Active Tasks'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Time Taken per Task Line Chart
    const timePerTaskCtx = document.getElementById('timePerTaskChart').getContext('2d');
    new Chart(timePerTaskCtx, {
        type: 'line',
        data: {
            labels: projectData.tasks.map(task => task.name),
            datasets: [{
                label: 'Time Taken (hours)',
                data: analytics.timePerTask || [],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Time Taken per Task'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Team Utilization Pie Chart
    const teamUtilizationCtx = document.getElementById('teamUtilizationChart').getContext('2d');
    new Chart(teamUtilizationCtx, {
        type: 'pie',
        data: {
            labels: projectData.generalInfo.teamMembers,
            datasets: [{
                label: 'Utilization (%)',
                data: analytics.teamUtilization || [],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#ffeb3b']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Team Utilization'
                }
            }
        }
    });

    // Planned vs Actual Progress Line Chart
    const progressComparisonCtx = document.getElementById('progressComparisonChart').getContext('2d');
    new Chart(progressComparisonCtx, {
        type: 'line',
        data: {
            labels: projectData.tasks.map(task => task.name),
            datasets: [{
                label: 'Planned Progress',
                data: analytics.plannedProgress || [],
                borderColor: '#4caf50',
                fill: false
            }, {
                label: 'Actual Progress',
                data: analytics.actualProgress || [],
                borderColor: '#f44336',
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Planned vs Actual Progress'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Budget Overview Chart
    const budgetOverviewCtx = document.getElementById('budgetOverviewChart').getContext('2d');
    new Chart(budgetOverviewCtx, {
        type: 'bar',
        data: {
            labels: ['Total Budget', 'Budget Used'],
            datasets: [{
                label: 'Budget',
                data: [projectData.budget?.total || 0, projectData.budget?.used || 0],
                backgroundColor: ['#2196f3', '#f44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Budget Overview'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Individual Member Contribution Pie Chart
    const memberContributionCtx = document.getElementById('memberContributionChart').getContext('2d');
    const memberContributions = calculateMemberContributions(projectData);
    new Chart(memberContributionCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(memberContributions),
            datasets: [{
                label: 'Contribution',
                data: Object.values(memberContributions),
                backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#ffeb3b']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Individual Member Contribution'
                }
            }
        }
    });
});

function calculateMemberContributions(projectData) {
    const contributions = {};
    projectData.tasks.forEach(task => {
        if (!contributions[task.responsible]) {
            contributions[task.responsible] = 0;
        }
        contributions[task.responsible] += task.progress;
    });
    return contributions;
}

// Function to update analytics (call this whenever project data changes)
function updateAnalytics() {
    const projectData = JSON.parse(localStorage.getItem('projectData')) || {};
    const analytics = calculateAnalytics(projectData);
    projectData.analytics = analytics;
    localStorage.setItem('projectData', JSON.stringify(projectData));
}

function calculateAnalytics(projectData) {
    const tasks = projectData.tasks || [];
    const teamMembers = projectData.generalInfo.teamMembers || [];

    const taskStatus = [
        tasks.filter(task => task.status === 'Completed').length,
        tasks.filter(task => task.status === 'In Progress').length,
        tasks.filter(task => task.status === 'Not Started').length
    ];

    const taskCompletionRate = tasks.map(task => task.progress);

    const dailyActiveTasks = tasks.filter(task => task.status === 'In Progress').length;

    const timePerTask = tasks.map(task => task.actualDuration);

    const teamUtilization = teamMembers.map(member => {
        const memberTasks = tasks.filter(task => task.responsible === member);
        const totalDuration = memberTasks.reduce((sum, task) => sum + task.actualDuration, 0);
        const totalEstimatedDuration = memberTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
        return (totalDuration / totalEstimatedDuration) * 100 || 0;
    });

    const plannedProgress = tasks.map(task => (task.estimatedDuration / projectData.generalInfo.plannedDuration) * 100);
    const actualProgress = tasks.map(task => (task.actualDuration / projectData.generalInfo.plannedDuration) * 100);

    return {
        taskStatus,
        taskCompletionRate,
        dailyActiveTasks,
        timePerTask,
        teamUtilization,
        plannedProgress,
        actualProgress
    };
}