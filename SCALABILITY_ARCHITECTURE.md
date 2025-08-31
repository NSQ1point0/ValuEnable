# Scalable Architecture for Benefit Illustration Module

## Overview
This document outlines the scalable architecture approach designed to handle millions of bulk inputs for policy benefit calculations while maintaining performance, reliability, and data integrity.

## Current Implementation

### 1. Database Design
- **MySQL with Sequelize ORM** for ACID compliance and relational integrity
- **Proper indexing** on frequently queried fields:
  - User table: email, name_hash, mobile_hash
  - Policy table: user_id, policy_status, calculation_date
  - Illustration table: policy_id, year (composite unique index)

### 2. Data Security
- **Sensitive data masking**: Names, mobile numbers hashed with bcrypt
- **Encryption**: DOB encrypted using AES-256-CBC
- **JWT authentication** with token expiration
- **Environment-based configuration** for security keys

### 3. Current Bulk Processing
- **Batch processing**: 1000 records per batch to prevent memory overflow
- **Error handling**: Individual record failure doesn't stop entire batch
- **Progress tracking**: Success/failure rates for monitoring

## Scalability Enhancements for Millions of Records

### 1. Queue-Based Architecture

#### Message Queue Implementation
```javascript
// Redis Queue for background processing
const Bull = require('bull');
const calculationQueue = new Bull('calculation queue', {
  redis: { port: 6379, host: '127.0.0.1' }
});

// Job processor
calculationQueue.process('bulk-calculation', 10, async (job) => {
  const { batchData, batchId } = job.data;
  return await processBatch(batchData, batchId);
});
```

#### Benefits:
- **Asynchronous processing**: Non-blocking bulk operations
- **Horizontal scaling**: Multiple worker processes
- **Retry mechanism**: Failed jobs automatically retried
- **Progress tracking**: Real-time status updates

### 2. Database Optimizations

#### Read Replicas
```javascript
// Master-Slave configuration
const masterDB = new Sequelize(masterConfig);
const slaveDB = new Sequelize(slaveConfig);

// Route reads to slaves, writes to master
const getConnection = (operation) => {
  return operation === 'read' ? slaveDB : masterDB;
};
```

#### Partitioning Strategy
```sql
-- Partition illustrations table by year
CREATE TABLE illustrations_y2024 PARTITION OF illustrations 
FOR VALUES FROM (2024) TO (2025);

-- Index optimization for bulk operations
CREATE INDEX CONCURRENTLY idx_policy_calculations 
ON policies (user_id, calculation_date DESC);
```

### 3. Caching Strategy

#### Redis Caching
```javascript
// Cache calculation rules and frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Cache validation rules
const getCachedRules = async () => {
  const cached = await client.get('calculation_rules');
  if (cached) return JSON.parse(cached);
  
  const rules = await fetchRulesFromDB();
  await client.setex('calculation_rules', 3600, JSON.stringify(rules));
  return rules;
};
```

#### Application-Level Caching
- **In-memory caching** for validation rules and lookup tables
- **Query result caching** for frequently accessed policy data
- **CDN integration** for static assets

### 4. Microservices Architecture

#### Service Decomposition
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │Calculation Service│   │  Policy Service │
│   (User Mgmt)   │    │ (Bulk Processing) │   │  (CRUD Ops)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
               ┌─────────────────────────────┐
               │     API Gateway             │
               │   (Rate Limiting, Auth)     │
               └─────────────────────────────┘
```

#### Benefits:
- **Independent scaling**: Scale calculation service separately
- **Technology flexibility**: Use optimal tech stack per service
- **Fault isolation**: Service failures don't cascade
- **Team autonomy**: Different teams can own different services

### 5. Bulk Processing Pipeline

#### Multi-Stage Processing
```javascript
// Stage 1: Input validation and chunking
const preprocessBulkData = async (rawData) => {
  const chunks = chunk(rawData, BATCH_SIZE);
  const validationJobs = chunks.map(chunk => ({
    type: 'validate',
    data: chunk,
    priority: 'high'
  }));
  
  return await Promise.all(validationJobs);
};

// Stage 2: Parallel calculation
const processBulkCalculations = async (validatedChunks) => {
  const calculationPromises = validatedChunks.map(chunk => 
    calculationQueue.add('bulk-calculation', chunk, {
      attempts: 3,
      backoff: 'exponential'
    })
  );
  
  return await Promise.all(calculationPromises);
};

