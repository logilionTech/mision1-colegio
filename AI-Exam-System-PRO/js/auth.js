/**
 * js/auth.js - Lógica de Autenticación para Estudiantes y Administradores
 */

document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // CREDENCIALES POR DEFECTO DEL SUPERADMINISTRADOR
    // ===============================================
    const ADMIN_CREDENTIALS = {
        email: 'admin@sanpaulo.edu.co',
        password: 'admin' // Contraseña temporal de pruebas
    };

    // ===============================================
    // LÓGICA DE MOSTRAR/OCULTAR CONTRASEÑA
    // ===============================================
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ph-eye');
                icon.classList.add('ph-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('ph-eye-slash');
                icon.classList.add('ph-eye');
            }
        });
    });

    // ===============================================
    // LOGIN ADMINISTRADOR (Panel Docentes)
    // ===============================================
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const messageDiv = document.getElementById('authMessage');

            // Simulación de validación (En producción, conectar a Supabase Auth)
            if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                messageDiv.className = 'auth-message msg-success';
                messageDiv.textContent = 'Acceso concedido. Redirigiendo al panel...';
                
                // Guardar sesión simulada
                sessionStorage.setItem('admin_logged_in', 'true');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                messageDiv.className = 'auth-message msg-error';
                messageDiv.textContent = 'Credenciales incorrectas. Verifique e intente nuevamente.';
                
                // Animación de error
                adminLoginForm.classList.add('shake');
                setTimeout(() => adminLoginForm.classList.remove('shake'), 400);
            }
        });
    }

    // ===============================================
    // LOGIN ESTUDIANTE
    // ===============================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const messageDiv = document.getElementById('authMessage');
            const emailField = document.getElementById('email');
            
            messageDiv.className = 'auth-message msg-success';
            messageDiv.textContent = 'Iniciando sesión...';
            
            // Si hay un mail, guardar para identificarlo en las estadisticas
            if(emailField && emailField.value) {
                const tempName = emailField.value.split('@')[0];
                const cleanName = tempName.charAt(0).toUpperCase() + tempName.slice(1);
                localStorage.setItem('current_student_name', cleanName);
                localStorage.setItem('current_student_email', emailField.value);
                
                // Asegurar que quede en el historial de registrados, incluso si se saltó el formulario de registro
                const dateObj = new Date();
                const newStudent = {
                    name: cleanName,
                    email: emailField.value,
                    date: dateObj.toLocaleDateString('es-CO'),
                    time: dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                };
                
                let registered = [];
                try {
                    registered = JSON.parse(localStorage.getItem('all_registered_students') || '[]');
                } catch(e) {
                    localStorage.removeItem('all_registered_students');
                }
                
                // Si el alumno existe lo actualizamos, si no lo agregamos. 
                // Pero como es un mock de registro por login, simplemente lo agregamos si no existe el correo
                if (!registered.some(s => s.email === newStudent.email)) {
                    registered.push(newStudent);
                    localStorage.setItem('all_registered_students', JSON.stringify(registered));
                }
            }
            
            // Simulación de login exitoso
            setTimeout(() => {
                window.location.href = 'exam.html'; // Redirige al examen temporalmente
            }, 1000);
        });
    }

    // ===============================================
    // REGISTRO ESTUDIANTE
    // ===============================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameField = document.getElementById('reg-name');
            const pass1 = document.getElementById('reg-password').value;
            const pass2 = document.getElementById('reg-password-confirm').value;
            const messageDiv = document.getElementById('authMessage');

            if (pass1 !== pass2) {
                messageDiv.className = 'auth-message msg-error';
                messageDiv.textContent = 'Las contraseñas no coinciden.';
                return;
            }

            const emailField = document.getElementById('reg-email'); // asumiendo que el ID es este

            if(nameField && nameField.value) {
                localStorage.setItem('current_student_name', nameField.value);
                if (emailField && emailField.value) {
                    localStorage.setItem('current_student_email', emailField.value);
                }
            }

            // Guardar en el histórico de alumnos registrados
            const dateObj = new Date();
            const newStudent = {
                name: nameField ? nameField.value : 'Estudiante San Paulo',
                email: emailField ? emailField.value : 'sin-email',
                date: dateObj.toLocaleDateString('es-CO'),
                time: dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            };
            
            let registered = [];
            try {
                registered = JSON.parse(localStorage.getItem('all_registered_students') || '[]');
            } catch(e) {
                localStorage.removeItem('all_registered_students');
            }
            
            // Agregamos siempre el registro para demostración
            registered.push(newStudent);
            localStorage.setItem('all_registered_students', JSON.stringify(registered));

            messageDiv.className = 'auth-message msg-success';
            messageDiv.textContent = 'Registro exitoso. Redirigiendo al inicio de sesión...';
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
});

// Utilidad de animación CSS (Añadir dinámicamente)
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .shake { animation: shake 0.4s; }
`;
document.head.appendChild(style);
