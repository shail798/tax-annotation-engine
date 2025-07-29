# Tax Form Annotation System

A comprehensive system for automated tax form filling with field mapping, formatting, and validation.

## Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Zod** - Runtime validation

### Frontend
- **Next.js 14** - React framework with App Router
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Project Structure

```
tax-form-annotation-system/
├── packages/
│   ├── backend/                    # Express.js API server
│   │   ├── src/
│   │   │   ├── index.ts           # Server entry point
│   │   │   ├── routes/            # API routes
│   │   │   ├── services/          # Data mapping & formatting
│   │   │   ├── storage/           # In-memory storage with templates
│   │   │   └── middleware/        # Error handling & validation
│   │   └── package.json
│   └── frontend/                   # Next.js web application
│       ├── src/
│       │   ├── app/               # Next.js App Router pages
│       │   ├── components/        # React components
│       │   └── lib/               # Utilities and API client
│       └── package.json
├── package.json                   # Root workspace configuration
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/shail798/tax-annotation-engine.git
   cd tax-annotation-engine
   npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both backend (port 5000) and frontend (port 3000) concurrently.

3. **Open the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Individual Services

```bash
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend

# Build all
npm run build

# Lint all
npm run lint
```

## Features

- Form Templates (Form 1040 and W-2)
- Data Mapping with configurable paths
- Field Formatting (SSN, currency, text case)
- Comprehensive validation
- Visual form rendering
- RESTful API