// Stage 3: Results aggregation and storage
const aggregateAndStore = async (results) => {
  const transaction = await sequelize.transaction();
  try {
    await bulkInsertResults(results, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

### 6. Performance Optimizations

#### Database Bulk Operations
```javascript
// Optimized bulk insert with conflict resolution
const bulkInsertIllustrations = async (illustrations) => {
  return await Illustration.bulkCreate(illustrations, {
    updateOnDuplicate: ['total_benefit', 'surrender_value', 'death_benefit'],
    validate: false, // Skip individual validations for performance
    ignoreDuplicates: false
  });
};
```

#### Memory Management
```javascript
// Stream processing for large datasets
const processLargeFile = async (filePath) => {
  const stream = fs.createReadStream(filePath);
  const parser = csv();
  
  let batch = [];
  const BATCH_SIZE = 1000;
  
  return new Promise((resolve, reject) => {
    stream
      .pipe(parser)
      .on('data', async (row) => {
        batch.push(row);
        
        if (batch.length >= BATCH_SIZE) {
          await processBatch(batch);
          batch = []; // Clear memory
        }
      })
      .on('end', async () => {
        if (batch.length > 0) {
          await processBatch(batch);
        }
        resolve();
      })
      .on('error', reject);
  });
};
```

### 7. Monitoring and Observability

#### Metrics Collection
```javascript
// Performance metrics
const prometheus = require('prom-client');

const calculationDuration = new prometheus.Histogram({
  name: 'calculation_duration_seconds',
  help: 'Duration of benefit calculations',
  labelNames: ['batch_size', 'status']
});

const throughputCounter = new prometheus.Counter({
  name: 'calculations_processed_total',
  help: 'Total number of calculations processed',
  labelNames: ['status']
});
```

#### Health Checks
```javascript
// Comprehensive health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      queue: await checkQueueHealth()
    },
    metrics: {
      activeConnections: await getActiveConnections(),
      queueSize: await getQueueSize(),
      memoryUsage: process.memoryUsage()
    }
  };
  
  res.json(health);
});
```

### 8. Deployment Architecture

#### Container Orchestration
```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mysql
      - redis
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: benefit_illustration
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  worker:
    build: .
    command: node worker.js
    environment:
      - NODE_ENV=production
    depends_on:
      - mysql
      - redis
    deploy:
      replicas: 3
```

#### Kubernetes Scaling
```yaml
# kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: calculation-service
spec:
  replicas: 10
  selector:
    matchLabels:
      app: calculation-service
  template:
    metadata:
      labels:
        app: calculation-service
    spec:
      containers:
      - name: app
        image: benefit-calculation:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: calculation-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 5000
  selector:
    app: calculation-service
```

### 9. Estimated Performance Metrics

#### Current Capacity (Single Instance)
- **Calculations per second**: ~500-1000
- **Concurrent users**: ~100
- **Database connections**: 20 (connection pool)

#### Scaled Capacity (Production Setup)
- **Calculations per second**: ~50,000-100,000
- **Concurrent users**: ~10,000
- **Daily processing capacity**: ~1 billion calculations
- **Storage growth**: ~100GB per month for 1M policies

### 10. Implementation Roadmap

#### Phase 1: Queue Integration (Week 1-2)
- Implement Redis/Bull queue
- Add background job processing
- Basic monitoring and logging

#### Phase 2: Database Optimization (Week 3-4)
- Set up read replicas
- Implement table partitioning
- Add comprehensive indexing

#### Phase 3: Microservices (Week 5-8)
- Extract calculation service
- Implement API gateway
- Add service discovery

#### Phase 4: Advanced Features (Week 9-12)
- Real-time progress tracking
- Advanced caching strategies
- Performance analytics dashboard

### 11. Cost Optimization

#### Resource Utilization
- **Auto-scaling**: Scale workers based on queue depth
- **Spot instances**: Use for non-critical batch processing
- **Connection pooling**: Optimize database connections
- **Compression**: Reduce data transfer and storage costs

#### Monitoring Costs
```javascript
// Cost tracking middleware
const trackResourceUsage = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const cost = calculateProcessingCost(duration, req.body?.length || 1);
    
    logMetrics({
      endpoint: req.path,
      duration,
      recordsProcessed: req.body?.length || 1,
      estimatedCost: cost
    });
  });
  
  next();
};
```

This architecture can efficiently handle millions of bulk inputs while maintaining data integrity, security, and performance standards required for insurance calculations.
