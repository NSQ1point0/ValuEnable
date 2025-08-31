# Benefit Illustration Module

A comprehensive insurance policy benefit calculation and illustration system built with React frontend and Node.js backend.

## Features

### Core Functionality
- ✅ **User Authentication** with secure data masking
- ✅ **Policy Calculation** with real-time validation
- ✅ **Benefit Illustration** with dynamic tables
- ✅ **Input Validation** (5 validation rules from spreadsheet)
- ✅ **Scalable Architecture** for bulk processing
- ✅ **Unit Testing** for validation and calculation logic

### Security Features
- 🔐 Sensitive data encryption (DOB)
- 🔐 Sensitive data hashing (Name, Mobile)
- 🔐 JWT authentication with token expiration
- 🔐 Environment-based configuration
- 🔐 SQL injection prevention with Sequelize ORM

### Validation Rules (Based on Spreadsheet)
1. **PPT (Premium Paying Term)**: 5-10 years
2. **PT (Policy Term)**: 10-20 years
3. **Premium**: ₹10,000 - ₹50,000
4. **PT > PPT**: Policy Term must be greater than Premium Paying Term
5. **Age**: 23-56 years (calculated from DOB)

## Project Structure

```
benefit-illustration/
├── backend/                 # Node.js Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # API controllers
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── tests/              # Unit tests
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
└── README.md
```

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** with Sequelize ORM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Joi** for input validation
- **Jest** for unit testing

### Frontend
- **React** 18.x
- **Material-UI** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **React Context** for state management

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone and Setup Backend

```bash
cd backend
npm install
```

### 2. Database Setup

Create MySQL database:
```sql
CREATE DATABASE benefit_illustration;
```

Copy environment file and configure:
```bash
cp .env.example .env
```

Update `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=benefit_illustration
JWT_SECRET=your-super-secure-jwt-secret
ENCRYPTION_KEY=your-super-secure-encryption-key
```

### 3. Initialize Database

```bash
npm run db:sync
```

### 4. Start Backend Server

```bash
npm run dev
```

The backend will be running at `http://localhost:5000`

### 5. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

The frontend will be running at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Policy Management
- `POST /api/policy` - Create new policy
- `GET /api/policy` - Get user policies
- `GET /api/policy/:id` - Get specific policy details
- `PUT /api/policy/:id` - Update policy
- `DELETE /api/policy/:id` - Delete policy

### Calculations
- `POST /api/calculation/calculate` - Calculate illustration (no save)
- `POST /api/calculation/validate` - Validate inputs
- `GET /api/calculation/rules` - Get validation rules
- `POST /api/calculation/bulk` - Bulk calculation processing

## Usage Examples

### 1. User Registration
```javascript
const userData = {
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
  mobile: "9876543210",
  dob: "1990-01-01",
  gender: "M"
};
```

### 2. Policy Calculation (Based on Spreadsheet Example)
```javascript
const policyData = {
  dob: "1999-12-12",        // From spreadsheet
  gender: "M",               // From spreadsheet
  sum_assured: 1200000,      // From spreadsheet
  modal_premium: 80000,      // From spreadsheet
  premium_frequency: "Yearly", // From spreadsheet
  policy_term: 18,           // From spreadsheet
  premium_paying_term: 10    // From spreadsheet
};
```

### 3. Bulk Calculation
```javascript
const bulkData = {
  policies: [
    {
      id: "policy_1",
      sum_assured: 1200000,
      modal_premium: 80000,
      premium_frequency: "Yearly",
      policy_term: 18,
      premium_paying_term: 10,
      calculated_age: 25
    },
    // ... more policies
  ]
};
```

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
The test suite covers:
- ✅ Input validation (all 5 rules)
- ✅ Age calculation logic
- ✅ Benefit calculation algorithm
- ✅ Authentication flows
- ✅ Error handling

## Calculation Logic (From Spreadsheet)

### Annual Premium Calculation
```
Annual Premium = Modal Premium × Frequency Multiplier
- Yearly: × 1
- Half-Yearly: × 2
- Monthly: × 12
```

### Benefit Calculation
```
Guaranteed Addition = 5% of Sum Assured (annually during PPT)
Total Benefit = Sum Assured + Cumulative Guaranteed Additions
Surrender Value = 80% of Cumulative Premiums (after 3 years)
Death Benefit = Max(Sum Assured, Total Benefit)
```

### Age Calculation
Uses "completed birthday" logic:
```javascript
age = currentYear - birthYear
if (birthday not yet occurred this year) age--;
```

## Scalability

The system is designed to handle millions of bulk inputs through:

1. **Queue-based processing** with Redis/Bull
2. **Database optimization** with read replicas and partitioning
3. **Microservices architecture** for independent scaling
4. **Caching strategies** with Redis and in-memory caching
5. **Batch processing** with configurable batch sizes

See `SCALABILITY_ARCHITECTURE.md` for detailed implementation approach.

## Security Considerations

1. **Data Masking**: Sensitive customer information is hashed/encrypted
2. **Environment Variables**: All secrets stored in environment files
3. **JWT Tokens**: Secure authentication with expiration
4. **Input Validation**: Comprehensive validation to prevent injection attacks
5. **CORS Configuration**: Proper cross-origin request handling

## Production Deployment

1. Set up MySQL with proper backup strategy
2. Configure Redis for caching and queuing
3. Use PM2 or Docker for process management
4. Set up load balancer for multiple instances
5. Implement monitoring with Prometheus/Grafana
6. Configure SSL/TLS certificates

## Contributing

1. Follow existing code patterns and naming conventions
2. Add unit tests for new features
3. Update documentation for API changes
4. Ensure security best practices are followed

## License

This project is proprietary software for ValuEnable assignment.
