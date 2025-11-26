console.log('[FlowUs Login] Script starting...');
// Invite code mappings
const inviteCodes = {
    'BLOOM-25678C-BERG08754': {
        name: 'Bloomberg',
        url: 'bloomberg.com',
        positionSelect: true
    },
    'ESPN-3466CB54-CO97FX3': {
        name: 'ESPN',
        url: 'espn.com',
        special: false
    },
    'ETHER-FI234CPX56-FI244CLG9': {
        name: 'ether.fi',
        url: null,
        special: 'etherfi'
    },
    'TRONDA-O24XC7753-99XGRZORG': {
        name: 'trondao.org',
        url: null,
        special: false
    }
};

// Department options for ether.fi
const departments = [
    'Staff Smart Contract Engineer',
    'Foundation Manager',
    'Compliance Manager - Payments',
    'Senior DevOps Engineer',
    'Senior Software Engineer - Backend',
    'KYC Analyst – Ether.fi Cash Program',
    'Customer Service Representative',
    'Front End Engineer',
    'Smart Contract Engineer',
    'Senior Full Stack Software Engineer',
    'Senior CX Manager'
];

// Bloomberg positions
const bloombergPositions = [
    'Article Writer',
    'Marketing Specialist',
    'Financial Analyst',
    'Data Journalist',
    'Research Associate',
    'Social Media Strategist',
    'Editorial Assistant',
    'Market Reporter'
];

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, type === 'success' ? 5000 : 7000);
}

// Mode toggling
function setMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const inviteSection = document.getElementById('inviteSection');
    const departmentSection = document.getElementById('departmentSection');
    const registerBtn = document.getElementById('registerBtn');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    const divider = document.querySelector('.divider');
    const positionSection = document.getElementById('positionSection');

    if (mode === 'register') {
        // UI setup for register
        title.textContent = 'Register';
        subtitle.textContent = 'enter your invite code';
        loginForm.style.display = 'none';
        registerBtn.style.display = 'none';
        backToLoginLink.style.display = 'inline-block';
        inviteSection.classList.add('active');
        inviteSection.style.display = 'block';
        departmentSection.classList.remove('active');
        departmentSection.style.display = 'none';
        positionSection.classList.remove('active');
        positionSection.style.display = 'none';
        if (divider) divider.style.display = 'none';
        showToast('Hello! If you got invited by a company to a workflow please enter your invite code.');
    } else {
        // UI setup for login
        title.textContent = 'Welcome to FlowUs';
        subtitle.textContent = 'Login or create a new account';
        loginForm.style.display = 'block';
        registerBtn.style.display = 'inline-block';
        backToLoginLink.style.display = 'none';
        inviteSection.classList.remove('active');
        inviteSection.style.display = 'none';
        departmentSection.classList.remove('active');
        departmentSection.style.display = 'none';
        positionSection.classList.remove('active');
        positionSection.style.display = 'none';
        document.getElementById('inviteCode').value = '';
        document.getElementById('applyDepartmentBtn').disabled = true;
        if (divider) divider.style.display = 'block';
    }
}

// Register button click
document.getElementById('registerBtn').addEventListener('click', function() {
    setMode('register');
});

// Already logged in link
document.getElementById('backToLoginLink').addEventListener('click', function() {
    setMode('login');
});

