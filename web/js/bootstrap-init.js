/**
 * SENER LaTeX Editor - Bootstrap Initialization
 * Inicializa componentes de Bootstrap y funcionalidades adicionales
 */

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeBootstrapComponents();
    initializeToastSystem();
    initializeFormValidation();
    initializeTooltips();
    initializeFeatherIcons();
});

/**
 * Inicializar componentes de Bootstrap
 */
function initializeBootstrapComponents() {
    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    console.log('✅ Bootstrap components initialized');
}

/**
 * Sistema de notificaciones Toast
 */
function initializeToastSystem() {
    // Crear funciones globales para mostrar toasts
    window.showToast = function(type, message, duration = 5000) {
        const toastElement = document.getElementById(`toast-${type}`);
        const messageElement = document.getElementById(`toast-${type}-message`);
        
        if (toastElement && messageElement) {
            messageElement.textContent = message;
            const toast = new bootstrap.Toast(toastElement, {
                delay: duration
            });
            toast.show();
        }
    };

    // Funciones específicas para cada tipo
    window.showSuccess = function(message, duration = 5000) {
        showToast('success', message, duration);
    };

    window.showError = function(message, duration = 7000) {
        showToast('error', message, duration);
    };

    window.showInfo = function(message, duration = 5000) {
        showToast('info', message, duration);
    };

    console.log('✅ Toast system initialized');
}

/**
 * Validación de formularios con Bootstrap
 */
function initializeFormValidation() {
    // Agregar validación a formularios
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                showError('Por favor complete todos los campos requeridos');
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Validación en tiempo real para campos requeridos
    const requiredInputs = document.querySelectorAll('input[required], textarea[required], select[required]');
    
    requiredInputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.value.trim() !== '') {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });

    console.log('✅ Form validation initialized');
}

/**
 * Inicializar tooltips dinámicamente
 */
function initializeTooltips() {
    // Función para agregar tooltips dinámicamente
    window.addTooltip = function(element, title, placement = 'top') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.setAttribute('data-bs-toggle', 'tooltip');
            element.setAttribute('data-bs-placement', placement);
            element.setAttribute('title', title);
            
            new bootstrap.Tooltip(element);
        }
    };

    console.log('✅ Dynamic tooltips initialized');
}

/**
 * Inicializar Feather Icons
 */
function initializeFeatherIcons() {
    // Inicializar Feather Icons si está disponible
    if (typeof feather !== 'undefined') {
        feather.replace();
        console.log('✅ Feather icons initialized');
        
        // Función global para reemplazar iconos después de cambios dinámicos
        window.refreshFeatherIcons = function() {
            feather.replace();
        };
    }
}

/**
 * Utilidades adicionales para mejorar la UX
 */

// Función para mostrar loading en botones
window.setButtonLoading = function(buttonId, loading = true, originalText = null) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (loading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.innerHTML;
        }
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Cargando...';
        button.disabled = true;
    } else {
        button.innerHTML = button.dataset.originalText || originalText || button.innerHTML;
        button.disabled = false;
    }
};

// Función para confirmar acciones con modal de Bootstrap
window.confirmAction = function(message, onConfirm, title = 'Confirmar acción') {
    // Crear modal dinámico si no existe
    let modal = document.getElementById('bootstrap-confirm-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bootstrap-confirm-modal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Confirmar acción</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">¿Está seguro de que desea continuar?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirm-action-btn">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Actualizar contenido
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body p').textContent = message;
    
    // Configurar evento de confirmación
    const confirmBtn = modal.querySelector('#confirm-action-btn');
    confirmBtn.onclick = function() {
        onConfirm();
        bootstrap.Modal.getInstance(modal).hide();
    };

    // Mostrar modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
};

// Función para mostrar progress bar
window.showProgress = function(containerId, progress = 0, message = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let progressBar = container.querySelector('.progress');
    
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress mb-3';
        progressBar.innerHTML = `
            <div class="progress-bar bg-primary" role="progressbar" style="width: 0%">
                <span class="progress-text"></span>
            </div>
        `;
        container.appendChild(progressBar);
    }

    const bar = progressBar.querySelector('.progress-bar');
    const text = progressBar.querySelector('.progress-text');
    
    bar.style.width = progress + '%';
    bar.setAttribute('aria-valuenow', progress);
    text.textContent = message;
};

// Función para ocultar progress bar
window.hideProgress = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const progressBar = container.querySelector('.progress');
    if (progressBar) {
        progressBar.remove();
    }
};

// Función para agregar badges dinámicamente
window.addBadge = function(text, type = 'primary', className = '') {
    const badge = document.createElement('span');
    badge.className = `badge bg-${type} ${className}`;
    badge.textContent = text;
    return badge;
};

console.log('🎯 Bootstrap utilities loaded');