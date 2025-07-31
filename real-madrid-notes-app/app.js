// Aplicación Real Madrid - Notas de Jugadores
// Estado global de la aplicación
let appState = {
    currentTab: 'crear-partido',
    currentStep: 'form-partido',
    partidoActual: null,
    jugadoresSeleccionados: {
        titulares: [],
        suplentes: []
    },
    calificaciones: [],
    jugadores: [],
    competiciones: [],
    partidos: [],
    draggedPlayer: null
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Cargar datos iniciales
        await loadInitialData();
        
        // Configurar navegación
        setupNavigation();
        
        // Configurar formularios
        setupForms();
        
        // Configurar drag and drop
        setupDragAndDrop();
        
        // Cargar datos desde Firebase
        await loadDataFromFirebase();
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        showNotification('Error al cargar la aplicación', 'error');
    }
}

// Cargar datos iniciales
async function loadInitialData() {
    // Cargar jugadores desde el archivo de datos
    appState.jugadores = window.jugadoresData || [];
    
    // Cargar competiciones con logos
    appState.competiciones = [
        { nombre: 'LaLiga', logo: 'logos_competiciones/laliga.png' },
        { nombre: 'Champions League', logo: 'logos_competiciones/champions.png' },
        { nombre: 'Copa del Rey', logo: 'logos_competiciones/copa_rey.png' },
        { nombre: 'Supercopa de España', logo: 'logos_competiciones/supercopa_espana.png' },
        { nombre: 'Supercopa de Europa', logo: 'logos_competiciones/supercopa_europa.png' },
        { nombre: 'Mundial de Clubes', logo: 'logos_competiciones/mundial_clubes.png' }
    ];
    
    // Poblar select de competiciones
    populateCompetitionsSelect();
    
    // Poblar select de jugadores para estadísticas
    populatePlayersSelect();
}

// Poblar select de competiciones
function populateCompetitionsSelect() {
    const select = document.getElementById('competicion');
    if (!select) return;
    
    // Limpiar opciones existentes excepto la primera
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Añadir competiciones con logos
    appState.competiciones.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.nombre;
        option.textContent = comp.nombre;
        option.dataset.logo = comp.logo;
        select.appendChild(option);
    });
    
    // Personalizar el select para mostrar logos
    customizeCompetitionSelect();
}

// Personalizar select de competiciones para mostrar logos
function customizeCompetitionSelect() {
    const select = document.getElementById('competicion');
    const container = select.parentElement;
    
    // Verificar si ya existe un custom select
    const existingCustomSelect = container.querySelector('.custom-select');
    if (existingCustomSelect) {
        existingCustomSelect.remove();
    }
    
    // Crear un select personalizado
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';
    customSelect.innerHTML = `
        <div class="custom-select-trigger">
            <span class="custom-select-text">Seleccionar competición</span>
            <svg class="custom-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"/>
            </svg>
        </div>
        <div class="custom-select-options">
            ${appState.competiciones.map(comp => `
                <div class="custom-select-option" data-value="${comp.nombre}">
                    <img src="${comp.logo}" alt="${comp.nombre}" class="competition-logo">
                    <span>${comp.nombre}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Reemplazar el select original
    select.style.display = 'none';
    container.insertBefore(customSelect, select);
    
    // Configurar eventos del select personalizado
    setupCustomSelect(customSelect, select);
}

// Configurar eventos del select personalizado
function setupCustomSelect(customSelect, originalSelect) {
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelector('.custom-select-options');
    const optionElements = customSelect.querySelectorAll('.custom-select-option');
    const textElement = customSelect.querySelector('.custom-select-text');
    
    // Toggle dropdown
    trigger.addEventListener('click', () => {
        customSelect.classList.toggle('open');
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });
    
    // Seleccionar opción
    optionElements.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value;
            const logo = option.querySelector('img').src;
            const text = option.querySelector('span').textContent;
            
            // Actualizar select original
            originalSelect.value = value;
            originalSelect.dispatchEvent(new Event('change'));
            
            // Actualizar display
            textElement.innerHTML = `
                <img src="${logo}" alt="${text}" class="competition-logo">
                <span>${text}</span>
            `;
            
            customSelect.classList.remove('open');
        });
    });
}

// Poblar select de jugadores para estadísticas
function populatePlayersSelect() {
    // Esta función se implementará en la fase de estadísticas
}

