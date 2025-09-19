const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
let db;
let client;

async function connectToMongoDB() {
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('bongoportus');
        console.log('Connected to MongoDB Atlas');
        
        // Create collections if they don't exist
        await ensureCollections();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

async function ensureCollections() {
    const collections = ['projects', 'stock', 'profits', 'admin'];
    for (const collectionName of collections) {
        try {
            await db.createCollection(collectionName);
            console.log(`Collection '${collectionName}' created or already exists`);
        } catch (error) {
            if (error.code !== 48) { // Collection already exists
                console.error(`Error creating collection ${collectionName}:`, error);
            }
        }
    }
    
    // Ensure admin user exists
    const adminExists = await db.collection('admin').findOne({ email: 'umorfaruksupto@gmail.com' });
    if (!adminExists) {
        await db.collection('admin').insertOne({
            email: 'umorfaruksupto@gmail.com',
            password: 'your_password_here', // Replace with actual password
            role: 'admin',
            createdAt: new Date()
        });
        console.log('Admin user created');
    }
}

// Routes

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Authentication endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check admin credentials
        if (email === 'umorfaruksupto@gmail.com') {
            // In production, you should verify the password against a hashed version in the database
            // For now, we'll check against a simple admin collection
            const adminUser = await db.collection('admin').findOne({ email: email });
            
            if (adminUser && adminUser.password === password) {
                res.json({ 
                    success: true, 
                    message: 'Login successful',
                    user: { email: email, role: 'admin' }
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Unauthorized access' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Projects API
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await db.collection('projects').find({}).toArray();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const project = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('projects').insertOne(project);
        const newProject = await db.collection('projects').findOne({ _id: result.insertedId });
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        delete updateData._id; // Remove _id from update data
        
        const result = await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const updatedProject = await db.collection('projects').findOne({ _id: new ObjectId(id) });
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Stock API
app.get('/api/stock', async (req, res) => {
    try {
        const stock = await db.collection('stock').find({}).toArray();
        res.json(stock);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ error: 'Failed to fetch stock' });
    }
});

app.post('/api/stock', async (req, res) => {
    try {
        const stockItem = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('stock').insertOne(stockItem);
        const newStockItem = await db.collection('stock').findOne({ _id: result.insertedId });
        res.status(201).json(newStockItem);
    } catch (error) {
        console.error('Error creating stock item:', error);
        res.status(500).json({ error: 'Failed to create stock item' });
    }
});

app.put('/api/stock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        delete updateData._id;
        
        const result = await db.collection('stock').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Stock item not found' });
        }
        
        const updatedStockItem = await db.collection('stock').findOne({ _id: new ObjectId(id) });
        res.json(updatedStockItem);
    } catch (error) {
        console.error('Error updating stock item:', error);
        res.status(500).json({ error: 'Failed to update stock item' });
    }
});

app.delete('/api/stock/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection('stock').deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Stock item not found' });
        }
        
        res.json({ message: 'Stock item deleted successfully' });
    } catch (error) {
        console.error('Error deleting stock item:', error);
        res.status(500).json({ error: 'Failed to delete stock item' });
    }
});

// Profits API
app.get('/api/profits', async (req, res) => {
    try {
        const profits = await db.collection('profits').find({}).toArray();
        res.json(profits);
    } catch (error) {
        console.error('Error fetching profits:', error);
        res.status(500).json({ error: 'Failed to fetch profits' });
    }
});

app.post('/api/profits', async (req, res) => {
    try {
        const profitRecord = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('profits').insertOne(profitRecord);
        const newProfitRecord = await db.collection('profits').findOne({ _id: result.insertedId });
        res.status(201).json(newProfitRecord);
    } catch (error) {
        console.error('Error creating profit record:', error);
        res.status(500).json({ error: 'Failed to create profit record' });
    }
});

// Dashboard Analytics API
app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const [projects, stock, profits] = await Promise.all([
            db.collection('projects').find({}).toArray(),
            db.collection('stock').find({}).toArray(),
            db.collection('profits').find({}).toArray()
        ]);

        const analytics = {
            totalProjects: projects.length,
            totalStockItems: stock.reduce((sum, item) => sum + (item.quantity || 0), 0),
            totalProfit: profits.reduce((sum, record) => sum + (record.amount || 0), 0),
            stockValue: stock.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0),
            projectsByStatus: projects.reduce((acc, project) => {
                acc[project.status] = (acc[project.status] || 0) + 1;
                return acc;
            }, {}),
            lowStockItems: stock.filter(item => 
                item.quantity <= (item.minThreshold || 0)
            ).length,
            recentActivity: generateRecentActivity(projects, stock, profits)
        };

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
});

function generateRecentActivity(projects, stock, profits) {
    const activities = [];
    
    // Recent projects
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

    // Low stock alerts
    const lowStockItems = stock.filter(item => 
        item.quantity <= (item.minThreshold || 0)
    ).slice(0, 2);
    
    lowStockItems.forEach(item => {
        activities.push({
            icon: 'fas fa-exclamation-triangle',
            title: `Low stock alert: ${item.name}`,
            time: 'Now'
        });
    });

    // Recent profits
    const recentProfits = profits
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 1);
    
    recentProfits.forEach(profit => {
        activities.push({
            icon: 'fas fa-chart-line',
            title: `Profit recorded: $${profit.amount.toLocaleString()} from ${profit.source}`,
            time: formatTimeAgo(profit.date)
        });
    });

    return activities.slice(0, 4);
}

function formatTimeAgo(dateString) {
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

// Initialize sample data if collections are empty - REMOVED
// This endpoint is removed to prevent automatic sample data creation
app.post('/api/init-sample-data', async (req, res) => {
    res.json({ message: 'Sample data initialization disabled. Please add data manually.' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (client) {
        await client.close();
    }
    process.exit(0);
});

// Start server
async function startServer() {
    await connectToMongoDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Inventory Management System is ready!');
    });
}

startServer().catch(console.error);