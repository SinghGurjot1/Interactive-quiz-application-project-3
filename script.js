


document.addEventListener('DOMContentLoaded', function() {
    const firestoreApiUrl = "https://interactive-quiz-applica-17d99-default-rtdb.firebaseio.com/data/Questions.json";
    const usersApiUrl = "https://interactive-quiz-applica-17d99-default-rtdb.firebaseio.com/data/Users.json"

    const quizContainer = document.querySelector('.quiz-container');
    const nextButton = document.querySelector('.nav-button.next');
    const prevButton = document.querySelector('.nav-button.prev');
    const submitButton = document.createElement('button');
    submitButton.className = 'nav-button submit';
    submitButton.textContent = 'Submit';
    submitButton.disabled = true;

    let questions = []
    let currentQuestionIndex = 0;

    let questionElement;
    let selectedOptions = [];

    let userName;

    function getQuestions() {
    fetch(firestoreApiUrl)
        .then(response => response.json())
        .then(data => {
            

            if (data ) {
                // alert("2")
                questions = Object.values(data);
                console.log("Questions object:", questions);
                initQuiz();

                
                } 
             else {
                console.error("Property Questions not found in the response.")
            }
            // if(data) {
            //     alert("3");
            //     const questions = Object.values(data);
            //     console.log("All Questions: ",questions);

            //     questions.forEach((question, index) => {
            //         console.log(`Question ${index + 1}: ${question.text}`);
            //         console.log(`Options: ${question.options}`);
            //     });
            // }
        })
        .catch(error => {
            console.error("Error Fetching data:", error);
        });
    }

    quizContainer.appendChild(submitButton);

    // Initialize quiz
    function initQuiz() {

        const quizInstructions = document.createElement('div');
        quizInstructions.className = 'quiz-instructions';
        quizInstructions.textContent = "Interactive Quiz Application! Enter your Name and begin";
        quizContainer.appendChild(quizInstructions);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'name-input';
        nameInput.placeholder = 'Enter your Name';
        quizContainer.appendChild(nameInput);
        
        const startButton = document.createElement('button');
        startButton.className = 'start-button';
        startButton.textContent = 'Take the Quiz';
        quizContainer.appendChild(startButton);

        const buttonsToHide = document.querySelectorAll('.nav-button, .submit, .progress-bar');
        buttonsToHide.forEach(button => {
            button.style.display = 'none';
        });

        

        

        const instToHide = document.querySelectorAll('.quiz-instructions');
        instToHide.forEach(instr => {
            instr.style.display = 'block';
        });

        startButton.addEventListener('click', function() {

            userName = nameInput.value;
            if(userName.trim() === '') {
                alert('Please enter your name before Starting the quiz!');
                return;
            }

            nameInput.style.display = 'none';
            startButton.style.display = 'none';

            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'welcome-message';
            welcomeMessage.textContent = `Welcome, ${userName}!`;
            quizContainer.appendChild(welcomeMessage);

            startButton.style.display = 'none';

            const storedIndex = sessionStorage.getItem('currentQuestionIndex');
            const storedOptions = sessionStorage.getItem('selectedOptions');

            if (storedIndex !== null && storedOptions !== null) {
                currentQuestionIndex = parseInt(storedIndex);
                selectedOptions = JSON.parse(storedOptions);
            }


            showQuestion(currentQuestionIndex);

            buttonsToHide.forEach(button => {
                button.style.display = 'block';
            });

            instToHide.forEach(instr => {
                instr.style.display = 'none';
            });
        })
        // showQuestion(currentQuestionIndex);

        nextButton.addEventListener('click', function() {
            if(currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                clearPrevious();
                showQuestion(currentQuestionIndex);
                
            } 
        });

        prevButton.addEventListener('click', function() {
            if(currentQuestionIndex > 0) {
                currentQuestionIndex--;
                clearPrevious();
                showQuestion(currentQuestionIndex);
                submitButton.disabled = true;
            }
        });
        submitButton.addEventListener('click', function() {
            const userScore = calculateScore();
            const userData = {
                name: userName,
                score: userScore
            };

            saveUserScore(userData);
            alert(`Dear ${userName}, Your Score is ${userScore} out of ${questions.length}`);
            location.reload();
        });


        function saveUserScore(userData) {
            fetch(usersApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            .then(response => response.json())
            .then(data => {
                console.log('User data saved successfully',data);
            })
            .catch(error => {
                console.error("Error saving user data", error);
            });
        }
    }

    

    function goToNextQuestion(){
        if(currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            clearPrevious()
            showQuestion(currentQuestionIndex);
        }
    }

    //Show a specific Question
    function showQuestion(index) {
        
        
        const question = questions[index];
        clearPrevious();

        questionElement = document.createElement('div');
        questionElement.className= 'question';
        questionElement.innerHTML = `<p class = "question-text">${question.text}</p>`;
        
        if(question.type === 'Multiple choice' && question.items) {
            
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options';

            question.items.forEach((option, optionIndex) => {
                const optionWrapper = document.createElement('div');
                optionWrapper.className = 'option-wrapper';

                const optionRadio = document.createElement('input');
                optionRadio.type = 'radio';
                optionRadio.name = 'option';
                optionRadio.value = option;
                optionRadio.id = `option${optionIndex}`;
                optionRadio.checked = selectedOptions[currentQuestionIndex] === option;
                
                // const optionButton = document.createElement('button');
                
                // optionButton.textContent = option;
                
                optionRadio.addEventListener('click',function() {
                    clearSelections();
                    optionWrapper.classList.add('selected');
                    selectedOptions[currentQuestionIndex] = option;
            });

            // questionElement.appendChild(optionsContainer);

            const optionLabel = document.createElement('label');
            optionLabel.textContent = option;
            optionLabel.setAttribute('for', `option${optionIndex}`);

            optionWrapper.appendChild(optionRadio);
            optionWrapper.appendChild(optionLabel);
            
            optionsContainer.appendChild(optionWrapper);

        });
        questionElement.appendChild(optionsContainer);
    }

    
    quizContainer.appendChild(questionElement);
    updateProgressBar();
    submitButton.disabled = false;
    }

    function clearSelections() {
        const selectedOptions = document.querySelectorAll('.option-wrapper.selected');
        selectedOptions.forEach(option => {
            option.classList.remove('selected');
        });
    }

    function clearPrevious(){
        const questionTypes = document.querySelectorAll('.question');
        questionTypes.forEach(type => {
            type.style.display = 'none';
        });
    }

    function shuffleArray(array) {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i>0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }

    // Update the progress bar
    function updateProgressBar() {
        const progressPercentage = (currentQuestionIndex + 1) / questions.length * 100;
        const progressBar = document.querySelector('.progress-bar .progress');

        const validPercentage = Math.min(100, Math.max(0, progressPercentage));
        progressBar.style.width = `${validPercentage}%`;
    }

    function calculateScore() {
        let score = 0;

        for(let i = 0; i<questions.length; i++) {
            const userAnswer = selectedOptions[i];
            const correctAnswer = questions[i].answer;

            if (userAnswer && Array.isArray(correctAnswer) ? correctAnswer.includes(userAnswer) : correctAnswer === userAnswer) {
                score++;
            }
            
        }
        return score
        alert(`Your score: ${score} out of ${questions.length}`);
    }

    function resetQuiz() {
        currentQuestionIndex = 0;
        selectedOptions = [];
        clearPrevious();
        showQuestion(currentQuestionIndex);
    }

    

    // Event Listener for Multiple Choice Options
    document.querySelectorAll('.multiple-choice .option').forEach(option => {
        option.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    // Initialize the Quiz
    // initQuiz();
    getQuestions();
});