// Submit invite code
document.getElementById('submitInviteBtn').addEventListener('click', function() {
    console.log('[FlowUs Login] Submit button clicked');
    const inviteCode = document.getElementById('inviteCode').value.trim().toUpperCase();
    console.log('[FlowUs Login] Invite code entered:', inviteCode);
    
    if (!inviteCode) {
        showToast('Please enter an invite code', 'error');
        return;
    }

    const company = inviteCodes[inviteCode];
    console.log('[FlowUs Login] Company lookup result:', company);

    if (!company) {
        showToast('Invalid invite code. Please check and try again.', 'error');
        return;
    }

    // If it's Bloomberg -> ask for position selection
    if (company.positionSelect) {
        console.log('[FlowUs Login] Bloomberg detected - showing position selector');
        document.getElementById('inviteSection').style.display = 'none';
        const departmentSection = document.getElementById('departmentSection');
        departmentSection.classList.add('active');
        departmentSection.style.display = 'block';
        // Update label
        const label = departmentSection.querySelector('label');
        if (label) label.textContent = 'What position did your workflow assign you?';
        // Populate as positions
        const departmentOptions = document.getElementById('departmentOptions');
        departmentOptions.innerHTML = '';
        bloombergPositions.forEach(role => {
            console.log('[FlowUs Login] Creating position button for:', role);
            const option = document.createElement('div');
            option.className = 'department-option';
            option.innerHTML = `<strong>${role}</strong><br><span style="font-size: 12px;">Apply</span>`;
            option.addEventListener('click', function() {
                document.querySelectorAll('.department-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('applyDepartmentBtn').disabled = false;
            });
            departmentOptions.appendChild(option);
        });
        // Mark current company in memory
        window.__currentCompany = company;
        return;
    }

    // If it's ether.fi (special case), show department selection
    if (company.special) {
        document.getElementById('inviteSection').style.display = 'none';
        document.getElementById('departmentSection').classList.add('active');
        
        // Populate department options
        const departmentOptions = document.getElementById('departmentOptions');
        departmentOptions.innerHTML = '';
        
        departments.forEach(dept => {
            const option = document.createElement('div');
            option.className = 'department-option';
            option.innerHTML = `<strong>${dept}</strong><br><span style="font-size: 12px;">Apply</span>`;
            option.addEventListener('click', function() {
                // Remove selected class from all options
                document.querySelectorAll('.department-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                // Add selected class to clicked option
                this.classList.add('selected');
                document.getElementById('applyDepartmentBtn').disabled = false;
            });
            departmentOptions.appendChild(option);
        });
        window.__currentCompany = company;
        return;
    } else {
        // Regular success message
        const companyName = company.url ? company.name : company.name;
        const urlText = company.url ? ` at ${company.url}` : '';
        showToast(`Congratulations! You've been invited by a Colleague At @${companyName}${urlText}`, 'success');
        
        // Hide invite section after success
        setTimeout(() => {
            document.getElementById('inviteSection').classList.remove('active');
            document.getElementById('inviteCode').value = '';
        }, 2000);
    }
});

// Apply department button
document.getElementById('applyDepartmentBtn').addEventListener('click', function() {
    const selected = document.querySelector('.department-option.selected');
    if (selected) {
        const chosen = selected.querySelector('strong').textContent;
        const company = window.__currentCompany || {};

        // If Bloomberg: welcome, persist and redirect
        if (company.name === 'Bloomberg') {
            // Persist minimal profile
            const account = { org: 'Bloomberg', role: chosen, ts: Date.now() };
            try {
                localStorage.setItem('flowusAccount', JSON.stringify(account));
                document.cookie = `flowusOrg=Bloomberg; path=/; max-age=${60*60*24*30}`; // 30 days
            } catch (e) {}

            showToast(`Welcome to @bloomberg. Your assigned position: ${chosen}`, 'success');
            // Redirect user to downloads section; user can download manually
            setTimeout(() => { window.location.href = 'download.html?workflow=bloomberg#win'; }, 1000);
            return;
        }

        // Ether.fi default branch (existing behavior)
        showToast(`Congratulations! You've been invited by a Colleague At @ether.fi workspace. You selected: ${chosen}`, 'success');
        setTimeout(() => {
            document.getElementById('departmentSection').classList.remove('active');
            document.getElementById('inviteSection').classList.remove('active');
            document.getElementById('inviteCode').value = '';
            document.getElementById('applyDepartmentBtn').disabled = true;
        }, 3000);
    }
});

// Apply position (Bloomberg)
document.getElementById('applyPositionBtn').addEventListener('click', function(){
    const selected = document.querySelector('#positionOptions .department-option.selected');
    if (!selected) return;
    const positionName = selected.querySelector('strong').textContent;
    // Persist
    try {
        localStorage.setItem('workflowCompany', 'Bloomberg');
        localStorage.setItem('workflowPosition', positionName);
        document.cookie = `workflowCompany=Bloomberg; path=/; max-age=31536000`;
        document.cookie = `workflowPosition=${encodeURIComponent(positionName)}; path=/; max-age=31536000`;
    } catch(e){}
    showToast('Welcome to @bloomberg. Redirecting you to download the Bloomberg workflow…', 'success');
    setTimeout(()=>{
        window.location.href = 'profile.html';
    }, 1500);
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    showToast('Login functionality is available in the full FlowUs application.', 'info');
});

// Allow Enter key to submit invite code
document.getElementById('inviteCode').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('submitInviteBtn').click();
    }
});

// Initialize in login mode
setMode('login');