// Renderizar plantilla
function renderPlantilla() {
    const container = document.getElementById('plantilla-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (appState.jugadores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z"/>
                </svg>
                <h3>No hay jugadores en la plantilla</h3>
                <p>Añade jugadores para comenzar a gestionar tu equipo</p>
            </div>
        `;
        return;
    }
    
    appState.jugadores.forEach(jugador => {
        const jugadorCard = document.createElement('div');
        jugadorCard.className = 'jugador-card';
        jugadorCard.innerHTML = `
            <div class="jugador-card-header">
                <button class="delete-player-btn" data-player-id="${jugador.id}" title="Eliminar jugador">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
            <div class="jugador-card-content">
                <div class="jugador-photo-container">
                    <img src="${jugador.foto}" alt="${jugador.nombre}" class="jugador-photo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINmE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSI5IiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg=='">
                </div>
                <div class="jugador-info">
                    <h3 class="jugador-nombre">${jugador.nombre}</h3>
                </div>
            </div>
        `;
        
        container.appendChild(jugadorCard);
    });
    
    // Configurar eventos de eliminar
    setupDeletePlayerEvents();
}

// Configurar eventos de eliminar jugadores
function setupDeletePlayerEvents() {
    document.querySelectorAll('.delete-player-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const playerId = this.dataset.playerId;
            const jugador = appState.jugadores.find(j => j.id === playerId);
            
            if (jugador && confirm(`¿Estás seguro de que quieres eliminar a ${jugador.nombre} de la plantilla?`)) {
                deletePlayer(playerId);
            }
        });
    });
}

// Eliminar jugador
function deletePlayer(playerId) {
    // Eliminar de la lista de jugadores
    appState.jugadores = appState.jugadores.filter(j => j.id !== playerId);
    
    // Eliminar de todos los partidos
    appState.partidos.forEach(partido => {
        if (partido.jugadores) {
            delete partido.jugadores[playerId];
        }
        if (partido.suplentes) {
            partido.suplentes = partido.suplentes.filter(id => id !== playerId);
        }
    });
    
    // Guardar cambios
    saveData();
    
    // Re-renderizar
    renderPlantilla();
    populatePlayersSelect();
    
    showNotification(`Jugador eliminado correctamente`, 'success');
}

// Configurar navegación entre pestañas
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Actualizar pestañas activas
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            appState.currentTab = targetTab;
            
            // Cargar datos específicos de la pestaña
            loadTabData(targetTab);
        });
    });
}

// Cargar datos específicos de cada pestaña
async function loadTabData(tabName) {
    switch(tabName) {
        case 'historial':
            await loadHistorial();
            break;
        case 'estadisticas':
            await loadEstadisticas();
            break;
        case 'plantilla':
            await loadPlantilla();
            break;
    }
}

// Configurar formularios
function setupForms() {
    // Formulario de crear partido
    const partidoForm = document.getElementById('partido-form');
    const siguienteJugadoresBtn = document.getElementById('siguiente-jugadores');
    const volverDatosBtn = document.getElementById('volver-datos');
    const siguienteCalificacionBtn = document.getElementById('siguiente-calificacion');
    const volverJugadoresBtn = document.getElementById('volver-jugadores');
    const guardarPartidoBtn = document.getElementById('guardar-partido');
    
    // Botón para añadir competición
    const addCompetitionBtn = document.getElementById('add-competition');
    
    // Event listeners
    siguienteJugadoresBtn.addEventListener('click', handleSiguienteJugadores);
    if (volverDatosBtn) volverDatosBtn.addEventListener('click', () => showStep('form-partido'));
    if (siguienteCalificacionBtn) siguienteCalificacionBtn.addEventListener('click', handleSiguienteCalificacion);
    if (volverJugadoresBtn) volverJugadoresBtn.addEventListener('click', () => showStep('seleccion-jugadores'));
    if (guardarPartidoBtn) guardarPartidoBtn.addEventListener('click', handleGuardarPartido);
    addCompetitionBtn.addEventListener('click', showAddCompetitionModal);
    
    // Configurar botones numéricos
    setupNumberInputs();
    
    // Configurar subida de archivos
    setupFileUpload();
    
    // Modal de competición
    setupCompetitionModal();
}

// Configurar inputs numéricos con botones +/-
function setupNumberInputs() {
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            const isPlus = this.classList.contains('plus');
            const isMinus = this.classList.contains('minus');
            
            let currentValue = parseInt(input.value) || 0;
            
            if (isPlus && currentValue < parseInt(input.max)) {
                input.value = currentValue + 1;
            } else if (isMinus && currentValue > parseInt(input.min)) {
                input.value = currentValue - 1;
            }
            
            // Trigger change event
            input.dispatchEvent(new Event('change'));
        });
    });
}

// Configurar subida de archivos
function setupFileUpload() {
    const fileInput = document.getElementById('escudo-rival');
    const fileLabel = document.querySelector('.file-upload-label');
    const filePreview = document.getElementById('escudo-preview');
    const previewImg = document.getElementById('escudo-preview-img');
    const removeBtn = document.getElementById('remove-escudo');
    const uploadText = document.querySelector('.file-upload-text');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                filePreview.style.display = 'flex';
                fileLabel.style.display = 'none';
                uploadText.textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });
    
    removeBtn.addEventListener('click', function() {
        fileInput.value = '';
        filePreview.style.display = 'none';
        fileLabel.style.display = 'flex';
        uploadText.textContent = 'Seleccionar imagen del escudo';
    });
}

// Configurar modal de competición
function setupCompetitionModal() {
    const modal = document.getElementById('modal-competicion');
    const cancelBtn = document.getElementById('cancelar-competicion');
    const guardarBtn = document.getElementById('guardar-competicion');
    const input = document.getElementById('nueva-competicion');
    
    cancelBtn.addEventListener('click', () => hideModal('modal-competicion'));
    guardarBtn.addEventListener('click', handleAddCompetition);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal('modal-competicion');
        }
    });
    
    // Guardar al presionar Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddCompetition();
        }
    });
}

// Mostrar/ocultar pasos del formulario
function showStep(stepName) {
    const steps = ['form-partido', 'seleccion-jugadores', 'calificacion-jugadores'];
    
    steps.forEach(step => {
        const element = document.getElementById(step);
        if (element) {
            element.classList.toggle('hidden', step !== stepName);
        }
    });
    
    appState.currentStep = stepName;
}

// Manejar siguiente paso: seleccionar jugadores
async function handleSiguienteJugadores() {
    const form = document.getElementById('partido-form');
    const formData = new FormData(form);
    
    // Validar formulario
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Manejar el archivo del escudo
    const escudoFile = document.getElementById('escudo-rival').files[0];
    let escudoPath = null;
    
    if (escudoFile) {
        escudoPath = await handleRivalShield(escudoFile, formData.get('rival'));
    }
    
    // Guardar datos del partido
    appState.partidoActual = {
        rival: formData.get('rival'),
        fecha: formData.get('fecha'),
        golesRealMadrid: parseInt(formData.get('goles-madrid')),
        golesRival: parseInt(formData.get('goles-rival')),
        competicion: formData.get('competicion'),
        esLocal: formData.get('ubicacion') === 'local',
        escudoRival: escudoPath
    };
    
    // Mostrar paso de selección de jugadores
    showStep('seleccion-jugadores');
    renderJugadoresSelection();
}

// Renderizar selección de jugadores
function renderJugadoresSelection() {
    const jugadoresContainer = document.getElementById('jugadores-disponibles');
    const suplentesContainer = document.getElementById('suplentes-list');
    const posicionesContainer = document.getElementById('posiciones-campo');
    
    // Limpiar contenedores
    jugadoresContainer.innerHTML = '';
    suplentesContainer.innerHTML = '';
    posicionesContainer.innerHTML = '';
    
    // Renderizar jugadores disponibles (excluyendo entrenador)
    const jugadoresDisponibles = appState.jugadores.filter(j => !j.esEntrenador);
    
    jugadoresDisponibles.forEach(jugador => {
        const jugadorElement = createJugadorElement(jugador);
        jugadoresContainer.appendChild(jugadorElement);
    });
    
    // Renderizar posiciones en el campo
    createCampoPositions();
    
    // Renderizar lista de suplentes
    renderSuplentesCheckboxes();
}

// Crear elemento de jugador
function createJugadorElement(jugador) {
    const div = document.createElement('div');
    div.className = 'jugador-disponible';
    div.draggable = true;
    div.dataset.jugador = jugador.nombre;
    
    div.innerHTML = `
        <img src="fotos_jugadores/${jugador.foto}" 
             alt="${jugador.nombre}" 
             class="jugador-foto"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmMWYzZjQiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM2Yzc1N2QiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
        <div class="jugador-nombre">${jugador.nombre}</div>
    `;
    
    // Eventos de drag & drop
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    
    // Evento de clic para seleccionar/deseleccionar
    div.addEventListener('click', function() {
        // Si ya está seleccionado, quitarlo del campo
        if (this.classList.contains('seleccionado')) {
            this.classList.remove('seleccionado');
            this.style.display = 'block';
            
            // Quitar del campo si está colocado
            const posicionOcupada = document.querySelector(`.posicion-jugador[data-jugador="${jugador.nombre}"]`);
            if (posicionOcupada) {
                posicionOcupada.classList.remove('ocupada');
                posicionOcupada.textContent = posicionOcupada.dataset.posicion;
                delete posicionOcupada.dataset.jugador;
            }
            
            // Remover de titulares
            appState.jugadoresSeleccionados.titulares = appState.jugadoresSeleccionados.titulares.filter(
                t => t.jugador.nombre !== jugador.nombre
            );
            
            // Restaurar checkbox de suplente
            const checkbox = document.getElementById(`suplente-${jugador.nombre}`);
            if (checkbox) {
                checkbox.closest('.suplente-item').style.opacity = '1';
            }
        } else {
            // Buscar una posición libre para colocar el jugador
            const posicionLibre = document.querySelector('.posicion-jugador:not(.ocupada)');
            if (posicionLibre) {
                this.classList.add('seleccionado');
                this.style.display = 'none';
                
                posicionLibre.classList.add('ocupada');
                posicionLibre.textContent = jugador.nombre.split(' ')[0]; // Solo el primer nombre
                posicionLibre.dataset.jugador = jugador.nombre;
                
                // Añadir a titulares
                if (!appState.jugadoresSeleccionados.titulares.find(t => t.jugador.nombre === jugador.nombre)) {
                    appState.jugadoresSeleccionados.titulares.push({
                        jugador: jugador,
                        posicion: posicionLibre.dataset.posicion
                    });
                }
                
                // Desmarcar checkbox de suplente
                const checkbox = document.getElementById(`suplente-${jugador.nombre}`);
                if (checkbox) {
                    checkbox.checked = false;
                    checkbox.closest('.suplente-item').style.opacity = '0.5';
                }
            } else {
                showNotification('No hay posiciones libres en el campo', 'warning');
            }
        }
    });
    
    return div;
}

// Crear posiciones en el campo
function createCampoPositions() {
    const posicionesContainer = document.getElementById('posiciones-campo');
    
    // Posiciones predefinidas para una formación 4-3-3
    const posiciones = [
        // Portero
        { id: 'pos-1', x: 50, y: 90, label: 'POR' },
        // Defensas
        { id: 'pos-2', x: 20, y: 75, label: 'LI' },
        { id: 'pos-3', x: 40, y: 75, label: 'DFC' },
        { id: 'pos-4', x: 60, y: 75, label: 'DFC' },
        { id: 'pos-5', x: 80, y: 75, label: 'LD' },
        // Centrocampistas
        { id: 'pos-6', x: 30, y: 50, label: 'MC' },
        { id: 'pos-7', x: 50, y: 50, label: 'MC' },
        { id: 'pos-8', x: 70, y: 50, label: 'MC' },
        // Delanteros
        { id: 'pos-9', x: 25, y: 25, label: 'EI' },
        { id: 'pos-10', x: 50, y: 25, label: 'DC' },
        { id: 'pos-11', x: 75, y: 25, label: 'ED' }
    ];
    
    posiciones.forEach(pos => {
        const posElement = document.createElement('div');
        posElement.className = 'posicion-jugador';
        posElement.id = pos.id;
        posElement.style.left = `${pos.x}%`;
        posElement.style.top = `${pos.y}%`;
        posElement.style.transform = 'translate(-50%, -50%)';
        posElement.dataset.posicion = pos.label;
        posElement.textContent = pos.label;
        
        // Eventos de drag & drop
        posElement.addEventListener('dragover', handleDragOver);
        posElement.addEventListener('dragleave', handleDragLeave);
        posElement.addEventListener('drop', handleDrop);
        
        // Evento de clic para quitar jugador
        posElement.addEventListener('click', function() {
            if (this.classList.contains('ocupada') && this.dataset.jugador) {
                const jugadorNombre = this.dataset.jugador;
                
                // Restaurar posición
                this.classList.remove('ocupada');
                this.textContent = this.dataset.posicion;
                delete this.dataset.jugador;
                
                // Mostrar jugador en lista disponible
                const jugadorElement = document.querySelector(`[data-jugador="${jugadorNombre}"]`);
                if (jugadorElement) {
                    jugadorElement.style.display = 'block';
                    jugadorElement.classList.remove('seleccionado');
                }
                
                // Remover de titulares
                appState.jugadoresSeleccionados.titulares = appState.jugadoresSeleccionados.titulares.filter(
                    t => t.jugador.nombre !== jugadorNombre
                );
                
                // Restaurar checkbox de suplente
                const checkbox = document.getElementById(`suplente-${jugadorNombre}`);
                if (checkbox) {
                    checkbox.closest('.suplente-item').style.opacity = '1';
                }
            }
        });
        
        posicionesContainer.appendChild(posElement);
    });
}

// Renderizar checkboxes de suplentes
function renderSuplentesCheckboxes() {
    const suplentesContainer = document.getElementById('suplentes-list');
    const jugadoresDisponibles = appState.jugadores.filter(j => !j.esEntrenador);
    
    jugadoresDisponibles.forEach(jugador => {
        const div = document.createElement('div');
        div.className = 'suplente-item';
        
        div.innerHTML = `
            <input type="checkbox" 
                   class="suplente-checkbox" 
                   id="suplente-${jugador.nombre}" 
                   value="${jugador.nombre}">
            <img src="fotos_jugadores/${jugador.foto}" 
                 alt="${jugador.nombre}" 
                 class="jugador-foto"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmMWYzZjQiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM2Yzc1N2QiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
            <div class="jugador-info">
                <div class="jugador-nombre">${jugador.nombre}</div>
                <div class="jugador-posicion">${jugador.posicion}</div>
            </div>
        `;
        
        suplentesContainer.appendChild(div);
    });
}

// Configurar drag and drop
function setupDragAndDrop() {
    // Los eventos se configuran dinámicamente en createJugadorElement
    // y en createCampoPositions para mejor control
}

function handleDragStart(e) {
    if (e.target.closest('.jugador-disponible')) {
        const jugadorElement = e.target.closest('.jugador-disponible');
        appState.draggedPlayer = jugadorElement.dataset.jugador;
        jugadorElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
}

function handleDragOver(e) {
    if (e.target.classList.contains('posicion-jugador') && !e.target.classList.contains('ocupada')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('posicion-jugador')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    if (e.target.classList.contains('posicion-jugador') && appState.draggedPlayer && !e.target.classList.contains('ocupada')) {
        // Remover indicador visual
        e.target.classList.remove('drag-over');
        
        // Marcar posición como ocupada
        e.target.classList.add('ocupada');
        e.target.textContent = appState.draggedPlayer.split(' ')[0]; // Primer nombre
        e.target.dataset.jugador = appState.draggedPlayer;
        
        // Ocultar jugador de la lista disponible
        const jugadorElement = document.querySelector(`[data-jugador="${appState.draggedPlayer}"]`);
        if (jugadorElement) {
            jugadorElement.style.display = 'none';
            jugadorElement.classList.add('seleccionado');
        }
        
        // Desmarcar checkbox de suplente si estaba marcado
        const checkbox = document.getElementById(`suplente-${appState.draggedPlayer}`);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.closest('.suplente-item').style.opacity = '0.5';
        }
        
        // Actualizar estado
        const jugador = appState.jugadores.find(j => j.nombre === appState.draggedPlayer);
        if (jugador && !appState.jugadoresSeleccionados.titulares.find(t => t.jugador.nombre === jugador.nombre)) {
            appState.jugadoresSeleccionados.titulares.push({
                jugador: jugador,
                posicion: e.target.dataset.posicion
            });
        }
    }
}

function handleDragEnd(e) {
    if (e.target.closest('.jugador-disponible')) {
        e.target.closest('.jugador-disponible').classList.remove('dragging');
    }
    
    // Limpiar indicadores visuales
    document.querySelectorAll('.posicion-jugador').forEach(pos => {
        pos.classList.remove('drag-over');
    });
    
    appState.draggedPlayer = null;
}

// Manejar siguiente paso: calificación
function handleSiguienteCalificacion() {
    // Recopilar suplentes seleccionados
    const suplentesCheckboxes = document.querySelectorAll('.suplente-checkbox:checked');
    appState.jugadoresSeleccionados.suplentes = [];
    
    suplentesCheckboxes.forEach(checkbox => {
        const jugador = appState.jugadores.find(j => j.nombre === checkbox.value);
        if (jugador) {
            appState.jugadoresSeleccionados.suplentes.push(jugador);
        }
    });
    
    // Validar que hay al menos 11 jugadores (titulares)
    if (appState.jugadoresSeleccionados.titulares.length !== 11) {
        showNotification('Debes seleccionar exactamente 11 jugadores titulares', 'error');
        return;
    }
    
    // Mostrar paso de calificación
    showStep('calificacion-jugadores');
    renderCalificacionForm();
}

// Renderizar formulario de calificación
function renderCalificacionForm() {
    const container = document.getElementById('calificaciones-container');
    container.innerHTML = '';
    
    // Combinar titulares y suplentes
    const todosLosJugadores = [
        ...appState.jugadoresSeleccionados.titulares.map(t => ({ ...t.jugador, esTitular: true })),
        ...appState.jugadoresSeleccionados.suplentes.map(s => ({ ...s, esTitular: false }))
    ];
    
    todosLosJugadores.forEach(jugador => {
        const div = document.createElement('div');
        div.className = 'calificacion-item';
        
        div.innerHTML = `
            <div class="calificacion-jugador">
                <img src="fotos_jugadores/${jugador.foto}" 
                     alt="${jugador.nombre}" 
                     class="jugador-foto"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmMWYzZjQiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM2Yzc1N2QiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
                <div class="jugador-info">
                    <div class="jugador-nombre">${jugador.nombre}</div>
                    <div class="jugador-posicion">${jugador.posicion} ${jugador.esTitular ? '(Titular)' : '(Suplente)'}</div>
                </div>
            </div>
            <div class="calificacion-nota">
                <input type="number" 
                       min="0" 
                       max="10" 
                       step="0.1" 
                       placeholder="Nota"
                       data-jugador="${jugador.nombre}"
                       data-titular="${jugador.esTitular}">
            </div>
            <div class="calificacion-comentario">
                <input type="text" 
                       placeholder="Comentario (opcional)"
                       data-jugador="${jugador.nombre}">
            </div>
        `;
        
        container.appendChild(div);
    });
}

// Manejar guardar partido
async function handleGuardarPartido() {
    try {
        // Recopilar calificaciones
        const notasInputs = document.querySelectorAll('.calificacion-nota input');
        const comentariosInputs = document.querySelectorAll('.calificacion-comentario input');
        
        const calificaciones = [];
        let sumaNotas = 0;
        let contadorNotas = 0;
        
        notasInputs.forEach((input, index) => {
            const nota = parseFloat(input.value);
            const comentario = comentariosInputs[index].value;
            const jugadorNombre = input.dataset.jugador;
            const esTitular = input.dataset.titular === 'true';
            
            if (!isNaN(nota) && nota >= 0 && nota <= 10) {
                calificaciones.push({
                    jugadorNombre,
                    nota,
                    comentario,
                    esTitular
                });
                
                sumaNotas += nota;
                contadorNotas++;
            }
        });
        
        if (calificaciones.length === 0) {
            showNotification('Debes asignar al menos una nota', 'error');
            return;
        }
        
        // Calcular nota promedio
        const notaPromedio = sumaNotas / contadorNotas;
        
        // Crear objeto partido completo
        const partido = {
            ...appState.partidoActual,
            titulares: appState.jugadoresSeleccionados.titulares,
            suplentesQueJugaron: appState.jugadoresSeleccionados.suplentes.map(s => s.nombre),
            notaPromedioEquipo: Math.round(notaPromedio * 10) / 10,
            calificaciones,
            fechaCreacion: new Date().toISOString()
        };
        
        // Guardar en Firebase (simulado por ahora)
        await savePartidoToFirebase(partido);
        
        // Mostrar mensaje de éxito
        showNotification('Partido guardado correctamente', 'success');
        
        // Resetear formulario y volver al inicio
        resetCrearPartidoForm();
        
        // Cambiar a pestaña de historial
        document.querySelector('[data-tab="historial"]').click();
        
    } catch (error) {
        console.error('Error al guardar partido:', error);
        showNotification('Error al guardar el partido', 'error');
    }
}

// Guardar partido en Firebase (simulado)
async function savePartidoToFirebase(partido) {
    // Por ahora, guardar en localStorage hasta que se configure Firebase
    const partidos = JSON.parse(localStorage.getItem('partidos') || '[]');
    partido.id = Date.now().toString();
    partidos.push(partido);
    localStorage.setItem('partidos', JSON.stringify(partidos));
    
    // Actualizar estado local
    appState.partidos = partidos;
}

// Resetear formulario de crear partido
function resetCrearPartidoForm() {
    // Limpiar formulario
    document.getElementById('partido-form').reset();
    
    // Resetear estado
    appState.partidoActual = null;
    appState.jugadoresSeleccionados = { titulares: [], suplentes: [] };
    appState.calificaciones = [];
    
    // Volver al primer paso
    showStep('form-partido');
}

// Poblar select de competiciones
function populateCompetitionsSelect() {
    const select = document.getElementById('competicion');
    select.innerHTML = '<option value="">Seleccionar competición</option>';
    
    appState.competiciones.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.nombre;
        option.textContent = comp.nombre;
        option.dataset.logo = comp.logo || '';
        select.appendChild(option);
    });
}

// Poblar select de jugadores para estadísticas
function populatePlayersSelect() {
    const select = document.getElementById('jugador-stats');
    if (!select) {
        console.warn('Elemento jugador-stats no encontrado');
        return;
    }
    
    select.innerHTML = '<option value="">Seleccionar jugador</option>';
    
    appState.jugadores.filter(j => !j.esEntrenador).forEach(jugador => {
        const option = document.createElement('option');
        option.value = jugador.nombre;
        option.textContent = jugador.nombre;
        select.appendChild(option);
    });
}

// Mostrar modal para añadir competición
function showAddCompetitionModal() {
    document.getElementById('modal-competicion').classList.remove('hidden');
    document.getElementById('nueva-competicion').focus();
}

// Ocultar modal
function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    if (modalId === 'modal-competicion') {
        document.getElementById('nueva-competicion').value = '';
    }
}

// Manejar añadir nueva competición
function handleAddCompetition() {
    const input = document.getElementById('nueva-competicion');
    const nombre = input.value.trim();
    
    if (!nombre) {
        showNotification('Ingresa el nombre de la competición', 'error');
        return;
    }
    
    // Verificar que no exista ya
    if (appState.competiciones.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        showNotification('Esta competición ya existe', 'error');
        return;
    }
    
    // Añadir nueva competición
    const nuevaCompeticion = { nombre, activa: true };
    appState.competiciones.push(nuevaCompeticion);
    
    // Actualizar select
    populateCompetitionsSelect();
    
    // Seleccionar la nueva competición
    document.getElementById('competicion').value = nombre;
    
    // Cerrar modal
    hideModal('modal-competicion');
    
    showNotification('Competición añadida correctamente', 'success');
}

// Cargar datos desde Firebase
async function loadDataFromFirebase() {
    try {
        // Por ahora, cargar desde localStorage
        const partidos = JSON.parse(localStorage.getItem('partidos') || '[]');
        appState.partidos = partidos;
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// Renderizar plantilla
function renderPlantilla() {
    const container = document.getElementById('plantilla-grid');
    container.innerHTML = '';
    
    appState.jugadores.filter(j => j.activo && !j.esEntrenador).forEach(jugador => {
        const div = document.createElement('div');
        div.className = 'jugador-card-simple';
        
        div.innerHTML = `
            <button class="delete-player-btn" onclick="deletePlayer('${jugador.nombre}')" title="Eliminar jugador">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
            <img src="${getPlayerPhotoUrl(jugador.foto)}" 
                 alt="${jugador.nombre}" 
                 class="jugador-card-foto-simple"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNmMWYzZjQiLz4KPHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNiIgeT0iMTYiPgo8cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIgc3Ryb2tlPSIjNmM3NTdkIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='">
            <div class="jugador-card-nombre-simple">${jugador.nombre}</div>
        `;
        
        // Añadir evento de clic para mostrar estadísticas (solo en la imagen y nombre)
        const img = div.querySelector('.jugador-card-foto-simple');
        const nombre = div.querySelector('.jugador-card-nombre-simple');
        
        [img, nombre].forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                showPlayerStats(jugador.nombre);
            });
        });
        
        container.appendChild(div);
    });
}

// Calcular estadísticas de un jugador
function calculatePlayerStats(jugadorNombre) {
    const calificacionesJugador = [];
    
    appState.partidos.forEach(partido => {
        const calificacion = partido.calificaciones?.find(c => c.jugadorNombre === jugadorNombre);
        if (calificacion && !isNaN(calificacion.nota)) {
            calificacionesJugador.push(calificacion.nota);
        }
    });
    
    const promedio = calificacionesJugador.length > 0 
        ? (calificacionesJugador.reduce((sum, nota) => sum + nota, 0) / calificacionesJugador.length).toFixed(1)
        : '-';
    
    return {
        promedio,
        partidos: calificacionesJugador.length
    };
}

// Cargar historial
async function loadHistorial() {
    const container = document.getElementById('historial-container');
    container.innerHTML = '';
    
    if (appState.partidos.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No hay partidos registrados</p>';
        return;
    }
    
    // Ordenar partidos por fecha (más recientes primero)
    const partidosOrdenados = [...appState.partidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    partidosOrdenados.forEach(partido => {
        const div = document.createElement('div');
        div.className = 'partido-item';
        div.onclick = () => showPartidoDetalle(partido);
        
        // Formatear resultado según ubicación
        const resultado = partido.esLocal 
            ? `${partido.golesRealMadrid} - ${partido.golesRival}`
            : `${partido.golesRival} - ${partido.golesRealMadrid}`;
        
        div.innerHTML = `
            <div class="partido-header">
                <img src="${getRivalShieldUrl(partido.escudoRival) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNmMWYzZjQiLz4KPHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJtMyA5IDktN3Y0aDEzdjZIOXY0eiIgc3Ryb2tlPSIjNmM3NTdkIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+Cg=='}" 
                     alt="${partido.rival}" 
                     class="partido-escudo"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNmMWYzZjQiLz4KPHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJtMyA5IDktN3Y0aDEzdjZIOXY0eiIgc3Ryb2tlPSIjNmM3NTdkIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+Cg=='">
                <div class="partido-info" onclick="showPartidoDetalle(partido)">
                    <div class="partido-rival">${partido.esLocal ? 'vs' : '@'} ${partido.rival}</div>
                    <div class="partido-fecha">${formatDate(partido.fecha)}</div>
                </div>
                <div class="partido-resultado">${resultado}</div>
                <div class="partido-competicion">${partido.competicion}</div>
                <button class="btn-delete-partido" onclick="event.stopPropagation(); deletePartido('${partido.id}')" title="Eliminar partido">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
        
        container.appendChild(div);
    });
}

