/**
 * js/certificate.js - Cálculo de resultados y emisión de certificados en PDF (jsPDF)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. OBTENER RESULTADOS (Simulado vía LocalStorage temporalmente hasta inyectar Supabase DB real)
    const scoreData = JSON.parse(localStorage.getItem('exam_last_result') || '{}');
    
    // Si no hay datos, mostrar error (para pruebas directas rellenamos ficticiamente)
    const score = scoreData.score || 85; 
    const totalQuestions = scoreData.total || 10;
    const correctAnswers = scoreData.correct || 8;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const studentName = scoreData.studentName || "Estudiante San Paulo";
    const examName = scoreData.examName || "Evaluación General de Conocimientos";
    
    // 2. MOSTRAR DATOS PRINCIPALES EN PANTALLA
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const statusDisplay = document.getElementById('statusDisplay');
    const correctDisplay = document.getElementById('correctDisplay');
    const incorrectDisplay = document.getElementById('incorrectDisplay');
    const btnDownloadCert = document.getElementById('btnDownloadCert');
    
    if(studentNameDisplay) studentNameDisplay.textContent = `Estudiante: ${studentName}`;
    if(scoreDisplay) scoreDisplay.textContent = `${score}%`;
    if(correctDisplay) correctDisplay.textContent = correctAnswers;
    if(incorrectDisplay) incorrectDisplay.textContent = incorrectAnswers;
    
    const isApproved = score >= 70; // 70% es el mínimo para pasar según las políticas estándar
    
    if(statusDisplay) {
        if(isApproved) {
            statusDisplay.textContent = "¡Aprobado!";
            statusDisplay.style.color = "var(--c-success)";
            if(btnDownloadCert) btnDownloadCert.classList.remove('hidden');
        } else {
            statusDisplay.textContent = "Reprobado";
            statusDisplay.style.color = "var(--c-danger)";
        }
    }
    
    // 3. MOSTRAR REVISIÓN DETALLADA DE RESPUESTAS
    const reviewContainer = document.getElementById('questionsReviewContainer');
    if(reviewContainer && scoreData.details) {
        let reviewHTML = '';
        scoreData.details.forEach((item, index) => {
            let statusIcon = item.isCorrect ? '<i class="ph ph-check-circle" style="color: var(--c-success);"></i>' : '<i class="ph ph-x-circle" style="color: var(--c-danger);"></i>';
            let studentAnswer = item.type === 'open' ? (item.selectedIndex ? `"${item.selectedIndex}"` : '<span class="text-muted">Sin responder</span>') : (item.options[item.selectedIndex] || '<span class="text-muted">Sin responder</span>');
            let correctAnswer = item.type === 'open' ? (item.options[0] || '<span class="text-muted">La evaluación debe ser verificada manualmente</span>') : (item.options[item.correctIndex] || '<span class="text-muted">No aplica</span>');
            
            reviewHTML += `
                <div style="padding: 1rem 0; border-bottom: 1px dashed var(--c-border);">
                    <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.25rem;">${statusIcon} Pregunta ${index + 1}: ${item.text}</div>
                    <div style="font-size: 0.9rem; padding-left: 1.5rem;">
                        <span style="color: var(--c-text-muted);">Tu respuesta:</span> 
                        <strong style="color: ${item.isCorrect ? 'var(--c-success)' : 'var(--c-danger)'}">
                            ${studentAnswer}
                        </strong>
                        ${!item.isCorrect ? `<br><span style="color: var(--c-text-muted);">Respuesta correcta aproximada / esperada: <strong style="color: var(--c-success);">${correctAnswer}</strong></span>` : ''}
                    </div>
                </div>
            `;
        });
        reviewContainer.innerHTML = reviewHTML;
    }

    // 4. GENERAR PDF (jsPDF)
    if(btnDownloadCert) {
        btnDownloadCert.addEventListener('click', () => {
            generatePDFCertificate(studentName, examName, score);
        });
    }

    // 5. CERRAR SESIÓN
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            localStorage.removeItem('current_student_name');
            localStorage.removeItem('exam_last_result');
        });
    }
    
    function generatePDFCertificate(name, exam, finalScore) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Colores y diseño premium
        doc.setFillColor(243, 244, 246); // bg-light
        doc.rect(0, 0, 297, 210, 'F');
        
        // Marco doble
        doc.setDrawColor(79, 70, 229); // c-primary
        doc.setLineWidth(2);
        doc.rect(10, 10, 277, 190);
        doc.setDrawColor(30, 58, 138); // blue
        doc.setLineWidth(0.5);
        doc.rect(12, 12, 273, 186);
        
        // Títulos
        doc.setTextColor(31, 41, 55);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(36);
        doc.text("Certificado de Aprobación", 148.5, 50, { align: "center" });
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        doc.text("El Colegio San Paulo - AI Exam System PRO otorga el presente a:", 148.5, 75, { align: "center" });
        
        // Nombre del Estudiante
        doc.setFontSize(32);
        doc.setFont("times", "italic");
        doc.setTextColor(79, 70, 229);
        doc.text(name, 148.5, 100, { align: "center" });
        
        // Línea bajo el nombre
        doc.setDrawColor(200, 200, 200);
        doc.line(70, 105, 227, 105);
        
        // Motivo
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        doc.text(`Por haber aprobado exitosamente la evaluación:`, 148.5, 125, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.text(`"${exam}"`, 148.5, 137, { align: "center" });
        
        // Calificación y Fecha
        const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Calificación obtenida: ${finalScore}%  |  Fecha: ${today}`, 148.5, 155, { align: "center" });
        
        // Sello y Verificación
        const verificationCode = "SAN-PAULO-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175);
        doc.text(`Código de Verificación: ${verificationCode}`, 148.5, 185, { align: "center" });
        
        // Descargar PDF
        doc.save(`Certificado_${name.replace(/\s+/g, '_')}_${exam.replace(/\s+/g, '')}.pdf`);
    }
});
