const tasksArray = []; // To store all tasks for later use

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
        } else if (slide === 'slide3') {
            slideFile = 'pages/sub-pages/slide3.html';
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
    const storedEntries = new Map(); // To prevent duplicate entries
    


    // Handle Next Step
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

        if (currentStep === 2) getTemplateTypes();

        if (currentStep === 7) generateModelFields();

        toggleButtons();
    };

    // Go back to the previous step
    window.handlePrev = function () {
        const currentStepElement = document.getElementById(`step${currentStep}`);
        const prevStepElement = document.getElementById(`step${currentStep - 1}`);

        if (prevStepElement) {
            currentStepElement.classList.add("d-none");
            prevStepElement.classList.remove("d-none");
            currentStep--;
        }

        // Fetch template types dynamically at Step 2
        if (currentStep === 2) getTemplateTypes();

        // Generate dynamic model fields at Step 8
        if (currentStep === 8) generateModelFields();

        // Show additional information only for Translation Evals at Step 9
        if (currentStep === 9) showAdditionalInfo();

        toggleButtons();
    };

    
    // Validate Current Step
    function validateStep(step) {
        switch (step) {
            case 1:
                return document.getElementById("questionType").value !== "";
            case 2:
                return document.getElementById("templateType").value !== "";
            case 3:
                const url = document.getElementById("urlInput").value;
                return url.match(/https?:\/\/[^\s]+/);
            case 4:
                return document.getElementById("replicationCount").value > 0;
            case 5:
                const customLang = document.getElementById("customLanguageCode");
                if (document.querySelector('input[name="languageCode"]:checked').value === "other") {
                    return customLang.value.trim() !== "";
                }
                return true;
            case 6:
                return !!document.querySelector('input[name="matchingColumn"]:checked');
            case 7:
                return document.getElementById("numberOfModels").value > 0;
            case 9:
                const questionType = document.getElementById("questionType").value;
                if (questionType === "Translation Evals") {
                    return document.getElementById("additionalInfo").value.trim() !== "";
                }
                return true;
            default:
                return true;
        }
    }

    // Map of Question Types to Template Types
    const templateOptions = new Map([
        ["Cloud Evals", ["CE Type 1", "CE Type 2", "CE Type 3", "CE Type 4", "CE Type 5"]],
        ["Quality Evals", ["QA Type 1", "QA Type 2", "QA Type 3"]],
        ["Human Evals", ["HE Type 1"]],
        ["Cloud AI Harm Evals", ["CAHE Type 1"]],
        ["Safety Evals", ["SE Type 1", "SE Type 2"]],
        ["Translation Evals", ["TE Type 1"]],
        ["Cultural Evals", ["CUE Type 1"]],
    ]);

    // Handle Question Type change
    function getTemplateTypes() {
        const selectedQuestionType = document.getElementById("questionType").value;
        const templateTypeDropdown = document.getElementById("templateType");

        // Clear existing options
        templateTypeDropdown.innerHTML = '<option value="" disabled selected>Select a template...</option>';

        // Populate new options if valid Question Type is selected
        if (templateOptions.has(selectedQuestionType)) {
            const templates = templateOptions.get(selectedQuestionType);
            templates.forEach(template => {
                const option = document.createElement("option");
                option.value = template;
                option.textContent = template;
                templateTypeDropdown.appendChild(option);
            });
        }
    };

    // Generate model fields dynamically at Step 8
    function generateModelFields() {
        handleNext()
        const numberOfModels = document.getElementById("numberOfModels").value;
        const modelsWrapper = document.getElementById("modelsWrapper");
        modelsWrapper.innerHTML = ""; // Clear existing fields

        console.log("Number of Models " + numberOfModels);
        for (let i = 1; i <= numberOfModels; i++) {
            const modelFieldSet = `
                <div class="form-group">
                    <label>Model ${i} Column Name</label>
                    <input type="text" class="form-control" id="model${i}ColumnName" placeholder="Enter column name">
                    <label>Model ${i} Name</label>
                    <input type="text" class="form-control" id="model${i}Name" placeholder="Enter model name">
                </div>
            `;
            modelsWrapper.insertAdjacentHTML("beforeend", modelFieldSet);
        }
    }

    // Show additional info only for Translation Evals
    function showAdditionalInfo() {
        const questionType = document.getElementById("questionType").value;
        const additionalInfoStep = document.getElementById("step9");

        if (questionType === "Translation Evals") {
            additionalInfoStep.classList.remove("d-none");
        }
    }

    // Add event listeners to language code radio buttons
    document.querySelectorAll('input[name="languageCode"]').forEach(radio => {
        radio.addEventListener("change", function () {
            const customLanguageCodeInput = document.getElementById("customLanguageCode");

            // Show or hide the customLanguageCode input based on the selected radio button
            console.log(this.value);
            if (this.value === "other") {
                customLanguageCodeInput.classList.remove("d-none");
            } else {
                customLanguageCodeInput.classList.add("d-none");
                customLanguageCodeInput.value = ""; // Clear the input value when hidden
            }
        });
    });


    // Toggle buttons (Next/Previous)
    function toggleButtons() {
        document.getElementById("prevButton").disabled = currentStep === 1;
        const nextButton = document.getElementById("nextButton");

        if(currentStep === 7){
            nextButton.textContent = "Generate Field";
            nextButton.onclick = generateModelFields;
        }else if (currentStep === 9) {
            nextButton.textContent = "Review";
            nextButton.onclick = showSummary;
        } else {
            nextButton.textContent = "Next";
            nextButton.onclick = handleNext;
        }
    }


    // Show Summary Modal
    window.showSummary = function () {
        const summaryContent = document.getElementById("summaryContent");

        let modelsSummary = "";
        const numberOfModels = document.getElementById("numberOfModels").value;
        for (let i = 1; i <= numberOfModels; i++) {
            const columnName = document.getElementById(`model${i}ColumnName`).value;
            const modelName = document.getElementById(`model${i}Name`).value;
            modelsSummary += `<p>Model ${i}: ${columnName} - ${modelName}</p>`;
        }

        summaryContent.innerHTML = `
            <p><strong>Question Type:</strong> ${document.getElementById("questionType").value}</p>
            <p><strong>Template Type:</strong> ${document.getElementById("templateType").value}</p>
            <p><strong>Google Sheet URL:</strong> ${document.getElementById("urlInput").value}</p>
            <p><strong>Replication Count:</strong> ${document.getElementById("replicationCount").value}</p>
            <p><strong>Language Code:</strong> ${document.querySelector('input[name="languageCode"]:checked').value}</p>
            <p><strong>Matching Column:</strong> ${document.querySelector('input[name="matchingColumn"]:checked').value}</p>
            <p><strong>Number of Models:</strong> ${numberOfModels}</p>
            ${modelsSummary}
            <p><strong>Additional Info:</strong> ${document.getElementById("additionalInfo").value}</p>
        `;

        document.getElementById("summaryModal").classList.add("show");
    };


    // Extract Google Sheet ID from URL
    function extractGoogleSheetId(url) {
        const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
        const match = url.match(regex);
        return match ? match[1] : null; // Return the ID if matched, otherwise null
    }

    // Submit Form
    window.submitForm = function () {
        const url = document.getElementById("urlInput").value;
        const sheetId = extractGoogleSheetId(url);

        if (!sheetId) {
            alert("Invalid Google Sheet URL. Please provide a valid URL.");
            return;
        }

        if (storedEntries.has(sheetId)) {
            alert("Duplicate entry. This sheet ID is already submitted.");
            return;
        }

        // Create the task object
        const task = {
            sheetId,
            questionType: document.getElementById("questionType").value,
            templateType: document.getElementById("templateType").value,
            languageCode: document.querySelector('input[name="languageCode"]:checked').value,
            matchingColumn: document.querySelector('input[name="matchingColumn"]:checked').value,
            additionalInfo: document.getElementById("additionalInfo").value,
            url, // Keep the full URL for reference
        };

        // Store task in the Map (to prevent duplicates)
        storedEntries.set(sheetId, task);

        // Add the task to the tasks array
        tasksArray.push(task);

        alert("Form submitted successfully!");
        console.log("Tasks Array:", tasksArray); // Debugging output to verify the tasks array
        closeModal();
        resetForm();
    };

    // Close the modal
    window.closeModal = function () {
        document.getElementById("summaryModal").classList.remove("show");
    };

    // Reset Form
    function resetForm() {
        document.getElementById("consensusForm").reset();
        currentStep = 1;
        document.querySelectorAll(".step").forEach((step, index) => {
            step.classList.toggle("d-none", index > 0);
        });
        toggleButtons();
    }

    const tasksArray = [
        {
            runDate: new Date().toLocaleDateString(),
            user: "Pradeep",
            language: "English",
            inputRawUrl: "https://docs.google.com/spreadsheets/d/1abc12345/edit",
            questionType: "Quality Evals",
            isGoldenAnswer: false,
            status: [
                { result: "Success", startTime: "10:00 AM", endTime: "10:30 AM", duration: "30 mins" },
                { result: "Failure", startTime: "9:00 AM", endTime: "9:15 AM", duration: "15 mins" },
                { result: "Running", startTime: "11:00 AM", endTime: "", duration: "" }
            ],
            finalUrl: "https://docs.google.com/spreadsheets/d/1abc12345/edit"
        },
        // Add more task objects as needed
    ];

    const tableBody = document.querySelector("#tasksTable tbody");
    const searchInput = document.getElementById("searchTasksInput");

    function populateTable(tasks) {
        tableBody.innerHTML = ""; // Clear existing rows
        tasks.forEach((task, index) => {
            const statusHover = task.status.map(s =>
                `<div><strong>${s.result}:</strong> Start: ${s.startTime}, End: ${s.endTime || 'N/A'}, Duration: ${s.duration || 'N/A'}</div>`
            ).join("");

            const row = `
                <tr>
                    <td>${task.runDate}</td>
                    <td>${task.user}</td>
                    <td>${task.language}</td>
                    <td>
                        <span class="badge bg-primary">${task.questionType}</span>
                        <br>
                        <a href="${task.inputRawUrl}" target="_blank">View Sheet</a>
                    </td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input golden-answer-toggle" type="checkbox" ${task.isGoldenAnswer ? "checked" : ""} data-index="${index}">
                        </div>
                    </td>
                    <td>
                        <span class="status-label">${task.status[0].result}</span>
                        <div class="status-hover">${statusHover}</div>
                    </td>
                    <td><a href="${task.finalUrl}" target="_blank">Final URL</a></td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                More Options
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#">Edit</a></li>
                                <li><a class="dropdown-item" href="#">View</a></li>
                                <li><a class="dropdown-item" href="#">Re-Run</a></li>
                                <li><a class="dropdown-item" href="#">Delete</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });
    }

    // Initial table population
    populateTable(tasksArray);

    // Search functionality
    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        const filteredTasks = tasksArray.filter(task =>
            task.user.toLowerCase().includes(searchTerm) ||
            task.language.toLowerCase().includes(searchTerm) ||
            task.inputRawUrl.toLowerCase().includes(searchTerm)
        );
        populateTable(filteredTasks);
    });

    // Handle Golden Answer Toggle
    document.addEventListener("change", function (e) {
        if (e.target.classList.contains("golden-answer-toggle")) {
            const taskIndex = e.target.dataset.index;
            tasksArray[taskIndex].isGoldenAnswer = e.target.checked;
            alert(`Golden Answer for task ${taskIndex + 1} is now ${e.target.checked ? "enabled" : "disabled"}`);
        }
    });
});