// Mostrar detalles del partido
function showPartidoDetalle(partido) {
    const modal = document.getElementById('modal-partido-detalle');
    const titulo = document.getElementById('partido-detalle-titulo');
    const contenido = document.getElementById('partido-detalle-contenido');
    
    titulo.textContent = `${partido.esLocal ? 'vs' : '@'} ${partido.rival} - ${formatDate(partido.fecha)}`;
    
    // Crear contenido del modal
    let html = `
        <div style="margin-bottom: 2rem;">
            <h4>Información del Partido</h4>
            <p><strong>Competición:</strong> ${partido.competicion}</p>
            <p><strong>Resultado:</strong> Real Madrid ${partido.golesRealMadrid} - ${partido.golesRival} ${partido.rival}</p>
            <p><strong>Nota promedio del equipo:</strong> ${partido.notaPromedioEquipo}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4>Calificaciones de Jugadores</h4>
            <div style="display: grid; gap: 1rem;">
    `;
    
    if (partido.calificaciones && partido.calificaciones.length > 0) {
        partido.calificaciones.forEach(cal => {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border: 1px solid #e9ecef; border-radius: 0.5rem;">
                    <span><strong>${cal.jugadorNombre}</strong> ${cal.esTitular ? '(T)' : '(S)'}</span>
                    <span style="font-weight: 600; color: #ffd700;">${cal.nota}</span>
                </div>
                ${cal.comentario ? `<p style="font-size: 0.875rem; color: #6c757d; margin-left: 1rem;">${cal.comentario}</p>` : ''}
            `;
        });
    } else {
        html += '<p class="text-muted">No hay calificaciones registradas</p>';
    }
    
    html += '</div></div>';
    
    contenido.innerHTML = html;
    modal.classList.remove('hidden');
    
    // Configurar botón de cerrar
    document.getElementById('cerrar-partido-detalle').onclick = () => {
        modal.classList.add('hidden');
    };
    
    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
}

// Cargar estadísticas
async function loadEstadisticas() {
    const select = document.getElementById('jugador-stats');
    const display = document.getElementById('stats-display');
    
    select.onchange = () => {
        const jugadorNombre = select.value;
        if (jugadorNombre) {
            renderPlayerStats(jugadorNombre);
        } else {
            display.innerHTML = '<p class="text-center text-muted">Selecciona un jugador para ver sus estadísticas</p>';
        }
    };
    
    if (!select.value) {
        display.innerHTML = '<p class="text-center text-muted">Selecciona un jugador para ver sus estadísticas</p>';
    }
}

// Renderizar estadísticas de jugador
function renderPlayerStats(jugadorNombre) {
    const display = document.getElementById('stats-display');
    const jugador = appState.jugadores.find(j => j.nombre === jugadorNombre);
    
    if (!jugador) return;
    
    // Obtener todas las calificaciones del jugador
    const calificaciones = [];
    appState.partidos.forEach(partido => {
        const cal = partido.calificaciones?.find(c => c.jugadorNombre === jugadorNombre);
        if (cal && !isNaN(cal.nota)) {
            calificaciones.push({
                ...cal,
                fecha: partido.fecha,
                rival: partido.rival,
                competicion: partido.competicion
            });
        }
    });
    
    if (calificaciones.length === 0) {
        display.innerHTML = `
            <div class="text-center">
                <h3>${jugador.nombre}</h3>
                <p class="text-muted">No hay datos suficientes para mostrar estadísticas</p>
            </div>
        `;
        return;
    }
    
    // Calcular estadísticas
    const notas = calificaciones.map(c => c.nota);
    const promedio = (notas.reduce((sum, nota) => sum + nota, 0) / notas.length).toFixed(1);
    const notaMaxima = Math.max(...notas);
    const notaMinima = Math.min(...notas);
    
    let html = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <img src="fotos_jugadores/${jugador.foto}" 
                 alt="${jugador.nombre}" 
                 style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZjFmM2Y0Ii8+Cjxzdmcgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeD0iMjAiIHk9IjIwIj4KPHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM2Yzc1N2QiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
            <h3>${jugador.nombre}</h3>
            <p style="color: #6c757d;">${jugador.posicion}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
                <div style="font-size: 2rem; font-weight: 600; color: #ffd700;">${promedio}</div>
                <div style="font-size: 0.875rem; color: #6c757d;">Promedio</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
                <div style="font-size: 2rem; font-weight: 600; color: #28a745;">${notaMaxima}</div>
                <div style="font-size: 0.875rem; color: #6c757d;">Mejor Nota</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
                <div style="font-size: 2rem; font-weight: 600; color: #dc3545;">${notaMinima}</div>
                <div style="font-size: 0.875rem; color: #6c757d;">Peor Nota</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
                <div style="font-size: 2rem; font-weight: 600; color: #1a1a1a;">${calificaciones.length}</div>
                <div style="font-size: 0.875rem; color: #6c757d;">Partidos</div>
            </div>
        </div>
        
        <div>
            <h4 style="margin-bottom: 1rem;">Últimos Partidos</h4>
            <div style="display: grid; gap: 0.5rem;">
    `;
    
    // Mostrar últimos 5 partidos
    const ultimosPartidos = calificaciones.slice(-5).reverse();
    ultimosPartidos.forEach(cal => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #e9ecef; border-radius: 0.5rem;">
                <div>
                    <strong>${cal.rival}</strong>
                    <div style="font-size: 0.875rem; color: #6c757d;">${formatDate(cal.fecha)} - ${cal.competicion}</div>
                </div>
                <div style="font-size: 1.25rem; font-weight: 600; color: #ffd700;">${cal.nota}</div>
            </div>
        `;
    });
    
    html += '</div></div>';
    
    display.innerHTML = html;
}

// Cargar plantilla
async function loadPlantilla() {
    renderPlantilla();
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return dateString;
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        max-width: 300px;
    `;
    
    // Colores según tipo
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#1a1a1a';
            break;
        default:
            notification.style.backgroundColor = '#6c757d';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}


// ===== GESTIÓN DE JUGADORES =====

// Configurar eventos de gestión de jugadores
function setupPlayerManagement() {
    const addPlayerBtn = document.getElementById('add-player-btn');
    const managePlayersBtn = document.getElementById('manage-players-btn');
    const saveAddPlayerBtn = document.getElementById('save-add-player');
    const cancelAddPlayerBtn = document.getElementById('cancel-add-player');
    const closeManagePlayersBtn = document.getElementById('close-manage-players');

    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', showAddPlayerModal);
    }
    
    if (managePlayersBtn) {
        managePlayersBtn.addEventListener('click', showManagePlayersModal);
    }
    
    if (saveAddPlayerBtn) {
        saveAddPlayerBtn.addEventListener('click', saveNewPlayer);
    }
    
    if (cancelAddPlayerBtn) {
        cancelAddPlayerBtn.addEventListener('click', hideAddPlayerModal);
    }
    
    if (closeManagePlayersBtn) {
        closeManagePlayersBtn.addEventListener('click', hideManagePlayersModal);
    }
}

// Mostrar modal para añadir jugador
function showAddPlayerModal() {
    const modal = document.getElementById('modal-add-player');
    if (modal) {
        modal.classList.remove('hidden');
        // Limpiar formulario
        document.getElementById('player-name').value = '';
        document.getElementById('player-photo').value = '';
    }
}

// Ocultar modal para añadir jugador
function hideAddPlayerModal() {
    const modal = document.getElementById('modal-add-player');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Guardar nuevo jugador
async function saveNewPlayer() {
    const name = document.getElementById('player-name').value.trim();
    const photoFile = document.getElementById('player-photo').files[0];
    
    if (!name) {
        showNotification('El nombre del jugador es obligatorio', 'error');
        return;
    }
    
    // Verificar si el jugador ya existe
    const existingPlayer = appState.jugadores.find(j => j.nombre.toLowerCase() === name.toLowerCase());
    if (existingPlayer) {
        showNotification('Ya existe un jugador con ese nombre', 'error');
        return;
    }
    
    try {
        let photoPath = 'fotos_jugadores/default-player.png'; // Imagen por defecto
        
        // Si se subió una foto, convertirla a base64 o guardarla localmente
        if (photoFile) {
            photoPath = await handlePlayerPhoto(photoFile, name);
        }
        
        const newPlayer = {
            nombre: name,
            foto: photoPath,
            activo: true
        };
        
        // Añadir al estado
        appState.jugadores.push(newPlayer);
        
        // Guardar en Firebase
        await saveDataToFirebase();
        
        // Actualizar interfaz
        renderPlantilla();
        
        // Cerrar modal
        hideAddPlayerModal();
        
        showNotification('Jugador añadido correctamente', 'success');
        
    } catch (error) {
        console.error('Error al guardar jugador:', error);
        showNotification('Error al guardar el jugador', 'error');
    }
}

// Manejar la foto del jugador
async function handlePlayerPhoto(file, playerName) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Guardar como base64 en localStorage para simplicidad
            const photoData = e.target.result;
            const photoKey = `player_photo_${playerName.replace(/\s+/g, '_')}`;
            localStorage.setItem(photoKey, photoData);
            resolve(photoKey);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Mostrar modal para gestionar jugadores
function showManagePlayersModal() {
    const modal = document.getElementById('modal-manage-players');
    const list = document.getElementById('players-management-list');
    
    if (modal && list) {
        renderPlayersManagementList();
        modal.classList.remove('hidden');
    }
}

// Ocultar modal para gestionar jugadores
function hideManagePlayersModal() {
    const modal = document.getElementById('modal-manage-players');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Renderizar lista de jugadores para gestionar
function renderPlayersManagementList() {
    const list = document.getElementById('players-management-list');
    if (!list) return;
    
    const activeJugadores = appState.jugadores.filter(j => j.activo && !j.esEntrenador);
    
    list.innerHTML = activeJugadores.map(jugador => `
        <div class="player-management-item">
            <div class="player-info">
                <img src="${getPlayerPhotoUrl(jugador.foto)}" alt="${jugador.nombre}" class="player-photo-small">
                <div class="player-details">
                    <h4>${jugador.nombre}</h4>
                </div>
            </div>
            <div class="player-actions">
                <button class="btn-danger btn-small" onclick="removePlayer('${jugador.nombre}')">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Eliminar jugador
async function removePlayer(playerName) {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${playerName}?`)) {
        return;
    }
    
    try {
        // Marcar como inactivo en lugar de eliminar completamente
        const playerIndex = appState.jugadores.findIndex(j => j.nombre === playerName);
        if (playerIndex !== -1) {
            appState.jugadores[playerIndex].activo = false;
            
            // Guardar en Firebase
            await saveDataToFirebase();
            
            // Actualizar interfaces
            renderPlantilla();
            renderPlayersManagementList();
            
            showNotification(`${playerName} ha sido eliminado de la plantilla`, 'success');
        }
    } catch (error) {
        console.error('Error al eliminar jugador:', error);
        showNotification('Error al eliminar el jugador', 'error');
    }
}

// Obtener URL de la foto del jugador
function getPlayerPhotoUrl(photoPath) {
    // Si es una clave de localStorage (foto subida por el usuario)
    if (photoPath.startsWith('player_photo_')) {
        const photoData = localStorage.getItem(photoPath);
        return photoData || 'fotos_jugadores/default-player.png';
    }
    
    // Si es una ruta normal
    return photoPath || 'fotos_jugadores/default-player.png';
}

// Inicializar gestión de jugadores cuando se carga la app
document.addEventListener('DOMContentLoaded', function() {
    setupPlayerManagement();
});



// Manejar el escudo del rival
async function handleRivalShield(file, rivalName) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Guardar como base64 en localStorage
            const shieldData = e.target.result;
            const shieldKey = `rival_shield_${rivalName.replace(/\s+/g, '_')}_${Date.now()}`;
            localStorage.setItem(shieldKey, shieldData);
            resolve(shieldKey);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Obtener URL del escudo del rival
function getRivalShieldUrl(shieldPath) {
    if (!shieldPath) return null;
    
    // Si es una clave de localStorage
    if (shieldPath.startsWith('rival_shield_')) {
        return localStorage.getItem(shieldPath);
    }
    
    // Si es una URL normal
    return shieldPath;
}


// ===== ESTADÍSTICAS AVANZADAS =====

// Configurar controles de estadísticas
function setupAdvancedStats() {
    const statsType = document.getElementById('stats-type');
    const playerSelector = document.getElementById('player-selector');
    const comparisonSelector = document.getElementById('comparison-selector');
    const competitionSelector = document.getElementById('competition-selector');
    
    if (statsType) {
        statsType.addEventListener('change', handleStatsTypeChange);
    }
    
    // Configurar selectores
    const jugadorStats = document.getElementById('jugador-stats');
    const player1Comparison = document.getElementById('player1-comparison');
    const player2Comparison = document.getElementById('player2-comparison');
    const competitionStats = document.getElementById('competition-stats');
    
    if (jugadorStats) {
        jugadorStats.addEventListener('change', () => {
            if (statsType.value === 'individual' && jugadorStats.value) {
                renderIndividualPlayerStats(jugadorStats.value);
            }
        });
    }
    
    if (player1Comparison && player2Comparison) {
        const handleComparison = () => {
            if (player1Comparison.value && player2Comparison.value) {
                renderPlayerComparison(player1Comparison.value, player2Comparison.value);
            }
        };
        player1Comparison.addEventListener('change', handleComparison);
        player2Comparison.addEventListener('change', handleComparison);
    }
    
    if (competitionStats) {
        competitionStats.addEventListener('change', () => {
            renderCompetitionStats(competitionStats.value);
        });
    }
    
    // Poblar selectores
    populateStatsSelectors();
}

// Manejar cambio de tipo de estadística
function handleStatsTypeChange() {
    const statsType = document.getElementById('stats-type').value;
    const playerSelector = document.getElementById('player-selector');
    const comparisonSelector = document.getElementById('comparison-selector');
    const competitionSelector = document.getElementById('competition-selector');
    const display = document.getElementById('stats-display');
    
    // Ocultar todos los selectores
    playerSelector.classList.add('hidden');
    comparisonSelector.classList.add('hidden');
    competitionSelector.classList.add('hidden');
    
    // Mostrar selector apropiado
    switch(statsType) {
        case 'individual':
            playerSelector.classList.remove('hidden');
            display.innerHTML = '<p class="text-center text-muted">Selecciona un jugador para ver sus estadísticas</p>';
            break;
        case 'team':
            renderTeamStats();
            break;
        case 'comparison':
            comparisonSelector.classList.remove('hidden');
            display.innerHTML = '<p class="text-center text-muted">Selecciona dos jugadores para compararlos</p>';
            break;
        case 'competition':
            competitionSelector.classList.remove('hidden');
            display.innerHTML = '<p class="text-center text-muted">Selecciona una competición para ver las estadísticas</p>';
            break;
    }
}

// Poblar selectores de estadísticas
function populateStatsSelectors() {
    const activeJugadores = appState.jugadores.filter(j => j.activo && !j.esEntrenador);
    
    // Selector individual
    const jugadorStats = document.getElementById('jugador-stats');
    if (jugadorStats) {
        jugadorStats.innerHTML = '<option value="">Seleccionar jugador</option>';
        activeJugadores.forEach(jugador => {
            const option = document.createElement('option');
            option.value = jugador.nombre;
            option.textContent = jugador.nombre;
            jugadorStats.appendChild(option);
        });
    }
    
    // Selectores de comparación
    const player1 = document.getElementById('player1-comparison');
    const player2 = document.getElementById('player2-comparison');
    if (player1 && player2) {
        [player1, player2].forEach(select => {
            select.innerHTML = '<option value="">Seleccionar jugador</option>';
            activeJugadores.forEach(jugador => {
                const option = document.createElement('option');
                option.value = jugador.nombre;
                option.textContent = jugador.nombre;
                select.appendChild(option);
            });
        });
    }
    
    // Selector de competiciones
    const competitionStats = document.getElementById('competition-stats');
    if (competitionStats) {
        competitionStats.innerHTML = '<option value="">Todas las competiciones</option>';
        appState.competiciones.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.nombre;
            option.textContent = comp.nombre;
            competitionStats.appendChild(option);
        });
    }
}

// Renderizar estadísticas individuales de jugador
function renderIndividualPlayerStats(jugadorNombre) {
    const display = document.getElementById('stats-display');
    const jugador = appState.jugadores.find(j => j.nombre === jugadorNombre);
    
    if (!jugador) return;
    
    // Obtener todas las calificaciones del jugador
    const calificaciones = [];
    appState.partidos.forEach(partido => {
        const cal = partido.calificaciones?.find(c => c.jugadorNombre === jugadorNombre);
        if (cal && !isNaN(cal.nota)) {
            calificaciones.push({
                nota: parseFloat(cal.nota),
                fecha: partido.fecha,
                rival: partido.rival,
                competicion: partido.competicion,
                esTitular: cal.esTitular
            });
        }
    });
    
    if (calificaciones.length === 0) {
        display.innerHTML = '<p class="text-center text-muted">No hay datos suficientes para mostrar estadísticas</p>';
        return;
    }
    
    // Calcular estadísticas
    const promedio = (calificaciones.reduce((sum, cal) => sum + cal.nota, 0) / calificaciones.length).toFixed(2);
    const mejorNota = Math.max(...calificaciones.map(c => c.nota));
    const peorNota = Math.min(...calificaciones.map(c => c.nota));
    const partidosComoTitular = calificaciones.filter(c => c.esTitular).length;
    const partidosComoSuplente = calificaciones.length - partidosComoTitular;
    
    // Estadísticas por competición
    const porCompeticion = {};
    calificaciones.forEach(cal => {
        if (!porCompeticion[cal.competicion]) {
            porCompeticion[cal.competicion] = [];
        }
        porCompeticion[cal.competicion].push(cal.nota);
    });
    
    const statsCompeticion = Object.keys(porCompeticion).map(comp => ({
        competicion: comp,
        partidos: porCompeticion[comp].length,
        promedio: (porCompeticion[comp].reduce((sum, nota) => sum + nota, 0) / porCompeticion[comp].length).toFixed(2)
    }));
    
    // Últimos 5 partidos
    const ultimos5 = calificaciones.slice(-5).reverse();
    
    display.innerHTML = `
        <div class="player-stats-container">
            <div class="stats-header">
                <img src="${getPlayerPhotoUrl(jugador.foto)}" alt="${jugador.nombre}" class="stats-player-photo">
                <div class="stats-player-info">
                    <h3>${jugador.nombre}</h3>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${promedio}</div>
                    <div class="stat-label">Promedio General</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${calificaciones.length}</div>
                    <div class="stat-label">Partidos Jugados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${mejorNota}</div>
                    <div class="stat-label">Mejor Nota</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${peorNota}</div>
                    <div class="stat-label">Peor Nota</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${partidosComoTitular}</div>
                    <div class="stat-label">Como Titular</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${partidosComoSuplente}</div>
                    <div class="stat-label">Como Suplente</div>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Rendimiento por Competición</h4>
                <div class="competition-stats">
                    ${statsCompeticion.map(stat => `
                        <div class="competition-stat-item">
                            <span class="competition-name">${stat.competicion}</span>
                            <span class="competition-games">${stat.partidos} partidos</span>
                            <span class="competition-avg">${stat.promedio} promedio</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Últimos 5 Partidos</h4>
                <div class="recent-games">
                    ${ultimos5.map(cal => `
                        <div class="recent-game-item">
                            <div class="game-info">
                                <span class="game-rival">${cal.rival}</span>
                                <span class="game-date">${formatDate(cal.fecha)}</span>
                                <span class="game-competition">${cal.competicion}</span>
                            </div>
                            <div class="game-rating ${cal.nota >= 7 ? 'good' : cal.nota >= 5 ? 'average' : 'poor'}">${cal.nota}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Evolución de Rendimiento</h4>
                <div class="performance-chart">
                    ${renderSimpleChart(calificaciones)}
                </div>
            </div>
        </div>
    `;
}

// Renderizar estadísticas del equipo
function renderTeamStats() {
    const display = document.getElementById('stats-display');
    
    if (appState.partidos.length === 0) {
        display.innerHTML = '<p class="text-center text-muted">No hay partidos registrados</p>';
        return;
    }
    
    // Calcular estadísticas generales del equipo
    const totalPartidos = appState.partidos.length;
    const victorias = appState.partidos.filter(p => p.golesRealMadrid > p.golesRival).length;
    const empates = appState.partidos.filter(p => p.golesRealMadrid === p.golesRival).length;
    const derrotas = totalPartidos - victorias - empates;
    
    const golesAFavor = appState.partidos.reduce((sum, p) => sum + p.golesRealMadrid, 0);
    const golesEnContra = appState.partidos.reduce((sum, p) => sum + p.golesRival, 0);
    
    // Promedio de notas del equipo
    const notasEquipo = appState.partidos
        .filter(p => p.notaPromedioEquipo && !isNaN(p.notaPromedioEquipo))
        .map(p => parseFloat(p.notaPromedioEquipo));
    
    const promedioEquipo = notasEquipo.length > 0 
        ? (notasEquipo.reduce((sum, nota) => sum + nota, 0) / notasEquipo.length).toFixed(2)
        : 'N/A';
    
    // Mejores y peores jugadores
    const jugadorStats = {};
    appState.partidos.forEach(partido => {
        if (partido.calificaciones) {
            partido.calificaciones.forEach(cal => {
                if (!isNaN(cal.nota)) {
                    if (!jugadorStats[cal.jugadorNombre]) {
                        jugadorStats[cal.jugadorNombre] = [];
                    }
                    jugadorStats[cal.jugadorNombre].push(parseFloat(cal.nota));
                }
            });
        }
    });
    
    const jugadoresConPromedio = Object.keys(jugadorStats)
        .map(nombre => ({
            nombre,
            promedio: (jugadorStats[nombre].reduce((sum, nota) => sum + nota, 0) / jugadorStats[nombre].length).toFixed(2),
            partidos: jugadorStats[nombre].length
        }))
        .filter(j => j.partidos >= 3) // Solo jugadores con al menos 3 partidos
        .sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio));
    
    const mejoresJugadores = jugadoresConPromedio.slice(0, 5);
    const peoresJugadores = jugadoresConPromedio.slice(-3).reverse();
    
    display.innerHTML = `
        <div class="team-stats-container">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${totalPartidos}</div>
                    <div class="stat-label">Partidos Jugados</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-number">${victorias}</div>
                    <div class="stat-label">Victorias</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-number">${empates}</div>
                    <div class="stat-label">Empates</div>
                </div>
                <div class="stat-card error">
                    <div class="stat-number">${derrotas}</div>
                    <div class="stat-label">Derrotas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${golesAFavor}</div>
                    <div class="stat-label">Goles a Favor</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${golesEnContra}</div>
                    <div class="stat-label">Goles en Contra</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${promedioEquipo}</div>
                    <div class="stat-label">Promedio del Equipo</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${((victorias / totalPartidos) * 100).toFixed(1)}%</div>
                    <div class="stat-label">% de Victorias</div>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Mejores Jugadores (Promedio)</h4>
                <div class="player-ranking">
                    ${mejoresJugadores.map((jugador, index) => `
                        <div class="ranking-item">
                            <span class="ranking-position">${index + 1}</span>
                            <span class="ranking-name">${jugador.nombre}</span>
                            <span class="ranking-games">${jugador.partidos} partidos</span>
                            <span class="ranking-avg">${jugador.promedio}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Jugadores que Necesitan Mejorar</h4>
                <div class="player-ranking">
                    ${peoresJugadores.map((jugador, index) => `
                        <div class="ranking-item">
                            <span class="ranking-name">${jugador.nombre}</span>
                            <span class="ranking-games">${jugador.partidos} partidos</span>
                            <span class="ranking-avg">${jugador.promedio}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Renderizar comparación de jugadores
function renderPlayerComparison(player1Name, player2Name) {
    const display = document.getElementById('stats-display');
    
    const player1Stats = calculateDetailedPlayerStats(player1Name);
    const player2Stats = calculateDetailedPlayerStats(player2Name);
    
    if (!player1Stats.partidos || !player2Stats.partidos) {
        display.innerHTML = '<p class="text-center text-muted">Uno o ambos jugadores no tienen suficientes datos</p>';
        return;
    }
    
    display.innerHTML = `
        <div class="comparison-container">
            <div class="comparison-header">
                <div class="comparison-player">
                    <img src="${getPlayerPhotoUrl(appState.jugadores.find(j => j.nombre === player1Name)?.foto)}" alt="${player1Name}" class="comparison-photo">
                    <h3>${player1Name}</h3>
                </div>
                <div class="vs-divider">VS</div>
                <div class="comparison-player">
                    <img src="${getPlayerPhotoUrl(appState.jugadores.find(j => j.nombre === player2Name)?.foto)}" alt="${player2Name}" class="comparison-photo">
                    <h3>${player2Name}</h3>
                </div>
            </div>
            
            <div class="comparison-stats">
                ${renderComparisonStat('Promedio General', player1Stats.promedio, player2Stats.promedio, 'higher')}
                ${renderComparisonStat('Partidos Jugados', player1Stats.partidos, player2Stats.partidos, 'higher')}
                ${renderComparisonStat('Mejor Nota', player1Stats.mejorNota, player2Stats.mejorNota, 'higher')}
                ${renderComparisonStat('Peor Nota', player1Stats.peorNota, player2Stats.peorNota, 'higher')}
                ${renderComparisonStat('Como Titular', player1Stats.comoTitular, player2Stats.comoTitular, 'higher')}
                ${renderComparisonStat('Como Suplente', player1Stats.comoSuplente, player2Stats.comoSuplente, 'lower')}
            </div>
        </div>
    `;
}

// Renderizar estadística de comparación
function renderComparisonStat(label, value1, value2, betterWhen) {
    const val1 = parseFloat(value1) || 0;
    const val2 = parseFloat(value2) || 0;
    
    let winner1 = false, winner2 = false;
    
    if (betterWhen === 'higher') {
        winner1 = val1 > val2;
        winner2 = val2 > val1;
    } else {
        winner1 = val1 < val2;
        winner2 = val2 < val1;
    }
    
    return `
        <div class="comparison-stat-row">
            <div class="comparison-value ${winner1 ? 'winner' : ''}">${value1}</div>
            <div class="comparison-label">${label}</div>
            <div class="comparison-value ${winner2 ? 'winner' : ''}">${value2}</div>
        </div>
    `;
}

// Calcular estadísticas detalladas de un jugador
function calculateDetailedPlayerStats(jugadorNombre) {
    const calificaciones = [];
    appState.partidos.forEach(partido => {
        const cal = partido.calificaciones?.find(c => c.jugadorNombre === jugadorNombre);
        if (cal && !isNaN(cal.nota)) {
            calificaciones.push({
                nota: parseFloat(cal.nota),
                esTitular: cal.esTitular
            });
        }
    });
    
    if (calificaciones.length === 0) {
        return { partidos: 0 };
    }
    
    return {
        partidos: calificaciones.length,
        promedio: (calificaciones.reduce((sum, cal) => sum + cal.nota, 0) / calificaciones.length).toFixed(2),
        mejorNota: Math.max(...calificaciones.map(c => c.nota)),
        peorNota: Math.min(...calificaciones.map(c => c.nota)),
        comoTitular: calificaciones.filter(c => c.esTitular).length,
        comoSuplente: calificaciones.filter(c => !c.esTitular).length
    };
}

// Renderizar estadísticas por competición
function renderCompetitionStats(competicion) {
    const display = document.getElementById('stats-display');
    
    const partidosCompeticion = competicion 
        ? appState.partidos.filter(p => p.competicion === competicion)
        : appState.partidos;
    
    if (partidosCompeticion.length === 0) {
        display.innerHTML = '<p class="text-center text-muted">No hay partidos en esta competición</p>';
        return;
    }
    
    // Estadísticas de la competición
    const victorias = partidosCompeticion.filter(p => p.golesRealMadrid > p.golesRival).length;
    const empates = partidosCompeticion.filter(p => p.golesRealMadrid === p.golesRival).length;
    const derrotas = partidosCompeticion.length - victorias - empates;
    
    // Mejores jugadores en esta competición
    const jugadorStats = {};
    partidosCompeticion.forEach(partido => {
        if (partido.calificaciones) {
            partido.calificaciones.forEach(cal => {
                if (!isNaN(cal.nota)) {
                    if (!jugadorStats[cal.jugadorNombre]) {
                        jugadorStats[cal.jugadorNombre] = [];
                    }
                    jugadorStats[cal.jugadorNombre].push(parseFloat(cal.nota));
                }
            });
        }
    });
    
    const mejoresEnCompeticion = Object.keys(jugadorStats)
        .map(nombre => ({
            nombre,
            promedio: (jugadorStats[nombre].reduce((sum, nota) => sum + nota, 0) / jugadorStats[nombre].length).toFixed(2),
            partidos: jugadorStats[nombre].length
        }))
        .filter(j => j.partidos >= 2)
        .sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio))
        .slice(0, 10);
    
    display.innerHTML = `
        <div class="competition-stats-container">
            <h3>${competicion || 'Todas las Competiciones'}</h3>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${partidosCompeticion.length}</div>
                    <div class="stat-label">Partidos</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-number">${victorias}</div>
                    <div class="stat-label">Victorias</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-number">${empates}</div>
                    <div class="stat-label">Empates</div>
                </div>
                <div class="stat-card error">
                    <div class="stat-number">${derrotas}</div>
                    <div class="stat-label">Derrotas</div>
                </div>
            </div>
            
            <div class="stats-section">
                <h4>Mejores Jugadores en esta Competición</h4>
                <div class="player-ranking">
                    ${mejoresEnCompeticion.map((jugador, index) => `
                        <div class="ranking-item">
                            <span class="ranking-position">${index + 1}</span>
                            <span class="ranking-name">${jugador.nombre}</span>
                            <span class="ranking-games">${jugador.partidos} partidos</span>
                            <span class="ranking-avg">${jugador.promedio}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Renderizar gráfico simple (ASCII)
function renderSimpleChart(calificaciones) {
    if (calificaciones.length === 0) return '<p>No hay datos para mostrar</p>';
    
    const maxPoints = 10;
    const chartHeight = 8;
    const chartWidth = Math.min(calificaciones.length, 20);
    
    const dataPoints = calificaciones.slice(-chartWidth);
    
    let chart = '<div class="ascii-chart">';
    
    for (let row = chartHeight; row >= 0; row--) {
        const threshold = (row / chartHeight) * maxPoints;
        let line = `<div class="chart-row">`;
        
        for (let col = 0; col < dataPoints.length; col++) {
            const value = dataPoints[col].nota;
            const char = value >= threshold ? '█' : ' ';
            line += `<span class="chart-cell ${value >= 7 ? 'good' : value >= 5 ? 'average' : 'poor'}">${char}</span>`;
        }
        
        line += `<span class="chart-label">${threshold.toFixed(1)}</span></div>`;
        chart += line;
    }
    
    chart += '</div>';
    return chart;
}

// Inicializar estadísticas avanzadas
document.addEventListener('DOMContentLoaded', function() {
    setupAdvancedStats();
});


// ===== ELIMINACIÓN DE PARTIDOS =====

// Función para eliminar un partido
function deletePartido(partidoId) {
    // Buscar el partido
    const partidoIndex = appState.partidos.findIndex(p => p.id === partidoId);
    
    if (partidoIndex === -1) {
        showNotification('Partido no encontrado', 'error');
        return;
    }
    
    const partido = appState.partidos[partidoIndex];
    
    // Mostrar confirmación
    const confirmacion = confirm(
        `¿Estás seguro de que quieres eliminar el partido contra ${partido.rival} del ${formatDate(partido.fecha)}?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmacion) {
        return;
    }
    
    // Eliminar el partido del array
    appState.partidos.splice(partidoIndex, 1);
    
    // Guardar en localStorage
    saveToLocalStorage();
    
    // Actualizar la vista del historial
    loadHistorial();
    
    // Mostrar notificación de éxito
    showNotification('Partido eliminado correctamente', 'success');
    
    // Actualizar estadísticas si estamos en esa pestaña
    if (appState.currentTab === 'estadisticas') {
        populateStatsSelectors();
        
        // Limpiar la vista de estadísticas
        const display = document.getElementById('stats-display');
        if (display) {
            display.innerHTML = '<p class="text-center text-muted">Selecciona un tipo de análisis para ver las estadísticas</p>';
        }
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 100);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('notification-show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}


// ===== ESTADÍSTICAS DE JUGADOR ===== 

// Función para mostrar estadísticas de un jugador
function showPlayerStats(jugadorNombre) {
    const jugador = appState.jugadores.find(j => j.nombre === jugadorNombre);
    if (!jugador) {
        showNotification('Jugador no encontrado', 'error');
        return;
    }

    // Calcular estadísticas del jugador
    const playerMatches = [];
    let totalRating = 0;
    let matchCount = 0;
    let bestRating = 0;
    let worstRating = 10;

    appState.partidos.forEach(partido => {
        const calificacion = partido.calificaciones?.find(c => c.jugadorNombre === jugadorNombre);
        if (calificacion && !isNaN(calificacion.nota)) {
            playerMatches.push({
                partido: partido,
                calificacion: calificacion
            });
            
            totalRating += calificacion.nota;
            matchCount++;
            
            if (calificacion.nota > bestRating) {
                bestRating = calificacion.nota;
            }
            if (calificacion.nota < worstRating) {
                worstRating = calificacion.nota;
            }
        }
    });

    const averageRating = matchCount > 0 ? (totalRating / matchCount).toFixed(1) : '-';
    
    // Actualizar el modal
    const modal = document.getElementById('modal-player-stats');
    const photo = document.getElementById('player-stats-photo');
    const name = document.getElementById('player-stats-name');
    const summary = document.getElementById('player-stats-summary');
    const matchesList = document.getElementById('player-matches-list');

    // Configurar foto y nombre
    photo.src = getPlayerPhotoUrl(jugador.foto);
    photo.alt = jugador.nombre;
    photo.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNmMWYzZjQiLz4KPHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNiIgeT0iMTYiPgo8cGF0aCBkPSJNMjAgMjF2LTJhNCA0IDAgMCAwLTQtNEg4YTQgNCAwIDAgMC00IDR2MiIgc3Ryb2tlPSIjNmM3NTdkIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0iIzZjNzU3ZCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo=';
    };
    name.textContent = jugador.nombre;

    // Configurar estadísticas resumen
    summary.innerHTML = `
        <div class="summary-stat">
            <div class="summary-stat-value">${averageRating}</div>
            <div class="summary-stat-label">Promedio</div>
        </div>
        <div class="summary-stat">
            <div class="summary-stat-value">${matchCount}</div>
            <div class="summary-stat-label">Partidos</div>
        </div>
        <div class="summary-stat">
            <div class="summary-stat-value">${matchCount > 0 ? bestRating.toFixed(1) : '-'}</div>
            <div class="summary-stat-label">Mejor Nota</div>
        </div>
        <div class="summary-stat">
            <div class="summary-stat-value">${matchCount > 0 ? worstRating.toFixed(1) : '-'}</div>
            <div class="summary-stat-label">Peor Nota</div>
        </div>
    `;

    // Configurar lista de partidos
    if (playerMatches.length === 0) {
        matchesList.innerHTML = '<p class="text-center text-muted">No hay partidos registrados para este jugador</p>';
    } else {
        // Ordenar partidos por fecha (más recientes primero)
        playerMatches.sort((a, b) => new Date(b.partido.fecha) - new Date(a.partido.fecha));
        
        matchesList.innerHTML = playerMatches.map(match => `
            <div class="player-match-item">
                <div class="player-match-info">
                    <div class="player-match-opponent">
                        ${match.partido.esLocal ? 'vs' : '@'} ${match.partido.rival}
                    </div>
                    <div class="player-match-date">
                        ${formatDate(match.partido.fecha)} - ${match.partido.competicion}
                    </div>
                    ${match.calificacion.comentario ? `<div style="font-size: 0.75rem; color: var(--color-gray-500); margin-top: 0.25rem;">${match.calificacion.comentario}</div>` : ''}
                </div>
                <div class="player-match-rating">
                    ${match.calificacion.nota.toFixed(1)}
                </div>
            </div>
        `).join('');
    }

    // Mostrar el modal
    modal.classList.remove('hidden');
}

// Event listeners para el modal de estadísticas de jugador
document.addEventListener('DOMContentLoaded', function() {
    const closePlayerStatsBtn = document.getElementById('close-player-stats');
    const playerStatsModal = document.getElementById('modal-player-stats');

    if (closePlayerStatsBtn) {
        closePlayerStatsBtn.addEventListener('click', function() {
            playerStatsModal.classList.add('hidden');
        });
    }

    // Cerrar modal al hacer clic fuera
    if (playerStatsModal) {
        playerStatsModal.addEventListener('click', function(e) {
            if (e.target === playerStatsModal) {
                playerStatsModal.classList.add('hidden');
            }
        });
    }
});


// ===== SISTEMA DE FORMACIONES =====

// Definiciones de formaciones
const FORMACIONES = {
    '4-3-3': [
        // Portero
        { id: 'pos-1', x: 50, y: 90, label: 'POR' },
        // Defensas
        { id: 'pos-2', x: 20, y: 75, label: 'LI' },
        { id: 'pos-3', x: 40, y: 75, label: 'DFC' },
        { id: 'pos-4', x: 60, y: 75, label: 'DFC' },
        { id: 'pos-5', x: 80, y: 75, label: 'LD' },
        // Centrocampistas
        { id: 'pos-6', x: 30, y: 50, label: 'MC' },
        { id: 'pos-7', x: 50, y: 50, label: 'MC' },
        { id: 'pos-8', x: 70, y: 50, label: 'MC' },
        // Delanteros
        { id: 'pos-9', x: 25, y: 25, label: 'EI' },
        { id: 'pos-10', x: 50, y: 25, label: 'DC' },
        { id: 'pos-11', x: 75, y: 25, label: 'ED' }
    ],
    '4-4-2': [
        // Portero
        { id: 'pos-1', x: 50, y: 90, label: 'POR' },
        // Defensas
        { id: 'pos-2', x: 20, y: 75, label: 'LI' },
        { id: 'pos-3', x: 40, y: 75, label: 'DFC' },
        { id: 'pos-4', x: 60, y: 75, label: 'DFC' },
        { id: 'pos-5', x: 80, y: 75, label: 'LD' },
        // Centrocampistas
        { id: 'pos-6', x: 25, y: 50, label: 'MI' },
        { id: 'pos-7', x: 45, y: 50, label: 'MC' },
        { id: 'pos-8', x: 55, y: 50, label: 'MC' },
        { id: 'pos-9', x: 75, y: 50, label: 'MD' },
        // Delanteros
        { id: 'pos-10', x: 40, y: 25, label: 'DC' },
        { id: 'pos-11', x: 60, y: 25, label: 'DC' }
    ],
    '3-5-2': [
        // Portero
        { id: 'pos-1', x: 50, y: 90, label: 'POR' },
        // Defensas
        { id: 'pos-2', x: 30, y: 75, label: 'DFC' },
        { id: 'pos-3', x: 50, y: 75, label: 'DFC' },
        { id: 'pos-4', x: 70, y: 75, label: 'DFC' },
        // Centrocampistas
        { id: 'pos-5', x: 15, y: 50, label: 'LWB' },
        { id: 'pos-6', x: 35, y: 50, label: 'MC' },
        { id: 'pos-7', x: 50, y: 50, label: 'MC' },
        { id: 'pos-8', x: 65, y: 50, label: 'MC' },
        { id: 'pos-9', x: 85, y: 50, label: 'RWB' },
        // Delanteros
        { id: 'pos-10', x: 40, y: 25, label: 'DC' },
        { id: 'pos-11', x: 60, y: 25, label: 'DC' }
    ],
    '4-2-3-1': [
        // Portero
        { id: 'pos-1', x: 50, y: 90, label: 'POR' },
        // Defensas
        { id: 'pos-2', x: 20, y: 75, label: 'LI' },
        { id: 'pos-3', x: 40, y: 75, label: 'DFC' },
        { id: 'pos-4', x: 60, y: 75, label: 'DFC' },
        { id: 'pos-5', x: 80, y: 75, label: 'LD' },
        // Pivotes
        { id: 'pos-6', x: 40, y: 60, label: 'CDM' },
        { id: 'pos-7', x: 60, y: 60, label: 'CDM' },
        // Mediapuntas
        { id: 'pos-8', x: 25, y: 40, label: 'LM' },
        { id: 'pos-9', x: 50, y: 40, label: 'CAM' },
        { id: 'pos-10', x: 75, y: 40, label: 'RM' },
        // Delantero
        { id: 'pos-11', x: 50, y: 25, label: 'ST' }
    ],
    '3-4-3': [
        // Portero
        { id: 'pos-1', x: 50, y: 90, label: 'POR' },
        // Defensas
        { id: 'pos-2', x: 30, y: 75, label: 'DFC' },
        { id: 'pos-3', x: 50, y: 75, label: 'DFC' },
        { id: 'pos-4', x: 70, y: 75, label: 'DFC' },
        // Centrocampistas
        { id: 'pos-5', x: 20, y: 50, label: 'LWB' },
        { id: 'pos-6', x: 40, y: 50, label: 'MC' },
        { id: 'pos-7', x: 60, y: 50, label: 'MC' },
        { id: 'pos-8', x: 80, y: 50, label: 'RWB' },
        // Delanteros
        { id: 'pos-9', x: 25, y: 25, label: 'LW' },
        { id: 'pos-10', x: 50, y: 25, label: 'ST' },
        { id: 'pos-11', x: 75, y: 25, label: 'RW' }
    ],
    '5-3-2': [
        // Portero
        { id: 'pos-1', x: 50, y: 90, label: 'POR' },
        // Defensas
        { id: 'pos-2', x: 15, y: 75, label: 'LWB' },
        { id: 'pos-3', x: 35, y: 75, label: 'DFC' },
        { id: 'pos-4', x: 50, y: 75, label: 'DFC' },
        { id: 'pos-5', x: 65, y: 75, label: 'DFC' },
        { id: 'pos-6', x: 85, y: 75, label: 'RWB' },
        // Centrocampistas
        { id: 'pos-7', x: 35, y: 50, label: 'MC' },
        { id: 'pos-8', x: 50, y: 50, label: 'MC' },
        { id: 'pos-9', x: 65, y: 50, label: 'MC' },
        // Delanteros
        { id: 'pos-10', x: 40, y: 25, label: 'ST' },
        { id: 'pos-11', x: 60, y: 25, label: 'ST' }
    ]
};

// Variable para almacenar la formación actual
let formacionActual = '4-3-3';

// Función para cambiar formación
function cambiarFormacion(nuevaFormacion) {
    formacionActual = nuevaFormacion;
    
    // Actualizar botones de formación
    document.querySelectorAll('.formacion-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-formacion="${nuevaFormacion}"]`).classList.add('active');
    
    // Limpiar posiciones actuales
    const posicionesContainer = document.getElementById('posiciones-campo');
    posicionesContainer.innerHTML = '';
    
    // Crear nuevas posiciones según la formación
    const posiciones = FORMACIONES[nuevaFormacion];
    posiciones.forEach(pos => {
        const posElement = document.createElement('div');
        posElement.className = 'posicion-jugador';
        posElement.id = pos.id;
        posElement.style.left = `${pos.x}%`;
        posElement.style.top = `${pos.y}%`;
        posElement.dataset.posicion = pos.label;
        posElement.textContent = pos.label;
        
        // Evento para quitar jugador de la posición
        posElement.addEventListener('click', function() {
            if (this.classList.contains('ocupada')) {
                const jugadorNombre = this.dataset.jugador;
                this.classList.remove('ocupada');
                this.textContent = pos.label;
                delete this.dataset.jugador;
                
                // Devolver jugador a la lista de disponibles
                const jugadorElement = document.querySelector(`[data-jugador="${jugadorNombre}"]`);
                if (jugadorElement) {
                    jugadorElement.classList.remove('seleccionado');
                }
            }
        });
        
        posicionesContainer.appendChild(posElement);
    });
    
    // Limpiar selecciones previas
    document.querySelectorAll('.jugador-disponible').forEach(jugador => {
        jugador.classList.remove('seleccionado');
    });
}

// Event listeners para botones de formación
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.formacion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const formacion = this.dataset.formacion;
            cambiarFormacion(formacion);
        });
    });
    
    // Establecer formación por defecto
    setTimeout(() => {
        cambiarFormacion('4-3-3');
    }, 100);
});

// Renderizar jugadores disponibles para selección
function renderJugadoresDisponibles() {
    const container = document.getElementById('jugadores-disponibles');
    if (!container) return;
    
    const jugadoresActivos = appState.jugadores.filter(j => j.activo && !j.esEntrenador);
    
    container.innerHTML = '';
    
    jugadoresActivos.forEach(jugador => {
        const div = document.createElement('div');
        div.className = 'jugador-disponible';
        div.dataset.jugador = jugador.nombre;
        div.textContent = jugador.nombre;
        div.draggable = true;
        
        // Eventos de drag & drop
        div.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', jugador.nombre);
            this.style.opacity = '0.5';
        });
        
        div.addEventListener('dragend', function() {
            this.style.opacity = '1';
        });
        
        // Evento de clic para seleccionar/deseleccionar
        div.addEventListener('click', function() {
            // Si ya está seleccionado, quitarlo del campo
            if (this.classList.contains('seleccionado')) {
                this.classList.remove('seleccionado');
                // Quitar del campo si está colocado
                const posicionOcupada = document.querySelector(`[data-jugador="${jugador.nombre}"]`);
                if (posicionOcupada && posicionOcupada.classList.contains('posicion-jugador')) {
                    posicionOcupada.classList.remove('ocupada');
                    posicionOcupada.textContent = posicionOcupada.dataset.posicion;
                    delete posicionOcupada.dataset.jugador;
                }
            } else {
                // Buscar una posición libre para colocar el jugador
                const posicionLibre = document.querySelector('.posicion-jugador:not(.ocupada)');
                if (posicionLibre) {
                    this.classList.add('seleccionado');
                    posicionLibre.classList.add('ocupada');
                    posicionLibre.textContent = jugador.nombre.split(' ')[0]; // Solo el primer nombre
                    posicionLibre.dataset.jugador = jugador.nombre;
                } else {
                    showNotification('No hay posiciones libres en el campo', 'warning');
                }
            }
        });
        
        container.appendChild(div);
    });
    
    // Configurar drop zones en las posiciones del campo
    setTimeout(() => {
        document.querySelectorAll('.posicion-jugador').forEach(posicion => {
            posicion.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.backgroundColor = 'rgba(49, 130, 206, 0.2)';
            });
            
            posicion.addEventListener('dragleave', function() {
                this.style.backgroundColor = '';
            });
            
            posicion.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.backgroundColor = '';
                
                const jugadorNombre = e.dataTransfer.getData('text/plain');
                
                // Si la posición ya está ocupada, intercambiar jugadores
                if (this.classList.contains('ocupada')) {
                    const jugadorAnterior = this.dataset.jugador;
                    // Devolver el jugador anterior a disponibles
                    const jugadorAnteriorElement = document.querySelector(`[data-jugador="${jugadorAnterior}"]`);
                    if (jugadorAnteriorElement) {
                        jugadorAnteriorElement.classList.remove('seleccionado');
                    }
                }
                
                // Colocar el nuevo jugador
                this.classList.add('ocupada');
                this.textContent = jugadorNombre.split(' ')[0]; // Solo el primer nombre
                this.dataset.jugador = jugadorNombre;
                
                // Marcar como seleccionado en la lista
                const jugadorElement = document.querySelector(`[data-jugador="${jugadorNombre}"]`);
                if (jugadorElement) {
                    jugadorElement.classList.add('seleccionado');
                }
            });
        });
    }, 100);
}



