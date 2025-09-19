// API Configuration
const API_BASE_URL = window.location.origin;

// Global Variables
let projects = [];
let stockItems = [];
let profitRecords = [];
let currentEditId = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    initializeApp();
    setupEventListeners();
    loadData();
});

// Initialize App
function initializeApp() {
    showLoading();
    setTimeout(() => {
        hideLoading();
        showToast('Welcome Admin', 'Inventory Management System loaded', 'success');
    }, 1000);
}

// Setup Event Listeners
function setupEventListeners() {
    // Bottom Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            setActiveBottomNav(this);
            closeMobileMenu();
        });
    });

    // Mobile Sidebar Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) {
                showSection(section);
                setActiveSidebarNav(this);
                closeMobileMenu();
            }
        });
    });

    // Form Submissions
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
    document.getElementById('stock-form').addEventListener('submit', handleStockSubmit);

    // Close modals on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Close mobile menu on overlay click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sidebar-overlay')) {
            closeMobileMenu();
        }
    });
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const sidebar = document.getElementById('mobileSidebar');
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    if (sidebar.classList.contains('open')) {
        closeMobileMenu();
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('open');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminEmail');
        window.location.href = 'login.html';
    }
}

// Navigation Functions
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Load section-specific data
    switch(sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'projects':
            renderProjectsTable();
            renderProjectsMobile();
            break;
        case 'stock':
            renderStockTable();
            renderStockMobile();
            break;
        case 'profit':
            renderProfitAnalysis();
            renderProfitMobile();
            break;
    }
}

function setActiveBottomNav(activeItem) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    activeItem.classList.add('active');
}

function setActiveSidebarNav(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Data Management Functions
async function loadData() {
    showLoading();
    try {
        // Load data from API endpoints
        await Promise.all([
            loadProjects(),
            loadStock(),
            loadProfitRecords()
        ]);
        updateDashboard();
        showToast('Data Loaded', 'All data has been loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Info', 'Starting with empty inventory. Add your first items!', 'info');
    } finally {
        hideLoading();
    }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        projects = await response.json();
    } catch (error) {
        console.error('Error loading projects:', error);
        projects = [];
    }
}

async function loadStock() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stock`);
        if (!response.ok) throw new Error('Failed to fetch stock');
        stockItems = await response.json();
    } catch (error) {
        console.error('Error loading stock:', error);
        stockItems = [];
    }
}

async function loadProfitRecords() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/profits`);
        if (!response.ok) throw new Error('Failed to fetch profits');
        profitRecords = await response.json();
    } catch (error) {
        console.error('Error loading profit records:', error);
        profitRecords = [];
    }
}

// Dashboard Functions
function updateDashboard() {
    updateMetrics();
    updateRecentActivity();
}

function updateMetrics() {
    // Calculate metrics
    const totalProjects = projects.length;
    const totalStockItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalProfit = profitRecords.reduce((sum, record) => sum + record.amount, 0);
    const stockValue = stockItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Update UI
    document.getElementById('total-projects').textContent = totalProjects;
    document.getElementById('total-stock-items').textContent = totalStockItems;
    document.getElementById('total-profit').textContent = `$${totalProfit.toLocaleString()}`;
    document.getElementById('stock-value').textContent = `$${stockValue.toLocaleString()}`;
}

