# Bongoportus Admin - Inventory Management System

A modern, mobile-first inventory management system with admin authentication built with HTML, CSS, JavaScript, and Node.js, integrated with MongoDB Atlas.

## 🎯 Features

- **📱 Mobile-First Design** - Works like a native mobile app
- **🔐 Admin Authentication** - Secure login system
- **📊 Real-time Dashboard** - Live metrics and analytics
- **📋 Project Management** - Track projects, budgets, and profitability
- **📦 Stock Management** - Monitor inventory with low-stock alerts
- **💰 Profit Analysis** - Analyze revenue and export reports
- **🌐 MongoDB Integration** - Cloud database with Atlas

## 🏗️ Project Structure

```
bongoportus/
├── frontend/           # Frontend application
│   ├── index.html     # Main dashboard
│   ├── login.html     # Login page
│   ├── styles.css     # Mobile-first CSS
│   ├── script.js      # Main JavaScript
│   ├── login.js       # Login functionality
│   └── package.json   # Frontend dependencies
├── backend/           # Backend API server
│   ├── server.js      # Express.js server
│   ├── package.json   # Backend dependencies
│   └── .env          # Environment variables
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Update `.env` file with your MongoDB Atlas URI
   - Set admin password in MongoDB admin collection

4. **Start the backend server:**
   ```bash
   npm start
   ```
   Server will run on http://localhost:3000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (optional for development):**
   ```bash
   npm install
   ```

3. **For development with live reload:**
   ```bash
   npm run dev
   ```

### Production Deployment

The frontend files can be served by the backend server directly, or deployed to any static hosting service.

## 🔑 Admin Access

- **Email:** `umorfaruksupto@gmail.com`
- **Password:** Set in MongoDB admin collection
- **Access:** http://localhost:3000

## 📱 Mobile Features

- **Bottom Navigation** - Native app-like navigation
- **Card-based UI** - Touch-friendly interface
- **Responsive Design** - Works on all device sizes
- **Swipe Gestures** - Mobile-optimized interactions
- **Touch Targets** - 44px minimum touch areas

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Mobile-first responsive design
- **JavaScript (ES6+)** - Modern JavaScript features
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## 📊 API Endpoints

### Authentication
- `POST /api/login` - Admin login

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Stock
- `GET /api/stock` - Get all stock items
- `POST /api/stock` - Create stock item
- `PUT /api/stock/:id` - Update stock item
- `DELETE /api/stock/:id` - Delete stock item

### Profits
- `GET /api/profits` - Get profit records
- `POST /api/profits` - Create profit record

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics

## 🔒 Security Features

- **Environment Variables** - Sensitive data protection
- **CORS Configuration** - Cross-origin security
- **Helmet.js** - Security headers
- **Input Validation** - Data sanitization
- **Admin Authentication** - Access control

## 📈 Database Schema

### Projects Collection
```javascript
{
  name: String,
  status: String, // 'planning', 'in-progress', 'completed', 'on-hold'
  startDate: String,
  budget: Number,
  profit: Number,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Stock Collection
```javascript
{
  name: String,
  category: String, // 'materials', 'tools', 'equipment', 'supplies', 'finished-goods'
  quantity: Number,
  unitPrice: Number,
  minThreshold: Number,
  supplier: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Profits Collection
```javascript
{
  source: String,
  type: String, // 'project', 'stock'
  amount: Number,
  date: String,
  margin: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Backend (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Deploy backend folder
3. Configure MongoDB Atlas IP whitelist

### Frontend (Netlify/Vercel/GitHub Pages)
1. Deploy frontend folder
2. Update API endpoints in `script.js`
3. Configure CORS in backend

## 🔧 Development

### Running in Development Mode

1. **Backend with auto-restart:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend with live reload:**
   ```bash
   cd frontend
   npm run dev
   ```

### Making Changes

1. **Frontend changes** - Edit files in `frontend/` directory
2. **Backend changes** - Edit files in `backend/` directory
3. **Database changes** - Update via MongoDB Atlas dashboard

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Umor Faruk Supto**
- Email: umorfaruksupto@gmail.com
- GitHub: [@suptoo](https://github.com/suptoo)

## 🆘 Support

For support, email umorfaruksupto@gmail.com or create an issue in the GitHub repository.

---

**Built with ❤️ for efficient inventory management**
---

**Built with ❤️ for efficient inventory management**
