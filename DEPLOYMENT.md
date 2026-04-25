# Deployment Guide

## Preparing for Production

### 1. Environment Configuration

#### Server (.env for production)
```
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-domain.com
MONGO_URL=mongodb://your-mongodb-connection-string
```

#### Client (.env.production)
```
REACT_APP_SERVER_URL=https://your-api-domain.com
```

### 2. Building the Application

#### Build the React Client
```bash
cd client
npm run build
```

This creates an optimized production build in `client/build/`

#### Install Production Dependencies
```bash
# For server
cd server
npm install --production
```

### 3. Deployment Options

#### Option A: Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
   heroku config:set MONGO_URL=your-mongodb-uri
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Option B: AWS/DigitalOcean/Google Cloud Deployment

1. **Build and prepare files**
   ```bash
   npm run build
   ```

2. **Upload to server**
   - Use SCP, SFTP, or GitHub deployment
   - Keep `server/` and `client/build/` directories

3. **Install and run**
   ```bash
   cd server
   npm install
   npm start
   ```

#### Option C: Docker Deployment

1. **Create Dockerfile for the project**
   ```dockerfile
   FROM node:16
   
   WORKDIR /app
   
   # Copy server files
   COPY server ./server
   WORKDIR /app/server
   RUN npm install
   
   # Copy client files and build
   COPY client ./client
   WORKDIR /app/client
   RUN npm install
   RUN npm run build
   
   # Move build to server public folder
   RUN cp -r /app/client/build /app/server/public
   
   # Start server
   WORKDIR /app/server
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build Docker image**
   ```bash
   docker build -t collaborative-editor .
   ```

3. **Run Docker container**
   ```bash
   docker run -p 5000:5000 \
     -e NODE_ENV=production \
     -e CLIENT_URL=https://your-domain.com \
     -e MONGO_URL=your-mongodb-uri \
     collaborative-editor
   ```

#### Option D: Vercel + Heroku/Railway

- Deploy React frontend to Vercel (free)
- Deploy Node.js backend to Heroku/Railway/Render

### 4. Serving Static Files from Express

To serve the React build from the Express server:

```javascript
// Add to server.js
const path = require('path');

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
```

### 5. Database Considerations

#### Without MongoDB (In-Memory)
- Perfect for development and small teams
- Data is lost when server restarts
- Suitable for temporary collaborations

#### With MongoDB
1. **Set up MongoDB Atlas** (free tier available)
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string

2. **Update environment variables**
   ```
   MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/collaborative-editor
   ```

3. **Optional: Add message persistence**
   Create `server/models/Message.js`:
   ```javascript
   const mongoose = require('mongoose');
   
   const messageSchema = new mongoose.Schema({
     roomId: String,
     username: String,
     message: String,
     timestamp: {
       type: Date,
       default: Date.now
     }
   });
   
   module.exports = mongoose.model('Message', messageSchema);
   ```

### 6. SSL/TLS Certificate

For HTTPS (required for production):

#### Using Let's Encrypt
```bash
# Using Certbot
sudo certbot certonly --standalone -d your-domain.com
```

#### Configure in Express (if needed)
```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();

const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

### 7. Performance Optimization

#### Frontend
- Minification: Handled by React build
- Code splitting: Built-in with React
- Caching: Configure in nginx/Apache
- CDN: Serve static assets from CDN

#### Backend
- Connection pooling: Use with MongoDB
- Load balancing: If running multiple instances
- Caching: Add Redis for session/message caching
- Compression: Add `compression` middleware

```javascript
const compression = require('compression');
app.use(compression());
```

### 8. Monitoring and Logging

#### Add logging to server

```javascript
const fs = require('fs');
const path = require('path');

// Simple file logging
const logFile = fs.createWriteStream(
  path.join(__dirname, 'server.log'),
  { flags: 'a' }
);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logFile.write(logMessage);
  console.log(logMessage);
}

io.on('connection', (socket) => {
  log(`User connected: ${socket.id}`);
});
```

#### Third-party monitoring
- **PM2**: Process manager for Node.js
- **Sentry**: Error tracking
- **DataDog**: APM and monitoring
- **Loggly**: Cloud logging

### 9. Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS only for your domain
- [ ] Use HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Implement user authentication (future enhancement)

```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
```

### 10. Backup Strategy

- Regular MongoDB backups (Atlas handles this)
- Application code in Git with version control
- Environment variables stored separately
- Document backups exported regularly

---

## Monitoring Production

### Health Checks
Monitor the `/health` endpoint regularly:
```bash
curl https://your-domain.com/health
```

### Common Issues

**High Memory Usage**
- Limit room state with timeouts
- Implement message archiving
- Use MongoDB for long-term storage

**Slow Performance**
- Add caching layer
- Optimize Socket.IO settings
- Use CDN for static files

**Connection Issues**
- Check firewall rules
- Verify DNS records
- Test WebSocket support

---

## Scaling Strategies

For production with many users:

1. **Horizontal Scaling**: Run multiple server instances
2. **Load Balancing**: Use nginx or HAProxy
3. **Message Queue**: Add Redis for inter-server communication
4. **Database**: Implement MongoDB sharding
5. **CDN**: Serve static assets from CDN

---

Good luck with your production deployment! 🚀
