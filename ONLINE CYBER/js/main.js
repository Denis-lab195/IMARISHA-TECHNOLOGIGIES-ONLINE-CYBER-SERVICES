// Main Application Module
const App = {
    // Initialize the application
    init() {
        // Initialize Firebase auth
        Auth.init();
        
        // Initialize UI
        UI.init();
        
        // Setup global event listeners
        this.setupGlobalEventListeners();
        
        console.log('Imarisha Technologies application initialized');
    },

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Footer login/register links
        document.getElementById('footerLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            UI.openAuthModal(true);
        });

        document.getElementById('footerRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            UI.openAuthModal(false);
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display === 'flex') {
                        UI.closeModal(modal);
                    }
                });
            }
        });

        // Handle window resize
        window.addEventListener('resize', this.handleResize);
    },

    // Handle window resize
    handleResize() {
        // Close mobile menu on large screens
        if (window.innerWidth > 768) {
            document.getElementById('navLinks')?.classList.remove('active');
        }
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => App.init());