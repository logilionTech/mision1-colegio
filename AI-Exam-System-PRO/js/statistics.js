/**
 * js/statistics.js - Lógica para gráficos estadísticos con Chart.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZAR GRAFICOS Chart.js
    const ctx = document.getElementById('performanceChart');
    if(!ctx) return;

    // Estos datos luego vendrán de Supabase (consultando la tabla `results`)
    // Datos simulados para demostración según las reglas:
    const data = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
            {
                label: 'Exámenes Aprobados',
                data: [65, 70, 80, 81, 90, 95],
                borderColor: '#10B981', // green
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Exámenes Reprobados',
                data: [15, 20, 10, 8, 5, 2],
                borderColor: '#EF4444', // red
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const config = {
        type: 'line', // Tipo de gráfico: líneas
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tendencia de Aprobación Semestral'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        },
    };

    new Chart(ctx, config);

    // 2. RENDERIZAR TABLA DE RESULTADOS (Incluyendo Nuevos y Mocks)
    const tableBody = document.querySelector('#resultsTable tbody');
    if(!tableBody) return;

    let allResults = [];
    try {
        allResults = JSON.parse(localStorage.getItem('exam_all_results') || '[]');
    } catch (e) {
        localStorage.removeItem('exam_all_results');
    }
    
    // Convertir mocks a formato similar
    const mockResults = [
        { studentName: 'Juan Pérez', studentEmail: 'juan@email.com', examName: 'Evaluación General', score: 85, correct: 8, total: 10, date: '13/03/2026', time: '10:30 AM' },
        { studentName: 'María Gómez', studentEmail: 'maria@email.com', examName: 'Evaluación General', score: 92, correct: 9, total: 10, date: '13/03/2026', time: '11:15 AM' },
        { studentName: 'Carlos Ruiz', studentEmail: 'carlos@email.com', examName: 'Evaluación General', score: 65, correct: 6, total: 10, date: '12/03/2026', time: '09:00 AM' }
    ];

    // Combinamos ambos y los ordenamos por fecha/hora simulada (los más nuevos al principio)
    const combinedResults = [...allResults, ...mockResults].reverse(); 

    // Almacenar en window para export.js
    window.AdminMockResults = combinedResults;

    // Diccionario para contar los intentos por alumno y examen
    const intentTracker = {};

    // Como invertimos el arreglo (reverse), para que el conteo de intento sea exacto según el momento,
    // debemos contarlos primero desde el registro más antiguo al más nuevo.
    const forwardResults = [...allResults, ...mockResults];
    const finalIntents = {};
    forwardResults.forEach((row, i) => {
        const key = `${row.studentEmail}_${row.examName}`;
        if (!intentTracker[key]) intentTracker[key] = 0;
        intentTracker[key]++;
        // Guardar el intento para esa fila exacta (usando un id artificial temporal)
        row._tempId = i;
        finalIntents[i] = intentTracker[key];
    });

    tableBody.innerHTML = '';
    combinedResults.forEach(row => {
        const isApproved = row.score >= 70;
        const statusBadge = isApproved 
            ? `<span style="background: #D1FAE5; color: #065F46; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Aprobado</span>`
            : `<span style="background: #FEE2E2; color: #991B1B; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">Reprobado</span>`;
        
        const intentNumber = finalIntents[row._tempId] || 1;
        const preguntasText = row.correct !== undefined && row.total !== undefined ? `${row.correct}/${row.total}` : '-';

        tableBody.innerHTML += `
            <tr>
                <td style="font-weight: 500;">${row.studentName || row.name}</td>
                <td style="color: var(--c-text-muted);">${row.studentEmail || row.email}</td>
                <td>${row.examName || row.exam}</td>
                <td style="font-weight: 700; color: ${isApproved ? 'var(--c-success)' : 'var(--c-danger)'}">${row.score}%</td>
                <td style="text-align: center; color: var(--c-text-muted);">${preguntasText}</td>
                <td style="text-align: center;"><span style="background: #E0E7FF; color: var(--c-blue-primary); padding: 2px 8px; border-radius:12px; font-size: 12px; font-weight: bold;">#${intentNumber}</span></td>
                <td>${row.date}</td>
                <td style="color: var(--c-text-muted);">${row.time}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });

    // 3. RENDERIZAR TABLA DE ESTUDIANTES REGISTRADOS
    const studentsTableBody = document.querySelector('#studentsTable tbody');
    if (studentsTableBody) {
        let registeredStudents = [];
        try {
            registeredStudents = JSON.parse(localStorage.getItem('all_registered_students') || '[]');
        } catch(e) {
            localStorage.removeItem('all_registered_students');
        }
        
        // Si está vacío, inyectar algunos datos mockeados para que los vea el administrador (simulando los que ya hicieron exam)
        if (registeredStudents.length === 0) {
            registeredStudents = [
                { name: 'Juan Pérez', email: 'juan@email.com', date: '13/03/2026', time: '10:00 AM' },
                { name: 'María Gómez', email: 'maria@email.com', date: '13/03/2026', time: '10:05 AM' },
                { name: 'Carlos Ruiz', email: 'carlos@email.com', date: '12/03/2026', time: '08:45 AM' }
            ];
        }

        studentsTableBody.innerHTML = '';
        // Mostramos inversamente para ver los más recientes al principio
        const displayStudents = [...registeredStudents].reverse();
        
        displayStudents.forEach(student => {
            studentsTableBody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${student.name}</td>
                    <td style="color: var(--c-text-muted);">${student.email}</td>
                    <td>${student.date || '-'}</td>
                    <td style="color: var(--c-text-muted);">${student.time || '-'}</td>
                </tr>
            `;
        });

        // Actualizar la tarjeta superior KPI "Estudiantes"
        const totalStudentsBadge = document.getElementById('totalStudents');
        if(totalStudentsBadge) {
            totalStudentsBadge.textContent = displayStudents.length;
        }
    }

    // Actualizar la tarjeta superior KPI "Exámenes Creados"
    const totalExamsBadge = document.getElementById('totalExams');
    if(totalExamsBadge) {
        let localExams = JSON.parse(localStorage.getItem('admin_exams') || '[]');
        totalExamsBadge.textContent = localExams.length > 0 ? localExams.length : 1;
    }

});
