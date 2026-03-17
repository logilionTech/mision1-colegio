/**
 * js/exam.js - Lógica principal del examen, anti-fraude y evaluación.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // 0. MOSTRAR NOMBRE DEL ESTUDIANTE
    // ===============================================
    const displayUserName = document.getElementById('displayUserName');
    if (displayUserName) {
        const studentName = localStorage.getItem('current_student_name') || 'Invitado';
        displayUserName.textContent = `${studentName} (Estudiante)`;
    }

    // ===============================================
    // 1. SISTEMA ANTI-FRAUDE (Bloqueo de atajos)
    // ===============================================
    const fraudModal = document.getElementById('fraudModal');
    const btnDismissFraud = document.getElementById('btnDismissFraud');

    // Bloquear combinaciones de teclado específicas (Ctrl+C, Ctrl+V, etc.)
    document.addEventListener('keydown', (e) => {
        // Bloquear F12, Ctrl+Shift+I (Herramientas de desarrollo)
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            showFraudWarning();
        }
        
        // Bloquear Ctrl/Cmd + C, V, X, A, P
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            showFraudWarning();
        }
    });

    function showFraudWarning() {
        if(fraudModal) {
            fraudModal.classList.remove('hidden');
        }
    }

    if(btnDismissFraud) {
        btnDismissFraud.addEventListener('click', () => {
            fraudModal.classList.add('hidden');
        });
    }

    // ===============================================
    // 2. TEMPORIZADOR DEL EXAMEN
    // ===============================================
    const timeDisplay = document.getElementById('timeRemaining');
    const timerContainer = document.getElementById('timerContainer');
    let examTimer;
    
    // Iniciar el temporizador (ejemplo con 30 minutos)
    function startTimer(durationInMinutes) {
        let timer = durationInMinutes * 60;
        
        examTimer = setInterval(function () {
            let minutes = parseInt(timer / 60, 10);
            let seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            if(timeDisplay) {
                timeDisplay.textContent = minutes + ":" + seconds;
            }

            // Advertencia visual faltando 5 minutos
            if (timer <= 300 && timerContainer) {
                timerContainer.classList.add('timer-warning');
            }

            if (--timer < 0) {
                clearInterval(examTimer);
                autoSubmitExam();
            }
        }, 1000);
    }

    function autoSubmitExam() {
        alert("¡Se ha agotado el tiempo! Enviando examen automáticamente.");
        submitExam();
    }

    // ===============================================
    // 3. CARGA DEL EXAMEN (Conexión a "Base de Datos" temporal guardada desde admin)
    // ===============================================
    const loader = document.getElementById('loader');
    const examForm = document.getElementById('examForm');
    const questionsContainer = document.getElementById('questionsContainer');
    
    // Controles de navegación
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnSubmit = document.getElementById('btnSubmit');
    const currentQDisplay = document.getElementById('currentQ');
    const totalQDisplay = document.getElementById('totalQ');
    const progressBar = document.getElementById('progressBar');
    
    let currentQuestionIndex = 0;
    
    // Extraer banco dinámicamente desde el almacenamiento creado por el admin
    let mockQuestions = [];

    // Función de inicialización
    function initExam() {
        // Simulando carga de red
        setTimeout(() => {
            const storedQuestions = JSON.parse(localStorage.getItem('admin_questions') || '[]');
            
            // Si el admin borró todo y no hay preguntas, creamos unas por defecto de contingencia
            if (storedQuestions.length === 0) {
                 mockQuestions = [
                    {
                        id: 'q1',
                        type: 'multiple',
                        text: 'El Banco de Preguntas está vacío. Contacte al Administrador.',
                        options: ['Entendido', '-', '-', '-'],
                        correctIndex: 0
                    }
                ];
            } else {
                // Consumir el formato exactamente como viene del banco madre guardado en Data Base (LocalStorage temporal) 
                mockQuestions = storedQuestions.map((q, idx) => {
                    let formattedQuestion = {
                        id: 'qa_' + idx,
                        type: 'multiple',
                        text: q.text,
                        options: q.options || [],
                        correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0
                    };

                    if (q.type === 'Falso/Verdadero') {
                        formattedQuestion.type = 'boolean';
                        if(formattedQuestion.options.length === 0) formattedQuestion.options = ['Verdadero', 'Falso'];
                    } 
                    else if (q.type === 'Respuesta Abierta') {
                        formattedQuestion.type = 'open';
                    } 
                    else {
                        formattedQuestion.type = 'multiple';
                        if(formattedQuestion.options.length === 0) {
                            formattedQuestion.options = ['(✔️) Info no provista', 'Distractor 1', 'Distractor 2', 'Distractor 3'];
                        }
                    }

                    return formattedQuestion;
                });
            }

            if(loader) loader.classList.add('hidden');
            if(examForm) examForm.classList.remove('hidden');
            
            // Randomizar orden de preguntas para evitar copia
            const shuffledQuestions = mockQuestions.sort(() => Math.random() - 0.5);
            
            // Randomizar opciones internamente
            shuffledQuestions.forEach(q => {
                if (q.type === 'multiple') {
                    // Mapeamos a objetos para no perder el rastro de la respuesta correcta original
                    let optObj = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctIndex }));
                    optObj = optObj.sort(() => Math.random() - 0.5);
                    
                    q.options = optObj.map(o => o.text);
                    // Actualizamos correctIndex en el array revuelto
                    q.correctIndex = optObj.findIndex(o => o.isCorrect === true);
                }
            });

            renderQuestions(shuffledQuestions);
            
            // Iniciar tiempo: 30 minutos
            startTimer(30); 

        }, 1500); // 1.5s delay
    }

    function renderQuestions(questions) {
        if(!questionsContainer) return;
        
        if(totalQDisplay) totalQDisplay.textContent = questions.length;
        
        questionsContainer.innerHTML = '';
        
        questions.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = `question-card ${index === 0 ? 'active' : ''}`;
            card.dataset.index = index;
            
            let html = `
                <span class="question-number">Pregunta ${index + 1}</span>
                <p class="question-text">${q.text}</p>
                <div class="options-grid">
            `;
            
            if (q.type === 'multiple' || q.type === 'boolean') {
                q.options.forEach((opt, optIndex) => {
                    html += `
                        <label class="option-label">
                            <input type="radio" name="${q.id}" value="${optIndex}">
                            <span>${opt}</span>
                        </label>
                    `;
                });
            } else if (q.type === 'open') {
                html += `
                    <textarea name="${q.id}" class="open-response-input" placeholder="Escribe tu respuesta aquí..."></textarea>
                `;
            }
            
            html += `</div>`;
            card.innerHTML = html;
            questionsContainer.appendChild(card);
        });
        
        updateNavigation(questions.length);
    }

    // ===============================================
    // 4. NAVEGACIÓN ENTRE PREGUNTAS
    // ===============================================
    function updateNavigation(totalQ) {
        // Ocultar/Mostrar botones de avance/retroceso
        if(btnPrev) btnPrev.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === totalQ - 1) {
            if(btnNext) btnNext.classList.add('hidden');
            if(btnSubmit) btnSubmit.classList.remove('hidden');
        } else {
            if(btnNext) btnNext.classList.remove('hidden');
            if(btnSubmit) btnSubmit.classList.add('hidden');
        }
        
        // Actualizar número indicador
        if(currentQDisplay) currentQDisplay.textContent = currentQuestionIndex + 1;
        
        // Actualizar barra de progreso
        if(progressBar) {
            const progress = ((currentQuestionIndex) / (totalQ - 1)) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    function showQuestion(index) {
        const cards = document.querySelectorAll('.question-card');
        cards.forEach(c => c.classList.remove('active'));
        
        if(cards[index]) cards[index].classList.add('active');
        
        currentQuestionIndex = index;
        updateNavigation(cards.length);
    }

    if(btnNext) {
        btnNext.addEventListener('click', () => {
            const total = document.querySelectorAll('.question-card').length;
            if (currentQuestionIndex < total - 1) {
                showQuestion(currentQuestionIndex + 1);
            }
        });
    }

    if(btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                showQuestion(currentQuestionIndex - 1);
            }
        });
    }

    // ===============================================
    // 5. ENVÍO Y EVALUACIÓN
    // ===============================================
    if(examForm) {
        examForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Verificación simple de que todo esté respondido
            const allAnswered = mockQuestions.every(q => {
                if(q.type === 'open') {
                    const txt = document.querySelector(`textarea[name="${q.id}"]`);
                    return txt !== null && txt.value.trim() !== '';
                }
                return document.querySelector(`input[name="${q.id}"]:checked`) !== null;
            });
            
            if (!allAnswered) {
                const conf = confirm('Aún tienes preguntas sin responder. ¿Seguro que deseas enviar el examen?');
                if(!conf) return;
            }
            
            submitExam();
        });
    }

    function submitExam() {
        clearInterval(examTimer);
        
        const overlay = document.getElementById('submissionOverlay');
        if(overlay) overlay.classList.remove('hidden');
        
        // Simular llamada al backend para cálculo de score (Esto después conectará con Supabase)
        setTimeout(() => {
            let score = 0;
            let reviewData = [];
            
            mockQuestions.forEach(q => {
                if (q.type === 'open') {
                    const txtElement = document.querySelector(`textarea[name="${q.id}"]`);
                    const studentText = txtElement ? txtElement.value.trim() : "";
                    const expectedAnswer = (q.options && q.options.length > 0) ? q.options[0].trim() : "";
                    
                    const isCorrect = expectedAnswer !== '' && studentText.toLowerCase() === expectedAnswer.toLowerCase();
                    
                    if (isCorrect) score++;
                    
                    reviewData.push({
                        text: q.text,
                        options: [expectedAnswer],
                        correctIndex: 0,
                        selectedIndex: studentText, // Ojo, guardamos texto
                        isCorrect: isCorrect,
                        type: 'open'
                    });
                } else {
                    const selected = document.querySelector(`input[name="${q.id}"]:checked`);
                    const selectedValue = selected ? parseInt(selected.value) : -1;
                    const isCorrect = selectedValue === q.correctIndex;
                    
                    if (isCorrect) score++;
                    
                    reviewData.push({
                        text: q.text,
                        options: q.options,
                        correctIndex: q.correctIndex,
                        selectedIndex: selectedValue,
                        isCorrect: isCorrect,
                        type: q.type
                    });
                }
            });
            
            const per = (score / mockQuestions.length) * 100;
            const currentStudentName = localStorage.getItem('current_student_name') || "Estudiante San Paulo";
            const currentStudentEmail = localStorage.getItem('current_student_email') || "no-email@sanpaulo.edu.co";
            
            // Construir el paquete completo de resultados
            const dateObj = new Date();
            const resultPayload = {
               score: Math.round(per),
               total: mockQuestions.length,
               correct: score,
               studentName: currentStudentName,
               studentEmail: currentStudentEmail,
               examName: document.getElementById('displayExamTitle') ? document.getElementById('displayExamTitle').textContent : "Evaluación General",
               details: reviewData,
               date: dateObj.toLocaleDateString('es-CO'),
               time: dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            };
            
            localStorage.setItem('exam_last_result', JSON.stringify(resultPayload));
            
            // Guardar también en el histórico general para las estadísticas
            let allResults = JSON.parse(localStorage.getItem('exam_all_results') || '[]');
            allResults.push(resultPayload);
            localStorage.setItem('exam_all_results', JSON.stringify(allResults));
            
            // Redirigir al panel visual de resultados
            window.location.href = 'result.html'; 

        }, 2000);
    }

    // Arrancar la simulación
    if(document.getElementById('displayExamTitle')) {
        initExam();
    }
});