// Funcionalidad para botones de ubicación
document.addEventListener('DOMContentLoaded', function() {
    const ubicacionButtons = document.querySelectorAll('.ubicacion-btn');
    const ubicacionInput = document.getElementById('ubicacion');
    
    ubicacionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            ubicacionButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase active al botón clickeado
            this.classList.add('active');
            
            // Actualizar el valor del input hidden
            ubicacionInput.value = this.dataset.ubicacion;
        });
    });
});


// Funcionalidad para añadir competiciones
document.addEventListener('DOMContentLoaded', function() {
    const addCompetitionBtn = document.getElementById('add-competition');
    const modalAddCompetition = document.getElementById('modal-add-competition');
    const closeAddCompetition = document.getElementById('close-add-competition');
    const cancelAddCompetition = document.getElementById('cancel-add-competition');
    const formAddCompetition = document.getElementById('form-add-competition');
    
    // Abrir modal
    addCompetitionBtn?.addEventListener('click', function() {
        modalAddCompetition.classList.remove('hidden');
    });
    
    // Cerrar modal
    function closeModal() {
        modalAddCompetition.classList.add('hidden');
        formAddCompetition.reset();
    }
    
    closeAddCompetition?.addEventListener('click', closeModal);
    cancelAddCompetition?.addEventListener('click', closeModal);
    
    // Enviar formulario
    formAddCompetition?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const competitionName = formData.get('competition-name');
        const logoFile = formData.get('competition-logo');
        
        // Verificar si ya existe
        if (appState.competiciones.some(c => c.nombre.toLowerCase() === competitionName.toLowerCase())) {
            showNotification('Esta competición ya existe', 'warning');
            return;
        }
        
        let logoPath = '';
        
        // Si se subió un logo, convertirlo a base64
        if (logoFile && logoFile.size > 0) {
            try {
                logoPath = await fileToBase64(logoFile);
            } catch (error) {
                console.error('Error al procesar el logo:', error);
                showNotification('Error al procesar el logo', 'error');
                return;
            }
        }
        
        // Añadir nueva competición
        const nuevaCompeticion = {
            nombre: competitionName,
            logo: logoPath
        };
        
        appState.competiciones.push(nuevaCompeticion);
        populateCompetitionsSelect();
        
        // Guardar en localStorage
        saveToLocalStorage();
        
        showNotification('Competición añadida correctamente', 'success');
        closeModal();
    });
});

