# 🚀 QUICK DEPLOYMENT GUIDE

## 1. Frontend Deployment (Vercel) - FREE

### Step 1: Prepare Frontend
```bash
# Download your code and extract it
cd pulse-auto-market-production/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Upload your `frontend` folder
5. Set environment variable:
   - `REACT_APP_BACKEND_URL` = `https://your-backend-url.railway.app`

**Result: Your frontend will be live at `https://your-app.vercel.app`**

## 2. Backend + Database Deployment (Railway) - FREE

### Step 1: Deploy Backend
1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Upload your `backend` folder
5. Railway auto-detects Python and installs dependencies

### Step 2: Add MongoDB
1. In Railway dashboard, click "New" → "Database" → "MongoDB"
2. Copy the connection string
3. Set environment variables:
   - `MONGO_URL` = `mongodb://[railway-mongo-connection]`
   - `DB_NAME` = `pulse_auto_market`

### Step 3: Upload Vehicle Data
```bash
# Connect to your Railway MongoDB and import vehicles
mongoimport --uri "your-railway-mongo-url" --collection vehicles --file vehicles.json
```

**Result: Your backend will be live at `https://your-backend.railway.app`**

## 3. Custom Domain (Optional)
- Buy domain from Namecheap/GoDaddy
- Point to Vercel in DNS settings
- Result: `https://pulseautomarket.com`

## 4. Total Deployment Time: ~30 minutes
## 5. Total Cost: FREE (on free tiers)