function updateRecentActivity() {
    const activityList = document.getElementById('activity-list');
    
    if (projects.length === 0 && stockItems.length === 0 && profitRecords.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No recent activity</p>
                <small>Activity will appear here as you use the system</small>
            </div>
        `;
        return;
    }

    const activities = [];
    
    // Add recent projects
    const recentProjects = projects
        .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
        .slice(0, 2);
    
    recentProjects.forEach(project => {
        activities.push({
            icon: 'fas fa-project-diagram',
            title: `Project ${project.status}: ${project.name}`,
            time: formatTimeAgo(project.createdAt || project.startDate)
        });
    });

    // Add low stock alerts
    const lowStockItems = stockItems.filter(item => 
        item.quantity <= (item.minThreshold || 0)
    ).slice(0, 2);
    
    lowStockItems.forEach(item => {
        activities.push({
            icon: 'fas fa-exclamation-triangle',
            title: `Low stock alert: ${item.name}`,
            time: 'Now'
        });
    });

    // Add recent profits
    const recentProfits = profitRecords
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 1);
    
    recentProfits.forEach(profit => {
        activities.push({
            icon: 'fas fa-chart-line',
            title: `Profit recorded: $${profit.amount.toLocaleString()} from ${profit.source}`,
            time: formatTimeAgo(profit.date)
        });
    });

    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No recent activity</p>
            </div>
        `;
    } else {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
}

// Projects Functions
function renderProjectsTable() {
    const tbody = document.getElementById('projects-tbody');
    const emptyState = document.getElementById('projects-empty');
    
    if (projects.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    tbody.innerHTML = projects.map(project => `
        <tr>
            <td>${project.name}</td>
            <td><span class="status-badge status-${project.status}">${project.status.replace('-', ' ')}</span></td>
            <td>${formatDate(project.startDate)}</td>
            <td>$${project.budget.toLocaleString()}</td>
            <td>$${project.profit.toLocaleString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editProject('${project._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject('${project._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderProjectsMobile() {
    const container = document.getElementById('projects-mobile');
    const emptyState = document.getElementById('projects-empty');
    
    if (projects.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = projects.map(project => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">${project.name}</div>
                <div class="item-status">
                    <span class="status-badge status-${project.status}">${project.status.replace('-', ' ')}</span>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <div class="detail-label">Start Date</div>
                    <div class="detail-value">${formatDate(project.startDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Budget</div>
                    <div class="detail-value">$${project.budget.toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Profit</div>
                    <div class="detail-value">$${project.profit.toLocaleString()}</div>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-primary" onclick="editProject('${project._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject('${project._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function openProjectModal(projectId = null) {
    const modal = document.getElementById('project-modal');
    const title = document.getElementById('project-modal-title');
    const form = document.getElementById('project-form');
    
    if (projectId) {
        const project = projects.find(p => p._id === projectId);
        title.textContent = 'Edit Project';
        currentEditId = projectId;
        
        // Populate form
        document.getElementById('project-name').value = project.name;
        document.getElementById('project-status').value = project.status;
        document.getElementById('project-start-date').value = project.startDate;
        document.getElementById('project-budget').value = project.budget;
        document.getElementById('project-profit').value = project.profit;
        document.getElementById('project-description').value = project.description || '';
    } else {
        title.textContent = 'Add Project';
        currentEditId = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeProjectModal() {
    document.getElementById('project-modal').style.display = 'none';
    currentEditId = null;
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        name: document.getElementById('project-name').value,
        status: document.getElementById('project-status').value,
        startDate: document.getElementById('project-start-date').value,
        budget: parseFloat(document.getElementById('project-budget').value),
        profit: parseFloat(document.getElementById('project-profit').value) || 0,
        description: document.getElementById('project-description').value
    };

    try {
        let response;
        if (currentEditId) {
            // Update existing project
            response = await fetch(`${API_BASE_URL}/api/projects/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            showToast('Success', 'Project updated successfully', 'success');
        } else {
            // Add new project
            response = await fetch(`${API_BASE_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            showToast('Success', 'Project added successfully', 'success');
        }
        
        if (!response.ok) {
            throw new Error('Failed to save project');
        }
        
        closeProjectModal();
        await loadProjects();
        renderProjectsTable();
        renderProjectsMobile();
        updateDashboard();
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('Error', 'Failed to save project', 'error');
    } finally {
        hideLoading();
    }
}

function editProject(projectId) {
    openProjectModal(projectId);
}

async function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        showLoading();
        try {
            const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete project');
            }
            
            await loadProjects();
            renderProjectsTable();
            updateDashboard();
            showToast('Success', 'Project deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast('Error', 'Failed to delete project', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Stock Functions
function renderStockTable() {
    const tbody = document.getElementById('stock-tbody');
    const emptyState = document.getElementById('stock-empty');
    
    if (stockItems.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    tbody.innerHTML = stockItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.category.replace('-', ' ')}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toLocaleString()}</td>
            <td>$${(item.quantity * item.unitPrice).toLocaleString()}</td>
            <td>
                <span class="status-badge ${getStockStatus(item)}">
                    ${getStockStatusText(item)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editStock('${item._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStock('${item._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderStockMobile() {
    const container = document.getElementById('stock-mobile');
    const emptyState = document.getElementById('stock-empty');
    
    if (stockItems.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = stockItems.map(item => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">${item.name}</div>
                <div class="item-status">
                    <span class="status-badge ${getStockStatus(item)}">${getStockStatusText(item)}</span>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <div class="detail-label">Category</div>
                    <div class="detail-value">${item.category.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Quantity</div>
                    <div class="detail-value">${item.quantity}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Unit Price</div>
                    <div class="detail-value">$${item.unitPrice.toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Value</div>
                    <div class="detail-value">$${(item.quantity * item.unitPrice).toLocaleString()}</div>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-primary" onclick="editStock('${item._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStock('${item._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function getStockStatus(item) {
    if (item.quantity === 0) return 'status-out-of-stock';
    if (item.quantity <= item.minThreshold) return 'status-low-stock';
    return 'status-in-stock';
}

function getStockStatusText(item) {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.minThreshold) return 'Low Stock';
    return 'In Stock';
}

function openStockModal(stockId = null) {
    const modal = document.getElementById('stock-modal');
    const title = document.getElementById('stock-modal-title');
    const form = document.getElementById('stock-form');
    
    if (stockId) {
        const stock = stockItems.find(s => s._id === stockId);
        title.textContent = 'Edit Stock Item';
        currentEditId = stockId;
        
        // Populate form
        document.getElementById('stock-name').value = stock.name;
        document.getElementById('stock-category').value = stock.category;
        document.getElementById('stock-quantity').value = stock.quantity;
        document.getElementById('stock-unit-price').value = stock.unitPrice;
        document.getElementById('stock-min-threshold').value = stock.minThreshold;
        document.getElementById('stock-supplier').value = stock.supplier || '';
    } else {
        title.textContent = 'Add Stock Item';
        currentEditId = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeStockModal() {
    document.getElementById('stock-modal').style.display = 'none';
    currentEditId = null;
}

async function handleStockSubmit(e) {
    e.preventDefault();
    showLoading();
    
    const formData = {
        name: document.getElementById('stock-name').value,
        category: document.getElementById('stock-category').value,
        quantity: parseInt(document.getElementById('stock-quantity').value),
        unitPrice: parseFloat(document.getElementById('stock-unit-price').value),
        minThreshold: parseInt(document.getElementById('stock-min-threshold').value),
        supplier: document.getElementById('stock-supplier').value
    };

    try {
        let response;
        if (currentEditId) {
            // Update existing stock item
            response = await fetch(`${API_BASE_URL}/api/stock/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            showToast('Success', 'Stock item updated successfully', 'success');
        } else {
            // Add new stock item
            response = await fetch(`${API_BASE_URL}/api/stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            showToast('Success', 'Stock item added successfully', 'success');
        }
        
        if (!response.ok) {
            throw new Error('Failed to save stock item');
        }
        
        closeStockModal();
        await loadStock();
        renderStockTable();
        renderStockMobile();
        updateDashboard();
    } catch (error) {
        console.error('Error saving stock item:', error);
        showToast('Error', 'Failed to save stock item', 'error');
    } finally {
        hideLoading();
    }
}

function editStock(stockId) {
    openStockModal(stockId);
}

async function deleteStock(stockId) {
    if (confirm('Are you sure you want to delete this stock item?')) {
        showLoading();
        try {
            const response = await fetch(`${API_BASE_URL}/api/stock/${stockId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete stock item');
            }
            
            await loadStock();
            renderStockTable();
            updateDashboard();
            showToast('Success', 'Stock item deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting stock item:', error);
            showToast('Error', 'Failed to delete stock item', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Profit Functions
function renderProfitAnalysis() {
    updateProfitMetrics();
    renderProfitTable();
    renderProfitMobile();
}

function updateProfitMetrics() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyProfit = profitRecords
        .filter(record => record.date.slice(0, 7) === currentMonth)
        .reduce((sum, record) => sum + record.amount, 0);
    
    const projectRevenue = profitRecords
        .filter(record => record.type === 'project')
        .reduce((sum, record) => sum + record.amount, 0);
    
    const totalStockValue = stockItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const stockTurnover = totalStockValue > 0 ? ((profitRecords
        .filter(record => record.type === 'stock')
        .reduce((sum, record) => sum + record.amount, 0)) / totalStockValue * 100).toFixed(1) : 0;

    document.getElementById('monthly-profit').textContent = `$${monthlyProfit.toLocaleString()}`;
    document.getElementById('project-revenue').textContent = `$${projectRevenue.toLocaleString()}`;
    document.getElementById('stock-turnover').textContent = `${stockTurnover}%`;
}

function renderProfitTable() {
    const tbody = document.getElementById('profit-tbody');
    const emptyState = document.getElementById('profit-empty');
    
    if (profitRecords.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    tbody.innerHTML = profitRecords.map(record => `
        <tr>
            <td>${record.source}</td>
            <td><span class="status-badge status-${record.type}">${record.type}</span></td>
            <td>$${record.amount.toLocaleString()}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.margin}%</td>
        </tr>
    `).join('');
}

function renderProfitMobile() {
    const container = document.getElementById('profit-mobile');
    const emptyState = document.getElementById('profit-empty');
    
    if (profitRecords.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = profitRecords.map(record => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">${record.source}</div>
                <div class="item-status">
                    <span class="status-badge status-${record.type}">${record.type}</span>
                </div>
            </div>
            <div class="item-details">
                <div class="detail-item">
                    <div class="detail-label">Amount</div>
                    <div class="detail-value">$${record.amount.toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${formatDate(record.date)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Margin</div>
                    <div class="detail-value">${record.margin}%</div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProfitData() {
    const selectedMonth = document.getElementById('profit-month').value;
    if (selectedMonth) {
        const filteredRecords = profitRecords.filter(record => 
            record.date.slice(0, 7) === selectedMonth
        );
        // Update table with filtered data
        const tbody = document.getElementById('profit-tbody');
        tbody.innerHTML = filteredRecords.map(record => `
            <tr>
                <td>${record.source}</td>
                <td><span class="status-badge status-${record.type}">${record.type}</span></td>
                <td>$${record.amount.toLocaleString()}</td>
                <td>${formatDate(record.date)}</td>
                <td>${record.margin}%</td>
            </tr>
        `).join('');
        
        // Update mobile cards with filtered data
        const container = document.getElementById('profit-mobile');
        container.innerHTML = filteredRecords.map(record => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${record.source}</div>
                    <div class="item-status">
                        <span class="status-badge status-${record.type}">${record.type}</span>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <div class="detail-label">Amount</div>
                        <div class="detail-value">$${record.amount.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date</div>
                        <div class="detail-value">${formatDate(record.date)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Margin</div>
                        <div class="detail-value">${record.margin}%</div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        renderProfitTable();
        renderProfitMobile();
    }
}

function exportAllData() {
    const allData = {
        projects: projects,
        stock: stockItems,
        profits: profitRecords,
        exportDate: new Date().toISOString(),
        totalProjects: projects.length,
        totalStockValue: stockItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        totalProfit: profitRecords.reduce((sum, record) => sum + record.amount, 0)
    };
    
    const csvContent = generateFullCSVReport(allData);
    downloadCSV(csvContent, `inventory-full-export-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Success', 'Full inventory data exported successfully', 'success');
}

function generateFullCSVReport(data) {
    let csv = 'INVENTORY MANAGEMENT SYSTEM - FULL EXPORT\n';
    csv += `Export Date: ${new Date(data.exportDate).toLocaleDateString()}\n`;
    csv += `Total Projects: ${data.totalProjects}\n`;
    csv += `Total Stock Value: $${data.totalStockValue.toLocaleString()}\n`;
    csv += `Total Profit: $${data.totalProfit.toLocaleString()}\n\n`;
    
    // Projects section
    csv += 'PROJECTS\n';
    csv += 'Name,Status,Start Date,Budget,Profit,Description\n';
    data.projects.forEach(project => {
        csv += `"${project.name}","${project.status}","${project.startDate}","${project.budget}","${project.profit}","${project.description || ''}"\n`;
    });
    
    csv += '\n';
    
    // Stock section
    csv += 'STOCK ITEMS\n';
    csv += 'Name,Category,Quantity,Unit Price,Total Value,Min Threshold,Supplier\n';
    data.stock.forEach(item => {
        csv += `"${item.name}","${item.category}","${item.quantity}","${item.unitPrice}","${item.quantity * item.unitPrice}","${item.minThreshold}","${item.supplier || ''}"\n`;
    });
    
    csv += '\n';
    
    // Profits section
    csv += 'PROFIT RECORDS\n';
    csv += 'Source,Type,Amount,Date,Margin\n';
    data.profits.forEach(record => {
        csv += `"${record.source}","${record.type}","${record.amount}","${record.date}","${record.margin}%"\n`;
    });
    
    return csv;
}

function exportProfitReport() {
    const csvContent = generateCSVReport();
    downloadCSV(csvContent, 'profit-report.csv');
    showToast('Success', 'Profit report exported successfully', 'success');
}

function generateCSVReport() {
    const headers = ['Source', 'Type', 'Amount', 'Date', 'Margin'];
    const rows = profitRecords.map(record => [
        record.source,
        record.type,
        record.amount,
        record.date,
        record.margin + '%'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Utility Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    currentEditId = null;
}

function refreshData() {
    loadData();
}

// MongoDB Integration Functions - Now using actual API endpoints
async function saveToMongoDB(collection, data) {
    const response = await fetch(`${API_BASE_URL}/api/${collection}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to save to ${collection}`);
    }
    
    return await response.json();
}

async function fetchFromMongoDB(collection, query = {}) {
    const response = await fetch(`${API_BASE_URL}/api/${collection}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch from ${collection}`);
    }
    
    return await response.json();
}

async function updateInMongoDB(collection, id, data) {
    const response = await fetch(`${API_BASE_URL}/api/${collection}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to update ${collection} document ${id}`);
    }
    
    return await response.json();
}

async function deleteFromMongoDB(collection, id) {
    const response = await fetch(`${API_BASE_URL}/api/${collection}/${id}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error(`Failed to delete from ${collection} document ${id}`);
    }
    
    return await response.json();
}