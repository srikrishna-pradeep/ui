document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content');
    const sliderContent = document.getElementById('sliderContent');

    // Load home content by default
    loadPage('pages/home.html');

    // Handle navigation link clicks
    document.querySelectorAll('.nav-option').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');

            if (page) {
                // Fetch and load the selected page content
                loadPage(page);

                // Update active navigation link styles
                document.querySelectorAll('.nav-option').forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Handle slider button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('slider-btn')) {
            const slide = e.target.getAttribute('data-slide');

            // Update slider button active state
            document.querySelectorAll('.slider-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Load the appropriate slide content
            loadSlide(slide);
        }
    });

    /**
     * Function to dynamically load pages
     * @param {string} page - The URL of the page to load
     */
    function loadPage(page) {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                contentArea.innerHTML = data;
                if (page.endsWith('home.html')) {
                    // Load Slide 1 by default
                    loadSlide('slide1');
                }
            })
            .catch(() => {
                contentArea.innerHTML = '<p>Error loading content. Please try again.</p>';
            });
    }

    /**
     * Function to dynamically load slides from external files
     * @param {string} slide - The identifier for the slide
     */
    function loadSlide(slide) {
        const sliderContent = document.getElementById('sliderContent'); // Fetch the element here
    
        if (!sliderContent) {
            console.error('sliderContent element not found in the DOM!');
            return;
        }
    
        let slideFile = '';
    
        if (slide === 'slide1') {
            slideFile = 'pages/sub-pages/slide1.html';
        } else if (slide === 'slide2') {
            slideFile = 'pages/sub-pages/slide2.html';
        }
    
        if (slideFile) {
            fetch(slideFile)
                .then(response => response.text())
                .then(data => {
                    sliderContent.innerHTML = data;
                })
                .catch(() => {
                    sliderContent.innerHTML = '<p>Error loading slide. Please try again.</p>';
                });
        }
    }    
    

    /**
     * Progress bar functionality for Slide 1
     */
    window.startProgress = function () {
        const statusSection = document.getElementById('statusSection');
        const progressBar = document.getElementById('progressBar');
        const statusText = document.getElementById('statusText');
        let progress = 0;

        statusSection.classList.remove('d-none');

        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                progressBar.textContent = '100%';
                statusText.textContent = 'Completed!';
            }
        }, 300);
    };

    /**
     * Copy to clipboard functionality for Slide 1
     */
    window.copyToClipboard = function () {
        const text = document.getElementById('generatedLink').textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy!');
        });
    };
    
    let currentStep = 1;

    // Proceed to next step
    window.handleNext = function () {
        if (!validateStep(currentStep)) {
            alert("Please complete the current step before proceeding.");
            return;
        }

        const currentStepElement = document.getElementById(`step${currentStep}`);
        const nextStepElement = document.getElementById(`step${currentStep + 1}`);

        if (nextStepElement) {
            currentStepElement.classList.add("d-none");
            nextStepElement.classList.remove("d-none");
            currentStep++;
        }

        toggleButtons();
    };

    // Go back to previous step
    window.handlePrev = function () {
        const currentStepElement = document.getElementById(`step${currentStep}`);
        const prevStepElement = document.getElementById(`step${currentStep - 1}`);

        if (prevStepElement) {
            currentStepElement.classList.add("d-none");
            prevStepElement.classList.remove("d-none");
            currentStep--;
        }

        toggleButtons();
    };

    // Validate current step
    function validateStep(step) {
        switch (step) {
            case 1: // Validate Question Type
                return document.getElementById("questionType").value !== "";
            case 2: // Validate Template Type
                return document.getElementById("templateType").value !== "";
            case 3: // Validate URL
                const urlInput = document.getElementById("urlInput").value;
                return urlInput.match(/https?:\/\/[^\s]+/);
            case 4: // Validate Replication Count
                const replicationCount = document.getElementById("replicationCount").value;
                return replicationCount > 0;
            case 5: // Validate Number of Models
                const numberOfModels = document.getElementById("numberOfModels").value;
                return numberOfModels > 0;
            default:
                return false;
        }
    }

    // Toggle Next/Previous button states
    function toggleButtons() {
        document.getElementById("prevButton").disabled = currentStep === 1;
        const nextButton = document.getElementById("nextButton");

        if (document.getElementById(`step${currentStep + 1}`)) {
            nextButton.textContent = "Next";
        } else {
            nextButton.textContent = "Review";
            nextButton.onclick = showSummary;
        }
    }

    // Show summary modal
    window.showSummary = function () {
        const summaryContent = document.getElementById("summaryContent");
        summaryContent.innerHTML = `
            <p><strong>Question Type:</strong> ${document.getElementById("questionType").value}</p>
            <p><strong>Template Type:</strong> ${document.getElementById("templateType").value}</p>
            <p><strong>URL:</strong> ${document.getElementById("urlInput").value}</p>
            <p><strong>Replication Count:</strong> ${document.getElementById("replicationCount").value}</p>
            <p><strong>Number of Models:</strong> ${document.getElementById("numberOfModels").value}</p>
        `;

        document.getElementById("summaryModal").classList.add("show");
    };

    // Close summary modal
    window.closeModal = function () {
        document.getElementById("summaryModal").classList.remove("show");
    };

    // Submit the form
    window.submitForm = function () {
        alert("Form submitted successfully!");
        closeModal();
        resetForm();
    };

    // Reset form and start over
    function resetForm() {
        document.getElementById("consensusForm").reset();
        currentStep = 1;
        document.querySelectorAll(".step").forEach((step, index) => {
            step.classList.toggle("d-none", index > 0);
        });
        toggleButtons();
    }




    const tasksSection = document.getElementById('tasksSection');
    const errorLogsSection = document.getElementById('errorLogsSection');

    // Mock data for tasks
    const tasks = [
        {
            id: 'task1',
            status: 'Running',
            config: {
                questionType: 'Type A',
                templateType: 'Template 1',
                url: 'https://sheet.example.com/abc',
                replicationCount: 10,
                models: [
                    { columnName: 'col1', modelName: 'model1' },
                    { columnName: 'col2', modelName: 'model2' }
                ]
            },
            logs: [
                'Task started at 10:00 AM',
                'Data fetched at 10:05 AM'
            ],
            error: null
        },
        {
            id: 'task2',
            status: 'Completed',
            config: {
                questionType: 'Type B',
                templateType: 'Template 2',
                url: 'https://sheet.example.com/def',
                replicationCount: 5,
                models: [
                    { columnName: 'colA', modelName: 'modelA' }
                ]
            },
            logs: [
                'Task started at 11:00 AM',
                'Data fetched at 11:05 AM',
                'Task completed at 11:10 AM'
            ],
            error: null
        },
        {
            id: 'task3',
            status: 'Failed',
            config: {
                questionType: 'Type C',
                templateType: 'Template 3',
                url: 'https://sheet.example.com/xyz',
                replicationCount: 3,
                models: []
            },
            logs: [
                'Task started at 12:00 PM',
                'Error encountered during processing'
            ],
            error: 'Data processing failed due to invalid configuration.'
        }
    ];

    // Render tasks dynamically
    function renderTasks() {
        tasksSection.innerHTML = '';
        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'col-md-6 task-card';
            card.innerHTML = `
                <div class="task-header">
                    <div>
                        <strong>Task ID:</strong> ${task.id}<br>
                        <strong>Status:</strong> ${task.status}
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-details" data-task="${task.id}">View Details</button>
                        ${task.status === 'Completed' ? `<button class="btn btn-success btn-sm">Download Results</button>` : ''}
                    </div>
                </div>
                <div class="task-details" id="details-${task.id}">
                    <h5>Logs</h5>
                    <ul>
                        ${task.logs.map(log => `<li>${log}</li>`).join('')}
                    </ul>
                    <h5>Configuration</h5>
                    <ul>
                        <li><strong>Question Type:</strong> ${task.config.questionType}</li>
                        <li><strong>Template Type:</strong> ${task.config.templateType}</li>
                        <li><strong>URL:</strong> ${task.config.url}</li>
                        <li><strong>Replication Count:</strong> ${task.config.replicationCount}</li>
                        <li><strong>Models:</strong>
                            <ul>
                                ${task.config.models.map(model => `<li>${model.columnName} - ${model.modelName}</li>`).join('')}
                            </ul>
                        </li>
                    </ul>
                    ${task.error ? `<h5 class="error-log">Error</h5><p>${task.error}</p>` : ''}
                </div>
            `;
            tasksSection.appendChild(card);
        });
    }

    // Render error logs dynamically
    function renderErrorLogs() {
        errorLogsSection.innerHTML = '';
        tasks
            .filter(task => task.error)
            .forEach(task => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${task.id}</td>
                    <td>${task.error}</td>
                `;
                errorLogsSection.appendChild(row);
            });
    }

    // Handle view details toggle
    tasksSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details')) {
            const taskId = e.target.getAttribute('data-task');
            const details = document.getElementById(`details-${taskId}`);
            details.classList.toggle('visible');
        }
    });

    // Initial rendering
    renderTasks();
    renderErrorLogs();
});

