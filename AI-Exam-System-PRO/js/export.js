/**
 * js/export.js - Lógica de exportación de resultados a Excel con SheetJS
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnExportExcel = document.getElementById('btnExportExcel');
    if(!btnExportExcel) return;

    btnExportExcel.addEventListener('click', () => {
        
        // 1. OBTENER DATOS (Usaremos los mock de window.AdminMockResults temporalmente)
        // En producción se hace un await supabase.from('results').select('*')
        const data = window.AdminMockResults || [];
        
        if (data.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        // 2. DAR FORMATO A LOS DATOS PARA EXCEL (SheetJS)
        // Según reglas, el excel debe incluir datos específicos y respuestas.
        const excelData = data.map(record => ({
            "Nombre del Estudiante": record.name,
            "Correo Electrónico": record.email,
            "Examen": record.exam,
            "Calificación Final (%)": record.score,
            "Estado": record.score >= 70 ? "Aprobado" : "Reprobado",
            "Fecha": record.date,
            "Hora": record.time,
            // Mock de respuestas
            "Respuesta Pregunta 1": "A",
            "Respuesta Pregunta 2": "Verdadero",
            "Respuesta Pregunta 3": "C"
        }));

        // 3. CREAR WORKBOOK Y WORKSHEET DE SHEETJS
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados de Exámenes");

        // Ajustar ancho de columnas para que se vea premium
        const wscols = [
            {wch: 25}, // Nombre
            {wch: 25}, // Correo
            {wch: 25}, // Examen
            {wch: 15}, // Calificación
            {wch: 12}, // Estado
            {wch: 15}, // Fecha
            {wch: 12}, // Hora
            {wch: 20}, // P1
            {wch: 20}, // P2
            {wch: 20}  // P3
        ];
        worksheet['!cols'] = wscols;

        // 4. DESCARGAR AUTO-GENERADO
        // Regla: "El archivo generado será resultados_examen.xlsx"
        XLSX.writeFile(workbook, "resultados_examen.xlsx", { compression: true });
        
        // Alerta de éxito con icono y color
        alert('📊 ¡Archivo Excel exportado exitosamente!');
    });
});
