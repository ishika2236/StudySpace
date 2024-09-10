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