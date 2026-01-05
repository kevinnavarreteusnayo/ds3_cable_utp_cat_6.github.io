document.addEventListener('DOMContentLoaded', function() {
    // Cargar el navbar
    fetch('./components/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('afterbegin', data);
            initializeNavbar();
            initializeMobileMenu();
            initializeSearchModal();
            addDynamicStyles();
        })
        .catch(error => console.error('Error loading navbar:', error));
});

function initializeNavbar() {
    // Menú hamburguesa (versión simplificada que será reemplazada por initializeMobileMenu)
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        const icon = mobileMenuButton.querySelector('i');
        mobileMenuButton.addEventListener('click', function() {
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Theme toggle (dark / light)
    const themeToggles = document.querySelectorAll('.theme-toggle');
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // update all toggles' aria-pressed and icon
        themeToggles.forEach(btn => {
            btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            const ic = btn.querySelector('i');
            if (ic) {
                ic.classList.remove('fa-moon', 'fa-sun');
                ic.classList.add(theme === 'dark' ? 'fa-sun' : 'fa-moon');
            }
        });
    }

    if (themeToggles && themeToggles.length) {
        // Inicializar desde localStorage o preferencia del sistema
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = stored ? stored : (prefersDark ? 'dark' : 'light');
        applyTheme(initial);

        themeToggles.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                const next = current === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                localStorage.setItem('theme', next);
            });
        });
        // Mostrar tooltip en la primera visita si no hay preferencia guardada
        try {
            const seen = localStorage.getItem('themeSeen');
            if (!stored && !seen) {
                const firstBtn = themeToggles[0];
                if (firstBtn) {
                    showThemeTooltip(firstBtn);
                    localStorage.setItem('themeSeen', '1');
                }
            }
        } catch (e) {
            // si storage falla, ignorar
        }
    }
}

function showThemeTooltip(button) {
    const tip = document.createElement('div');
    tip.className = 'theme-tooltip';
    tip.textContent = 'Nuevo: prueba el modo oscuro';
    document.body.appendChild(tip);

    // posicionar tooltip cerca del botón
    const rect = button.getBoundingClientRect();
    const top = window.scrollY + rect.top - 10 - tip.offsetHeight;
    const left = window.scrollX + rect.left;
    // colocar inicialmente fuera del flujo para calcular height
    tip.style.top = (window.scrollY + rect.bottom + 8) + 'px';
    tip.style.left = (left) + 'px';

    // Forzar cálculo y mostrar
    requestAnimationFrame(() => {
        tip.classList.add('show');
    });

    // Ocultar al cabo de 4s o al click
    const removeTip = () => { if (tip) tip.remove(); };
    tip.addEventListener('click', removeTip);
    setTimeout(removeTip, 4000);
}

function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMenuButton = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.remove('-translate-x-full');
        mobileMenu.classList.remove('hidden');
        if (menuOverlay) menuOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        mobileMenuButton.setAttribute('aria-expanded', 'true');
        
        // Cambiar ícono
        const icon = mobileMenuButton.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });

    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', closeMobileMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMobileMenu);
    }

    function closeMobileMenu() {
        mobileMenu.classList.add('-translate-x-full');
        if (menuOverlay) menuOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Cambiar ícono
        const icon = mobileMenuButton.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        mobileMenuButton.setAttribute('aria-expanded', 'false');
    }
}

function initializeSearchModal() {
    const searchModal = document.getElementById('search-modal');
    const searchButton = document.getElementById('search-button');
    const mobileSearchButton = document.getElementById('mobile-search-button');
    const closeSearch = document.getElementById('close-search');

    function openSearchModal() {
        if (searchModal) {
            searchModal.classList.remove('none');
            searchModal.classList.add('anim');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSearchModal() {
        if (searchModal) {
            searchModal.classList.add('none');
            document.body.style.overflow = '';
        }
    }

    if (searchButton) searchButton.addEventListener('click', openSearchModal);
    if (mobileSearchButton) mobileSearchButton.addEventListener('click', openSearchModal);
    if (closeSearch) closeSearch.addEventListener('click', closeSearchModal);

    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchModal && !searchModal.classList.contains('none')) {
            closeSearchModal();
        }
    });
}

function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        
        .anim {
            animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .none {
            display: none;
        }
        
        /* Estilos para el menú móvil */
        .-translate-x-full {
            transform: translateX(-100%);
        }
        
        #mobile-menu {
            transition: transform 0.3s ease-in-out;
        }
        
        #menu-overlay {
            background-color: rgba(0, 0, 0, 0.5);
        }
    `;
    document.head.appendChild(style);
}