# 🚀 Creation of AI Driven Multi-Agent Negotiation Training & Simulation Platform

A sophisticated multi-agent negotiation simulation platform where AI agents negotiate with each other based on configurable scenarios.

---

## 📋 Table of Contents
- [Team Overview](#team-overview)
- [Project Structure](#project-structure)
- [Quick Start for All Members](#quick-start-for-all-members)
- [Member-Specific Instructions](#member-specific-instructions)
  - [Member 1 – Frontend UI & Dashboard](#member-1--frontend-ui--dashboard)
  - [Member 2 – Backend & Authentication](#member-2--backend--authentication)
  - [Member 3 – Database & Scenario Management](#member-3--database--scenario-management)
  - [Member 4 – AI Agents](#member-4--ai-agents)
  - [Member 5 – Orchestrator & Negotiation Engine](#member-5--orchestrator--negotiation-engine)
  - [Member 6 – Reports, Analytics, Testing & Deployment](#member-6--reports-analytics-testing--deployment)
- [Development Workflow](#development-workflow)
- [Git Branch Strategy](#git-branch-strategy)
- [API Contract Guidelines](#api-contract-guidelines)
- [Database Guidelines](#database-guidelines)
- [Docker Setup](#docker-setup)
- [Testing Guidelines](#testing-guidelines)
- [Troubleshooting](#troubleshooting)

---

## 👥 Team Overview

| Member | Role | Primary Folder | Dependencies |
|--------|------|----------------|--------------|
| **Member 1** | Frontend UI & Dashboard | `/frontend/` | API Contract (Member 2 & 5) |
| **Member 2** | Backend & Authentication | `/backend/src/routes/auth.py` | Database (Member 3) |
| **Member 3** | Database & Scenario Management | `/database/` & `/backend/src/models/` | None (Foundation) |
| **Member 4** | AI Agents | `/backend/src/agents/` | Database (Member 3), Orchestrator (Member 5) |
| **Member 5** | Orchestrator & Negotiation Engine | `/backend/src/routes/orchestrator.py` | Database (Member 3), AI Agents (Member 4) |
| **Member 6** | Reports, Analytics, Testing & Deployment | `/tests/` & `/docker/` | All Components |

---

## 📁 Project Structure
multi-agent-negotiation-simulator/
│
├── backend/ # Backend codebase
│ ├── src/
│ │ ├── init.py
│ │ ├── app.py # Main FastAPI/Flask application
│ │ ├── routes/ # API Routes
│ │ │ ├── init.py
│ │ │ ├── auth.py # 👤 Member 2
│ │ │ ├── scenarios.py # 📊 Member 3
│ │ │ ├── orchestrator.py # 🎯 Member 5
│ │ │ └── reports.py # 📈 Member 6
│ │ ├── models/ # Database Models
│ │ │ ├── init.py
│ │ │ ├── user.py # 👤 Member 2
│ │ │ ├── scenario.py # 📊 Member 3
│ │ │ ├── negotiation.py # 🎯 Member 5
│ │ │ └── log.py # 📈 Member 6
│ │ ├── services/ # Business Logic
│ │ │ ├── init.py
│ │ │ └── db_service.py # 📊 Member 3 (Database helper)
│ │ ├── agents/ # AI Agents
│ │ │ ├── init.py
│ │ │ ├── base_agent.py # 🤖 Member 4
│ │ │ ├── competitive_agent.py # 🤖 Member 4
│ │ │ ├── collaborative_agent.py# 🤖 Member 4
│ │ │ └── agent_factory.py # 🤖 Member 4
│ │ └── utils/ # Utilities
│ │ ├── init.py
│ │ ├── validators.py # 📊 Member 3
│ │ └── helpers.py # Shared
│ ├── requirements.txt # Python dependencies
│ └── Dockerfile
│
├── frontend/ # Frontend codebase
│ ├── src/
│ │ ├── components/ # React/Vue components
│ │ │ ├── Dashboard/ # 📊 Member 1
│ │ │ ├── NegotiationView/ # 🎯 Member 1
│ │ │ ├── ScenarioBuilder/ # 📊 Member 1
│ │ │ └── Reports/ # 📈 Member 1
│ │ ├── pages/ # Page components
│ │ ├── services/ # API calls
│ │ │ └── api.js # 🌐 Member 1 (Uses API contract)
│ │ ├── store/ # State management
│ │ └── styles/ # CSS/SCSS
│ ├── public/
│ ├── package.json
│ └── Dockerfile
│
├── database/ # 📊 Member 3's Domain
│ ├── schema.sql # Master database schema
│ ├── init_db.py # Database helper class
│ ├── migrations/ # Schema migrations
│ │ ├── 001_initial.sql
│ │ └── 002_add_agent_types.sql
│ └── seeds/ # Test data
│ ├── scenarios.sql
│ └── test_users.sql
│
├── contracts/ # API Contracts (ALL MEMBERS)
│ └── api_contract.json # Single source of truth
│
├── tests/ # 📈 Member 6's Domain
│ ├── init.py
│ ├── unit/ # Unit tests
│ │ ├── test_models.py
│ │ ├── test_agents.py # 🤖 Member 4
│ │ └── test_orchestrator.py # 🎯 Member 5
│ └── integration/ # Integration tests
│ ├── test_api.py
│ └── test_negotiation_flow.py
│
├── docker/ # 📈 Member 6's Domain
│ ├── backend.Dockerfile
│ ├── frontend.Dockerfile
│ └── nginx.conf
│
├── docs/ # Documentation
│ ├── architecture.md
│ └── api_usage.md
│
├── scripts/ # Utility scripts
│ ├── setup.sh
│ └── seed_database.py # 📊 Member 3
│
├── docker-compose.yml # 📈 Member 6
├── .env.example # Environment variables
├── .gitignore
└── README.md # This file

text

---

## 🚀 Quick Start for All Members

### Step 1: Clone the Repository
Clone the repository from GitHub to your local machine using the repository URL provided by Member 3.

### Step 2: Set Up Environment
Copy the `.env.example` file to create your own `.env` file. Edit the `.env` file with your local configuration settings including database credentials, API keys, and port numbers.

### Step 3: Create Your Feature Branch
Always start from the `develop` branch. Create your own feature branch with a descriptive name that includes your name and the task you're working on. Never work directly on the `develop` or `main` branches.

### Step 4: Install Dependencies
Based on your role, install the necessary dependencies:
- **Backend Members (2, 3, 4, 5, 6)**: Create a Python virtual environment and install all required Python packages from the requirements file.
- **Frontend Member (1)**: Install all Node.js dependencies using the package manager.

### Step 5: Start Development Server
- **Backend Members**: Run the main application file to start the backend server. It will run on the configured port (default: 8000).
- **Frontend Member**: Start the frontend development server. It will run on the configured port (default: 3000).

---

## 👤 Member-Specific Instructions

### Member 1 – Frontend UI & Dashboard

**Your Folder:** `/frontend/`

**Your Responsibilities:**
- Build the complete user interface for the application
- Create scenario creation and management screens
- Design negotiation visualization interface
- Implement dashboard with analytics charts
- Consume all backend APIs defined in the contract
- Implement real-time updates using WebSockets or polling
- Ensure responsive and user-friendly design

**Your Dependencies:**
- Backend APIs from Members 2, 3, 5, and 6
- API Contract located at `/contracts/api_contract.json`

**Your Development Workflow:**

1. **Start the frontend server** using the appropriate command for your framework.

2. **Create the API service layer** that will handle all communication with the backend. Use mock data initially until the backend is ready. The service should include functions for authentication, scenario management, negotiation control, and report fetching.

3. **Build components in phases:**
   - **Phase 1**: Login and Registration pages (integrates with Member 2)
   - **Phase 2**: Scenario Builder interface (integrates with Member 3)
   - **Phase 3**: Negotiation View with real-time updates (integrates with Member 5)
   - **Phase 4**: Dashboard with analytics (integrates with Member 6)

4. **Use mock data** until each backend service is ready. Create mock JSON files that match the API contract structure.

5. **Test your work** using the frontend testing framework. Build the production version to ensure everything works.

**Your Deliverables:**
- Working UI with all pages and components
- Complete integration with all backend APIs
- Responsive design that works on different screen sizes
- Proper error handling and loading states

**When to Merge:**
- Merge Login/Register after Member 2's authentication is ready
- Merge Scenario Builder after Member 3's scenario APIs are ready
- Merge Negotiation View after Member 5's orchestrator is ready
- Merge Dashboard after Member 6's reports are ready

---

### Member 2 – Backend & Authentication

**Your Folder:** `/backend/src/routes/auth.py` & `/backend/src/models/user.py`

**Your Responsibilities:**
- Implement user registration functionality
- Create login system with JWT authentication
- Handle password hashing and validation
- Manage user profile operations
- Create middleware for protecting routes
- Generate and validate JWT tokens

**Your Dependencies:**
- Database Service from Member 3 (`database/init_db.py`)
- User model from Member 3's database schema

**Your Development Workflow:**

1. **Set up the backend environment** with Python virtual environment and install dependencies.

2. **Implement authentication routes** following the API contract. Create endpoints for user registration, login, and profile management. Use proper password hashing and JWT token generation.

3. **Add authentication middleware** that other members can use to protect their routes. This middleware should validate JWT tokens and extract user information.

4. **Test your endpoints** using curl commands or API testing tools. Ensure proper error handling for invalid credentials, duplicate users, and missing fields.

**Your Deliverables:**
- Working registration endpoint
- Working login endpoint with JWT token
- Authentication middleware for protected routes
- Proper error handling and validation
- Token generation and validation logic

**When to Merge:**
- Merge first! Member 1 needs authentication to build login pages
- Members 4, 5, and 6 need authentication middleware to protect their routes

---

### Member 3 – Database & Scenario Management

**Your Folder:** `/database/` & `/backend/src/models/scenario.py`

**Your Responsibilities:**
- Design and maintain the complete database schema
- Implement CRUD operations for scenarios
- Provide database helper functions for all members
- Create seed data for testing
- Manage database migrations
- Ensure database performance with proper indexing

**Your Dependencies:**
- None! You are the foundation that everyone else builds upon.

**Your Development Workflow:**

1. **Initialize the database** using Docker or local PostgreSQL. Run the schema file to create all tables.

2. **Enhance the DatabaseService class** with functions needed by other members. Add functions for user management (for Member 2), scenario operations (for your work), negotiation tracking (for Member 5), and analytics (for Member 6).

3. **Create scenario models** that define the structure of scenario data including configuration parameters, agent types, and negotiation settings.

4. **Create seeding scripts** to populate the database with test data for development and testing.

5. **Write migration scripts** for any schema changes that occur during development.

**Your Deliverables:**
- Complete database schema with all tables
- Fully functional DatabaseService class
- All CRUD operations for scenarios
- Migration scripts for version control
- Seed data for testing

**When to Merge:**
- Merge first! Everyone depends on your schema and database functions.

---

### Member 4 – AI Agents

**Your Folder:** `/backend/src/agents/`

**Your Responsibilities:**
- Implement different AI agent types
- Create agent decision-making logic
- Develop offer generation strategies
- Implement offer evaluation methods
- Create agent factory pattern for dynamic creation
- Document agent APIs for Member 5

**Your Dependencies:**
- Scenario configuration from Member 3
- Will be used by Member 5 (Orchestrator)

**Your Development Workflow:**

1. **Create base agent class** with abstract methods that all agents must implement. This includes offer generation and offer evaluation.

2. **Implement specific agent types:**
   - **Competitive Agent**: Aggressive strategy with lowball offers
   - **Collaborative Agent**: Fair strategy seeking win-win solutions
   - **Neutral Agent**: Balanced strategy
   - **Additional agents** as needed for the project

3. **Create agent factory** that can instantiate any agent type dynamically based on configuration.

4. **Test each agent** individually using unit tests to ensure correct behavior.

5. **Document your agent APIs** clearly so Member 5 knows how to use them.

**Your Deliverables:**
- 3+ agent types with distinct strategies
- Agent factory for dynamic creation
- Well-documented agent APIs
- Unit tests for each agent
- Example usage for Member 5

**When to Merge:**
- Merge after Member 3's schema is ready
- Merge before Member 5 needs to integrate agents

---

### Member 5 – Orchestrator & Negotiation Engine

**Your Folder:** `/backend/src/routes/orchestrator.py` & `/backend/src/models/negotiation.py`

**Your Responsibilities:**
- Implement negotiation orchestration logic
- Coordinate multiple AI agents
- Manage negotiation rounds and state
- Handle turn-based execution
- Save complete negotiation history
- Provide real-time status updates

**Your Dependencies:**
- Database Service from Member 3
- AI Agents from Member 4
- Authentication middleware from Member 2

**Your Development Workflow:**

1. **Create negotiation model** that defines the structure of a negotiation session including status, rounds, agents involved, and results.

2. **Implement orchestrator endpoints** following the API contract. Create the start negotiation endpoint that initializes agents and begins the negotiation process.

3. **Develop the core negotiation loop** that handles turn-based execution. Each round, all agents take turns making offers and evaluating responses.

4. **Implement termination conditions** to determine when a negotiation should end (agreement reached, max rounds, etc.).

5. **Save all negotiation history** to the database using Member 3's functions.

6. **Provide status endpoints** for real-time updates that Member 1 can use for the UI.

**Your Deliverables:**
- Working negotiation start endpoint
- Complete negotiation loop logic
- Integration with all agent types
- Real-time status updates
- Complete negotiation history
- Proper error handling

**When to Merge:**
- Merge after Member 4's agents are ready
- Merge after Member 3's scenario functions are ready

---

### Member 6 – Reports, Analytics, Testing & Deployment

**Your Folder:** `/tests/` & `/docker/` & `/backend/src/routes/reports.py`

**Your Responsibilities:**
- Generate comprehensive negotiation reports
- Create analytics dashboards
- Build complete test suite (unit + integration)
- Set up Docker deployment
- Configure CI/CD pipeline
- Monitor application performance
- Ensure proper logging and monitoring

**Your Dependencies:**
- All components (you are the integrator)

**Your Development Workflow:**

1. **Implement reports endpoints** that generate comprehensive negotiation summaries, agent performance metrics, and visual analytics.

2. **Create global analytics** that aggregate data across all negotiations for the dashboard.

3. **Build comprehensive tests:**
   - Unit tests for all individual components
   - Integration tests for API flows
   - End-to-end tests for complete user journeys

4. **Set up Docker deployment** with multi-container setup including database, backend, and frontend services.

5. **Configure CI/CD pipeline** that automatically runs tests and deploys on successful merges.

6. **Set up monitoring and logging** for production deployment.

**Your Deliverables:**
- Working reports and analytics endpoints
- Complete test suite with >80% coverage
- Docker configuration for all services
- CI/CD pipeline configuration
- Deployment documentation
- Monitoring and logging setup

**When to Merge:**
- Merge last! You need everything working to test properly.

---

## 🌿 Development Workflow

### Daily Workflow for All Members

1. **Start your day** by pulling the latest changes from the `develop` branch.

2. **Create a feature branch** for your specific task. Use descriptive names that include your name and what you're working on.

3. **Make small, frequent commits** with clear messages. This makes it easier to track changes and resolve conflicts.

4. **Push your branch regularly** to GitHub so others can see your progress.

5. **Create a Pull Request** when your feature is ready. Request reviews from at least two team members.

6. **Address review feedback** and update your PR until approved.

7. **Only Member 6** can merge to `develop` or `main` after all tests pass.

### Commit Message Convention

Use these prefixes for your commit messages:
- **feat:** For new features
- **fix:** For bug fixes
- **docs:** For documentation changes
- **test:** For adding or modifying tests
- **refactor:** For code refactoring
- **style:** For code style changes
- **perf:** For performance improvements

Examples:
- "feat: Add collaborative agent strategy"
- "fix: Resolve JWT token expiration issue"
- "docs: Update API documentation for reports endpoint"

---

## 🌿 Git Branch Strategy

### Branch Structure
- **`main`** - Production-ready code. Only Member 6 can merge here after thorough testing.
- **`develop`** - Integration branch for all features. All feature branches merge here.
- **`feature/*`** - Individual feature branches created from `develop`. Example: `feature/member3-scenarios`

### Rules for Working with Branches
- **NEVER** work directly on `main` or `develop`
- **ALWAYS** create a feature branch for your work
- **ALWAYS** create a Pull Request for merging
- **ALWAYS** get at least 2 approvals before merging
- **ONLY** Member 6 can merge to `main`
- **DELETE** feature branches after successful merge

### Handling Merge Conflicts
If you encounter merge conflicts:
1. Pull the latest `develop` branch
2. Rebase your feature branch on `develop`
3. Resolve any conflicts locally
4. Continue the rebase
5. Force push your updated branch
6. Update your Pull Request

---

## 📝 API Contract Guidelines

**⚠️ CRITICAL: All members MUST follow the API contract**

The API contract is defined in `/contracts/api_contract.json`. This is the single source of truth for all API endpoints.

### Rules for All Members
- ✅ **DO** follow the contract exactly as specified
- ❌ **DO NOT** change the contract without team approval
- 📢 **MUST** discuss any changes in the team meeting
- 🔄 **MUST** update the contract if you change an endpoint

### For Backend Members (2, 3, 4, 5, 6)
- Implement endpoints exactly as defined in the contract
- Use the exact request and response formats specified
- Validate all inputs against the contract
- Return errors in the format specified

### For Frontend Member (1)
- Use the contract to build all API calls
- Create mock data based on the contract responses
- Test against the contract before integration
- Handle all response formats as specified

---

## 🗄️ Database Guidelines

**Owned by Member 3** - All schema changes must go through Member 3.

### Tables Overview
1. **users** - User accounts (Managed by Member 2)
2. **scenarios** - Negotiation scenarios (Managed by Member 3)
3. **negotiations** - Negotiation sessions (Managed by Member 5)
4. **negotiation_logs** - Detailed logs (Managed by Member 6)

### How to Use the Database

**For All Members:**
- Use the DatabaseService class from `database/init_db.py`
- Use the provided helper functions instead of writing raw SQL
- Do not modify the database schema without consulting Member 3
- Always use parameterized queries to prevent SQL injection

**Adding New Functions:**
1. Discuss the need with Member 3
2. Member 3 will design and implement the function
3. Member 3 will notify all members about the new function
4. All members can then use the new function

---

## 🐳 Docker Setup

**Owned by Member 6** - Use Docker for consistent development environment.

### Basic Docker Commands
- **Start all services**: Use the Docker Compose up command
- **Start in background**: Use the detached mode
- **Stop all services**: Use the Docker Compose down command
- **Rebuild after changes**: Use the build flag

### Service Access Points
- **Frontend**: Access at http://localhost:3000
- **Backend API**: Access at http://localhost:8000
- **API Documentation**: Access at http://localhost:8000/docs
- **Database**: Access at localhost:5432

---

## 🧪 Testing Guidelines

**Owned by Member 6** - All tests must pass before merging.

### Test Commands
- **Run all tests**: Use the pytest command
- **Run unit tests only**: Target the unit test directory
- **Run integration tests only**: Target the integration test directory
- **Run with coverage**: Use the coverage flag

### Test Requirements
- ✅ All unit tests must pass
- ✅ All integration tests must pass
- ✅ Code coverage should be above 80%
- ✅ All new features must include tests
- ✅ No merging without passing tests

---

## 🆘 Troubleshooting

### Common Issues and Solutions

**1. Database Connection Error**
- Check if PostgreSQL is running using Docker commands or local status checks
- Reset the database by removing volumes and restarting

**2. Port Already in Use**
- Find what process is using the port
- Change the port number in the `.env` file
- Restart the service with the new port

**3. Authentication Error (JWT)**
- Regenerate a new secret key
- Update the secret key in the `.env` file
- Restart the backend service

**4. Merge Conflicts**
- Pull the latest `develop` branch
- Rebase your feature branch on `develop`
- Resolve all conflicts locally
- Continue the rebase process
- Force push your updated branch

---

## 📚 Additional Resources

- **API Documentation**: Available at http://localhost:8000/docs when the server is running
- **Architecture Document**: Located at `/docs/architecture.md`
- **API Contract**: Located at `/contracts/api_contract.json`
- **Database Schema**: Located at `/database/schema.sql`

---

## 🤝 Communication

### Team Meetings
- **Daily Standup**: 10:00 AM - Quick updates on progress
- **Merge Review**: 3:00 PM - Review and merge Pull Requests
- **Sprint Planning**: Every Monday - Plan the week's work

### Communication Channels
- **Slack/Discord**: #negotiation-simulator channel for daily communication
- **GitHub**: For code reviews, issues, and Pull Requests
- **Email**: For urgent or formal communication

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🎯 Quick Reference

| Task | Description |
|------|-------------|
| `Create feature branch` | `git checkout -b feature/your-name-task` |
| `Commit changes` | `git add . && git commit -m "feat: message"` |
| `Push to GitHub` | `git push origin feature/your-name-task` |
| `Start all services` | `docker-compose up` |
| `Run all tests` | `pytest tests/` |
| `Start backend` | `cd backend && python src/app.py` |
| `Start frontend` | `cd frontend && npm start` |

---