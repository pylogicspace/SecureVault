document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    const toastElement = document.getElementById('toast-notification');
    const toast = new bootstrap.Toast(toastElement);
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('login-form');
    const masterPasswordInput = document.getElementById('master-password');
    const loginErrorAlert = document.getElementById('login-error');
    const setupNoticeAlert = document.getElementById('setup-notice');
    const passwordList = document.getElementById('password-list');
    const logoutButton = document.getElementById('logout-button');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const allPasswordsLink = document.getElementById('all-passwords-link');
    const categoriesMenu = document.getElementById('categories-menu');
    const currentViewTitle = document.getElementById('current-view-title');
    const noPasswordsMessage = document.getElementById('no-passwords-message');
    
    // Password Form Elements
    const passwordForm = document.getElementById('password-form');
    const passwordIdInput = document.getElementById('password-id');
    const siteNameInput = document.getElementById('site-name');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.getElementById('toggle-password');
    const generatePasswordButton = document.getElementById('generate-password');
    const websiteUrlInput = document.getElementById('website-url');
    const categorySelect = document.getElementById('category');
    const notesInput = document.getElementById('notes');
    const savePasswordButton = document.getElementById('save-password');
    const addPasswordBtn = document.getElementById('add-password-btn');
    const passwordModal = new bootstrap.Modal(document.getElementById('password-modal'));
    const modalTitle = document.getElementById('modal-title');
    
    // Password Details Elements
    const detailsModal = new bootstrap.Modal(document.getElementById('details-modal'));
    const detailsTitle = document.getElementById('details-title');
    const detailsSite = document.getElementById('details-site');
    const detailsUsername = document.getElementById('details-username');
    const detailsPassword = document.getElementById('details-password');
    const detailsTogglePassword = document.getElementById('details-toggle-password');
    const detailsCopyPassword = document.getElementById('details-copy-password');
    const detailsUrl = document.getElementById('details-url');
    const detailsCategory = document.getElementById('details-category');
    const detailsNotes = document.getElementById('details-notes');
    const detailsCreated = document.getElementById('details-created');
    const detailsModified = document.getElementById('details-modified');
    const editPasswordButton = document.getElementById('edit-password');
    const deletePasswordButton = document.getElementById('delete-password');
    
    // Confirm Delete Modal
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirm-delete-modal'));
    const confirmDeleteButton = document.getElementById('confirm-delete');
    
    // Password Generator Elements
    const generatorModal = new bootstrap.Modal(document.getElementById('generator-modal'));
    const generatedPasswordInput = document.getElementById('generated-password');
    const passwordLengthSlider = document.getElementById('password-length');
    const lengthValue = document.getElementById('length-value');
    const includeUppercase = document.getElementById('include-uppercase');
    const includeLowercase = document.getElementById('include-lowercase');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const regeneratePasswordButton = document.getElementById('regenerate-password');
    const usePasswordButton = document.getElementById('use-password');
    const copyPasswordButton = document.getElementById('copy-password');

    // Global Variables
    let currentUser = null;
    let currentPasswordId = null;
    let currentFilter = 'all';
    let currentPasswordData = null;
    
    // Check if there's a user already set up
    function checkExistingUser() {
        const hasUser = localStorage.getItem('passwordManager_hasUser') === 'true';
        if (!hasUser) {
            setupNoticeAlert.classList.remove('d-none');
        }
        return hasUser;
    }

    // Login Handling
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const masterPassword = masterPasswordInput.value.trim();
        if (!masterPassword) {
            showToast('Error', 'Master password cannot be empty', 'error');
            return;
        }
        
        const hasUser = checkExistingUser();
        
        if (hasUser) {
            // Verify the master password
            if (verifyMasterPassword(masterPassword)) {
                currentUser = {
                    masterPassword: masterPassword
                };
                loadDashboard();
            } else {
                loginErrorAlert.classList.remove('d-none');
                setTimeout(() => {
                    loginErrorAlert.classList.add('d-none');
                }, 3000);
            }
        } else {
            // Create a new user
            createNewUser(masterPassword);
            currentUser = {
                masterPassword: masterPassword
            };
            loadDashboard();
        }
    });

    // Create new user
    function createNewUser(masterPassword) {
        // Generate a salt for the user's master password
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Hash the master password with the salt
        const hashedPassword = hashMasterPassword(masterPassword, saltHex);
        
        // Store the salt and hashed password
        localStorage.setItem('passwordManager_salt', saltHex);
        localStorage.setItem('passwordManager_hash', hashedPassword);
        localStorage.setItem('passwordManager_hasUser', 'true');
        
        // Initialize the database for the user
        db.initializeDatabase();
        
        showToast('Success', 'Account created successfully!', 'success');
    }

    // Verify master password
    function verifyMasterPassword(password) {
        const salt = localStorage.getItem('passwordManager_salt');
        const storedHash = localStorage.getItem('passwordManager_hash');
        
        if (!salt || !storedHash) {
            return false;
        }
        
        const hashedPassword = hashMasterPassword(password, salt);
        return hashedPassword === storedHash;
    }

    // Load the dashboard after authentication
    function loadDashboard() {
        // Hide login, show dashboard
        loginScreen.classList.add('d-none');
        dashboardScreen.classList.remove('d-none');
        
        // Initialize the database with the master password for encryption
        db.setEncryptionKey(currentUser.masterPassword);
        
        // Load all password entries
        loadPasswords();
    }

    // Load password entries
    function loadPasswords(filter = 'all', searchQuery = '') {
        // Clear the current list
        passwordList.innerHTML = '';
        currentFilter = filter;
        
        // Get all passwords from the database
        let passwords = db.getAllPasswords();
        
        // Apply filters
        if (filter !== 'all') {
            passwords = passwords.filter(pwd => pwd.category === filter);
        }
        
        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            passwords = passwords.filter(pwd => 
                pwd.siteName.toLowerCase().includes(query) || 
                pwd.username.toLowerCase().includes(query) ||
                (pwd.notes && pwd.notes.toLowerCase().includes(query))
            );
        }
        
        // Update title
        if (filter === 'all') {
            if (searchQuery) {
                currentViewTitle.textContent = `Search results for "${searchQuery}"`;
            } else {
                currentViewTitle.textContent = 'All Passwords';
            }
        } else {
            currentViewTitle.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)} Passwords`;
        }
        
        // Show message if no passwords
        if (passwords.length === 0) {
            noPasswordsMessage.classList.remove('d-none');
        } else {
            noPasswordsMessage.classList.add('d-none');
            
            // Render each password
            passwords.forEach(password => {
                renderPasswordCard(password);
            });
        }
    }

    // Render a password card
    function renderPasswordCard(password) {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4';
        card.innerHTML = `
            <div class="card password-card mb-3" data-id="${password.id}">
                <div class="card-header">
                    <div class="site-icon">
                        ${password.siteName.charAt(0).toUpperCase()}
                    </div>
                    <h5 class="card-title">${password.siteName}</h5>
                </div>
                <div class="card-body">
                    <div class="mb-2">
                        <small class="text-muted">Username:</small>
                        <div class="truncate">${password.username}</div>
                    </div>
                    <div class="mb-2">
                        <span class="password-category category-${password.category}">${password.category}</span>
                    </div>
                    <div class="text-end mt-3">
                        <small class="text-muted">Last modified: ${formatDate(password.lastModified)}</small>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event to show details
        card.querySelector('.password-card').addEventListener('click', () => {
            showPasswordDetails(password.id);
        });
        
        passwordList.appendChild(card);
    }

    // Show password details in modal
    function showPasswordDetails(id) {
        const password = db.getPasswordById(id);
        if (!password) {
            showToast('Error', 'Password not found', 'error');
            return;
        }
        
        currentPasswordData = password;
        
        // Populate the details
        detailsTitle.textContent = password.siteName;
        detailsSite.textContent = password.siteName;
        detailsUsername.textContent = password.username;
        detailsPassword.value = password.password;
        detailsUrl.textContent = password.url || 'N/A';
        detailsCategory.textContent = password.category;
        detailsNotes.textContent = password.notes || 'N/A';
        detailsCreated.textContent = formatDate(password.createdAt);
        detailsModified.textContent = formatDate(password.lastModified);
        
        // Show the modal
        detailsModal.show();
    }

    // Format date for display
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    // Toggle password visibility in details modal
    detailsTogglePassword.addEventListener('click', function() {
        const type = detailsPassword.type;
        detailsPassword.type = type === 'password' ? 'text' : 'password';
    });

    // Copy password from details modal
    detailsCopyPassword.addEventListener('click', function() {
        detailsPassword.select();
        document.execCommand('copy');
        showToast('Success', 'Password copied to clipboard', 'success');
    });

    // Edit password
    editPasswordButton.addEventListener('click', function() {
        if (!currentPasswordData) return;
        
        // Hide details modal and show edit modal
        detailsModal.hide();
        
        // Set the form data
        modalTitle.textContent = 'Edit Password';
        passwordIdInput.value = currentPasswordData.id;
        siteNameInput.value = currentPasswordData.siteName;
        usernameInput.value = currentPasswordData.username;
        passwordInput.value = currentPasswordData.password;
        websiteUrlInput.value = currentPasswordData.url || '';
        categorySelect.value = currentPasswordData.category;
        notesInput.value = currentPasswordData.notes || '';
        
        // Show the modal
        passwordModal.show();
    });

    // Delete password
    deletePasswordButton.addEventListener('click', function() {
        if (!currentPasswordData) return;
        
        // Store the ID to delete and show confirmation modal
        currentPasswordId = currentPasswordData.id;
        detailsModal.hide();
        confirmDeleteModal.show();
    });

    // Confirm delete action
    confirmDeleteButton.addEventListener('click', function() {
        if (!currentPasswordId) return;
        
        // Delete from database
        db.deletePassword(currentPasswordId);
        
        // Hide modal and refresh
        confirmDeleteModal.hide();
        loadPasswords(currentFilter);
        
        showToast('Success', 'Password deleted successfully', 'success');
        currentPasswordId = null;
    });

    // Add new password button
    addPasswordBtn.addEventListener('click', function() {
        // Reset the form
        passwordForm.reset();
        passwordIdInput.value = '';
        modalTitle.textContent = 'Add Password';
    });

    // Toggle password visibility
    togglePasswordButton.addEventListener('click', function() {
        const type = passwordInput.type;
        passwordInput.type = type === 'password' ? 'text' : 'password';
    });

    // Generate password
    generatePasswordButton.addEventListener('click', function() {
        passwordModal.hide();
        generateAndDisplayPassword();
        generatorModal.show();
    });

    // Generate and display a password
    function generateAndDisplayPassword() {
        const options = {
            length: parseInt(passwordLengthSlider.value),
            uppercase: includeUppercase.checked,
            lowercase: includeLowercase.checked,
            numbers: includeNumbers.checked,
            symbols: includeSymbols.checked
        };
        
        const password = generatePassword(options);
        generatedPasswordInput.value = password;
    }

    // Copy generated password
    copyPasswordButton.addEventListener('click', function() {
        generatedPasswordInput.select();
        document.execCommand('copy');
        showToast('Success', 'Password copied to clipboard', 'success');
    });

    // Regenerate password
    regeneratePasswordButton.addEventListener('click', generateAndDisplayPassword);

    // Use generated password
    usePasswordButton.addEventListener('click', function() {
        passwordInput.value = generatedPasswordInput.value;
        generatorModal.hide();
        passwordModal.show();
    });

    // Update length display
    passwordLengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Save password
    savePasswordButton.addEventListener('click', function() {
        // Validate form
        if (!passwordForm.checkValidity()) {
            passwordForm.reportValidity();
            return;
        }
        
        // Get form data
        const passwordData = {
            siteName: siteNameInput.value,
            username: usernameInput.value,
            password: passwordInput.value,
            url: websiteUrlInput.value,
            category: categorySelect.value,
            notes: notesInput.value
        };
        
        // Check if we're editing or adding
        const id = passwordIdInput.value;
        
        if (id) {
            // Update existing
            passwordData.id = id;
            db.updatePassword(passwordData);
            showToast('Success', 'Password updated successfully', 'success');
        } else {
            // Add new
            db.addPassword(passwordData);
            showToast('Success', 'Password added successfully', 'success');
        }
        
        // Hide modal and refresh
        passwordModal.hide();
        loadPasswords(currentFilter);
    });

    // Search
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchQuery = searchInput.value.trim();
        loadPasswords(currentFilter, searchQuery);
    });

    // Filter by category
    categoriesMenu.addEventListener('click', function(e) {
        if (e.target.classList.contains('dropdown-item')) {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            loadPasswords(category);
        }
    });

    // Show all passwords
    allPasswordsLink.addEventListener('click', function(e) {
        e.preventDefault();
        loadPasswords();
    });

    // Logout
    logoutButton.addEventListener('click', function() {
        currentUser = null;
        dashboardScreen.classList.add('d-none');
        loginScreen.classList.remove('d-none');
        masterPasswordInput.value = '';
    });

    // Utility for showing toast notifications
    function showToast(title, message, type = 'info') {
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Set toast color based on type
        toastElement.className = 'toast';
        if (type === 'error') {
            toastElement.classList.add('bg-danger', 'text-white');
        } else if (type === 'success') {
            toastElement.classList.add('bg-success', 'text-white');
        } else {
            toastElement.classList.add('bg-light');
        }
        
        toast.show();
    }

    // Initialize by checking for existing user
    checkExistingUser();
});