// Función para convertir archivo a base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


// Función para eliminar jugador
function deletePlayer(jugadorNombre) {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${jugadorNombre} de la plantilla?`)) {
        // Marcar jugador como inactivo en lugar de eliminarlo completamente
        const jugadorIndex = appState.jugadores.findIndex(j => j.nombre === jugadorNombre);
        if (jugadorIndex !== -1) {
            appState.jugadores[jugadorIndex].activo = false;
            
            // Guardar cambios
            saveToLocalStorage();
            
            // Actualizar vista
            renderPlantilla();
            
            showNotification(`${jugadorNombre} ha sido eliminado de la plantilla`, 'success');
        }
    }
}


// Funcionalidad para el nuevo dashboard de estadísticas
function initializeNewStatsSystem() {
    const analysisType = document.getElementById('analysis-type');
    const playerControl = document.getElementById('player-control');
    const comparisonControls = document.getElementById('comparison-controls');
    const competitionControl = document.getElementById('competition-control');
    
    // Poblar selects
    populateStatsSelects();
    
    // Actualizar métricas principales
    updateMainMetrics();
    
    // Configurar eventos
    analysisType?.addEventListener('change', function() {
        handleAnalysisTypeChange(this.value);
    });
    
    document.getElementById('selected-player')?.addEventListener('change', function() {
        if (this.value) generateIndividualAnalysis(this.value);
    });
    
    document.getElementById('player1')?.addEventListener('change', updateComparison);
    document.getElementById('player2')?.addEventListener('change', updateComparison);
    
    document.getElementById('selected-competition')?.addEventListener('change', function() {
        if (this.value) generateCompetitionAnalysis(this.value);
        else generateOverviewAnalysis();
    });
    
    // Mostrar resumen general por defecto
    generateOverviewAnalysis();
}

function populateStatsSelects() {
    const selects = ['selected-player', 'player1', 'player2'];
    const activeJugadores = appState.jugadores.filter(j => j.activo && !j.esEntrenador);
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Seleccionar jugador</option>';
            activeJugadores.forEach(jugador => {
                const option = document.createElement('option');
                option.value = jugador.nombre;
                option.textContent = jugador.nombre;
                select.appendChild(option);
            });
        }
    });
    
    // Poblar competiciones
    const competitionSelect = document.getElementById('selected-competition');
    if (competitionSelect) {
        competitionSelect.innerHTML = '<option value="">Todas las competiciones</option>';
        appState.competiciones.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.nombre;
            option.textContent = comp.nombre;
            competitionSelect.appendChild(option);
        });
    }
}

function updateMainMetrics() {
    const activeJugadores = appState.jugadores.filter(j => j.activo && !j.esEntrenador);
    const totalPartidos = appState.partidos.length;
    
    // Calcular nota media del equipo
    let totalNotas = 0;
    let countNotas = 0;
    
    appState.partidos.forEach(partido => {
        if (partido.calificaciones) {
            partido.calificaciones.forEach(cal => {
                if (!isNaN(cal.nota)) {
                    totalNotas += cal.nota;
                    countNotas++;
                }
            });
        }
    });
    
    const notaMedia = countNotas > 0 ? (totalNotas / countNotas).toFixed(1) : '0.0';
    
    // Encontrar mejor jugador
    const jugadorStats = {};
    appState.partidos.forEach(partido => {
        if (partido.calificaciones) {
            partido.calificaciones.forEach(cal => {
                if (!jugadorStats[cal.jugadorNombre]) {
                    jugadorStats[cal.jugadorNombre] = { total: 0, count: 0 };
                }
                if (!isNaN(cal.nota)) {
                    jugadorStats[cal.jugadorNombre].total += cal.nota;
                    jugadorStats[cal.jugadorNombre].count++;
                }
            });
        }
    });
    
    let mejorJugador = '-';
    let mejorPromedio = 0;
    
    Object.keys(jugadorStats).forEach(nombre => {
        const stats = jugadorStats[nombre];
        if (stats.count >= 3) { // Mínimo 3 partidos
            const promedio = stats.total / stats.count;
            if (promedio > mejorPromedio) {
                mejorPromedio = promedio;
                mejorJugador = nombre;
            }
        }
    });
    
    // Actualizar DOM
    document.getElementById('total-players').textContent = activeJugadores.length;
    document.getElementById('total-matches').textContent = totalPartidos;
    document.getElementById('avg-rating').textContent = notaMedia;
    document.getElementById('best-player').textContent = mejorJugador;
}

function handleAnalysisTypeChange(type) {
    // Ocultar todos los controles
    document.getElementById('player-control').classList.add('hidden');
    document.getElementById('comparison-controls').classList.add('hidden');
    document.getElementById('competition-control').classList.add('hidden');
    
    // Mostrar controles relevantes
    switch (type) {
        case 'individual':
            document.getElementById('player-control').classList.remove('hidden');
            break;
        case 'comparison':
            document.getElementById('comparison-controls').classList.remove('hidden');
            break;
        case 'competition':
            document.getElementById('competition-control').classList.remove('hidden');
            break;
        case 'evolution':
            generateEvolutionAnalysis();
            break;
        case 'overview':
        default:
            generateOverviewAnalysis();
            break;
    }
}

function generateOverviewAnalysis() {
    const chartsContainer = document.getElementById('charts-container');
    const insightsContent = document.getElementById('insights-content');
    
    if (!chartsContainer || !insightsContent) return;
    
    // Generar gráfico de distribución de notas
    const notasDistribution = calculateNotasDistribution();
    const topJugadores = getTopJugadores(5);
    
    chartsContainer.innerHTML = `
        <div class="chart-container">
            <div class="chart-title">Distribución de Notas del Equipo</div>
            <div class="distribution-chart">
                ${generateDistributionChart(notasDistribution)}
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart-title">Top 5 Jugadores por Promedio</div>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Jugador</th>
                        <th>Partidos</th>
                        <th>Promedio</th>
                        <th>Mejor Nota</th>
                    </tr>
                </thead>
                <tbody>
                    ${topJugadores.map(j => `
                        <tr>
                            <td>${j.nombre}</td>
                            <td>${j.partidos}</td>
                            <td>${j.promedio}</td>
                            <td>${j.mejorNota}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Generar insights
    const insights = generateOverviewInsights(topJugadores, notasDistribution);
    insightsContent.innerHTML = insights;
}

function generateIndividualAnalysis(jugadorNombre) {
    const chartsContainer = document.getElementById('charts-container');
    const insightsContent = document.getElementById('insights-content');
    
    if (!chartsContainer || !insightsContent) return;
    
    const jugadorData = getJugadorDetailedStats(jugadorNombre);
    
    chartsContainer.innerHTML = `
        <div class="chart-container">
            <div class="chart-title">Evolución de ${jugadorNombre}</div>
            <div class="evolution-chart">
                ${generateEvolutionChart(jugadorData.evolution)}
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart-title">Estadísticas por Competición</div>
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Competición</th>
                        <th>Partidos</th>
                        <th>Promedio</th>
                        <th>Mejor</th>
                        <th>Peor</th>
                    </tr>
                </thead>
                <tbody>
                    ${jugadorData.byCompetition.map(comp => `
                        <tr>
                            <td>${comp.nombre}</td>
                            <td>${comp.partidos}</td>
                            <td>${comp.promedio}</td>
                            <td>${comp.mejor}</td>
                            <td>${comp.peor}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    const insights = generateIndividualInsights(jugadorData);
    insightsContent.innerHTML = insights;
}

function calculateNotasDistribution() {
    const distribution = { '0-3': 0, '4-5': 0, '6-7': 0, '8-9': 0, '10': 0 };
    
    appState.partidos.forEach(partido => {
        if (partido.calificaciones) {
            partido.calificaciones.forEach(cal => {
                const nota = cal.nota;
                if (!isNaN(nota)) {
                    if (nota <= 3) distribution['0-3']++;
                    else if (nota <= 5) distribution['4-5']++;
                    else if (nota <= 7) distribution['6-7']++;
                    else if (nota <= 9) distribution['8-9']++;
                    else distribution['10']++;
                }
            });
        }
    });
    
    return distribution;
}

function getTopJugadores(limit = 5) {
    const jugadorStats = {};
    
    appState.partidos.forEach(partido => {
        if (partido.calificaciones) {
            partido.calificaciones.forEach(cal => {
                if (!jugadorStats[cal.jugadorNombre]) {
                    jugadorStats[cal.jugadorNombre] = { notas: [], total: 0, count: 0 };
                }
                if (!isNaN(cal.nota)) {
                    jugadorStats[cal.jugadorNombre].notas.push(cal.nota);
                    jugadorStats[cal.jugadorNombre].total += cal.nota;
                    jugadorStats[cal.jugadorNombre].count++;
                }
            });
        }
    });
    
    return Object.keys(jugadorStats)
        .filter(nombre => jugadorStats[nombre].count >= 1)
        .map(nombre => {
            const stats = jugadorStats[nombre];
            return {
                nombre,
                partidos: stats.count,
                promedio: (stats.total / stats.count).toFixed(1),
                mejorNota: Math.max(...stats.notas).toFixed(1)
            };
        })
        .sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio))
        .slice(0, limit);
}

function generateDistributionChart(distribution) {
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    if (total === 0) return '<p>No hay datos suficientes</p>';
    
    return Object.keys(distribution).map(range => {
        const count = distribution[range];
        const percentage = ((count / total) * 100).toFixed(1);
        return `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="width: 60px; font-size: 14px;">${range}</span>
                <div class="progress-bar" style="flex: 1; margin: 0 12px;">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span style="width: 50px; font-size: 14px; text-align: right;">${count}</span>
            </div>
        `;
    }).join('');
}

function generateOverviewInsights(topJugadores, distribution) {
    const totalPartidos = appState.partidos.length;
    const totalJugadores = appState.jugadores.filter(j => j.activo && !j.esEntrenador).length;
    
    return `
        <p><strong>Resumen del equipo:</strong></p>
        <ul>
            <li>Total de ${totalPartidos} partidos registrados</li>
            <li>${totalJugadores} jugadores activos en la plantilla</li>
            <li>Mejor jugador: <strong>${topJugadores[0]?.nombre || 'N/A'}</strong> (${topJugadores[0]?.promedio || '0.0'})</li>
            <li>Rendimiento general: ${getPerformanceLevel(topJugadores)}</li>
        </ul>
        
        <p><strong>Distribución de notas:</strong></p>
        <ul>
            <li>Notas excelentes (8-10): ${distribution['8-9'] + distribution['10']} calificaciones</li>
            <li>Notas buenas (6-7): ${distribution['6-7']} calificaciones</li>
            <li>Notas regulares (4-5): ${distribution['4-5']} calificaciones</li>
            <li>Notas bajas (0-3): ${distribution['0-3']} calificaciones</li>
        </ul>
    `;
}

function getPerformanceLevel(topJugadores) {
    if (topJugadores.length === 0) return 'Sin datos';
    const avgTop3 = topJugadores.slice(0, 3).reduce((sum, j) => sum + parseFloat(j.promedio), 0) / Math.min(3, topJugadores.length);
    
    if (avgTop3 >= 8) return 'Excelente';
    if (avgTop3 >= 7) return 'Muy bueno';
    if (avgTop3 >= 6) return 'Bueno';
    if (avgTop3 >= 5) return 'Regular';
    return 'Necesita mejorar';
}

// Inicializar el nuevo sistema cuando se carga la pestaña de estadísticas
document.addEventListener('DOMContentLoaded', function() {
    const statsTab = document.querySelector('[data-tab="estadisticas"]');
    if (statsTab) {
        statsTab.addEventListener('click', function() {
            setTimeout(() => {
                initializeNewStatsSystem();
            }, 100);
        });
    }
});

