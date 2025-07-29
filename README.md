# Tax Form Annotation System - Phase 1

A comprehensive system for automated tax form filling with field mapping, formatting, and validation.

## 🏗️ Architecture

```
Frontend (Next.js + shadcn/ui) ←→ Backend (Express.js + TypeScript) ←→ In-Memory Storage
```

## 🚀 Features

### ✅ Phase 1 (Current)
- **Form Templates**: Hardcoded Form 1040 and W-2 templates with field annotations
- **Data Mapping**: Automatic mapping of taxpayer data to form fields using configurable paths
- **Field Formatting**: Smart formatting for SSN, currency, text case, and more
- **Validation**: Comprehensive validation with detailed error reporting
- **Form Rendering**: Visual form display with positioned fields
- **RESTful API**: Complete API for template management and form filling
- **Modern UI**: Clean interface built with Next.js and shadcn/ui components

### 🔄 Future Phases
- Calculated fields (auto-sum, formulas)
- PDF generation service
- Database persistence
- Admin interface for template creation
- Batch form processing

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Zod** - Runtime validation
- **In-Memory Storage** - Hardcoded templates and data

### Frontend
- **Next.js 14** - React framework with App Router
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Sonner** - Toast notifications

## 📁 Project Structure

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
│       │   │   ├── ui/           # shadcn/ui components
│       │   │   └── FormRenderer.tsx  # Core form display component
│       │   └── lib/
│       │       ├── api.ts         # API client & types
│       │       └── utils.ts       # Utilities
│       └── package.json
├── package.json                   # Root workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation & Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd tax-form-annotation-system
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

## 📊 API Documentation

### Core Endpoints

#### GET /api/forms/templates
Get all available form templates
```json
{
  "success": true,
  "data": {
    "templates": [...],
    "total": 2
  }
}
```

#### GET /api/forms/templates/:templateId
Get specific template with all field annotations
```json
{
  "success": true,
  "data": {
    "template_id": "tmpl_1040_2024_v1",
    "form_name": "Form 1040 - Individual Income Tax Return",
    "annotations": [...]
  }
}
```

#### POST /api/forms/fill
Fill form with taxpayer data
```json
{
  "template_id": "tmpl_1040_2024_v1",
  "taxpayer_data": {
    "taxpayer": {
      "firstName": "John",
      "lastName": "Doe",
      "ssn": "123456789",
      "address": {...}
    },
    "income": {...}
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "filled_form_id": "filled_abc123",
    "fields": [...],
    "validation_status": "valid",
    "validation_errors": []
  }
}
```

## 🎯 Data Mapping System

### Field Annotations
Each form field is defined with:
- **Position**: Exact coordinates and dimensions
- **Data Path**: Nested object path (e.g., `taxpayer.address.street`)
- **Field Type**: text, currency, ssn, date, etc.
- **Format Rules**: Uppercase, currency formatting, patterns
- **Validation**: Required, patterns, length constraints

### Example Field Definition
```typescript
{
  field_id: "taxpayer_ssn",
  position: { x: 445, y: 140, width: 100, height: 12, page: 1 },
  data_path: "taxpayer.ssn",
  field_type: "ssn",
  format_rules: {
    pattern: "###-##-####",
    mask: true
  },
  validation_rules: {
    required: true,
    pattern: "^\\d{9}$"
  }
}
```

## 🎨 Form Rendering

The `FormRenderer` component provides:
- **Accurate Positioning**: Fields displayed at exact PDF coordinates
- **Multi-page Support**: Handles complex forms with multiple pages

- **Responsive Scaling**: Adjustable form size
- **Smart Formatting**: Color-coded formatted vs. raw values

## ✅ Validation System

Comprehensive validation includes:
- **Required Fields**: Ensures critical data is present
- **Pattern Matching**: SSN, ZIP code, state code validation
- **Length Constraints**: Prevents field overflow
- **Type Validation**: Numeric ranges, text formatting
- **Real-time Feedback**: Immediate error reporting

## 🧪 Testing the System

### Sample Data
The application comes with pre-filled sample data:
- Primary taxpayer: John Doe (SSN: 123456789)
- Spouse: Jane Doe (SSN: 987654321)  
- Address: 123 Main Street, New York, NY 10001
- Income: $75,000 wages, $1,200 interest, $800 dividends

### Form Templates
Two hardcoded templates are available:
1. **Form 1040** - Individual Income Tax Return (13 fields)
2. **Form W-2** - Wage and Tax Statement (4 fields)

### Usage Flow
1. Select a form template
2. Modify taxpayer information
3. Click "Fill Form" 
4. View the rendered form with positioned fields


## 🔧 Development

### Adding New Templates
Templates are defined in `packages/backend/src/storage/inMemoryStorage.ts`:

```typescript
const newTemplate: FormTemplate = {
  template_id: 'tmpl_newform_2024_v1',
  form_type: 'NEW-FORM',
  form_name: 'New Tax Form',
  // ... field annotations
};
```

### Extending Field Types
Add new field types in:
- Backend: `packages/backend/src/services/dataMapping.ts`
- Frontend: `packages/frontend/src/lib/api.ts`

## 📈 Performance

- **Frontend**: Fast React rendering with optimized positioning
- **Backend**: In-memory operations for instant response
- **Scalability**: Ready for database integration in Phase 2

## 🔐 Security

- **Input Validation**: Zod schemas for all API inputs
- **Error Handling**: Comprehensive error catching and logging  
- **Type Safety**: Full TypeScript coverage

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check if ports 3000/5000 are in use
lsof -i :3000
lsof -i :5000
```

**Build errors:**
```bash
# Clean install
rm -rf node_modules packages/*/node_modules
npm install
```

**API connection issues:**
- Ensure backend is running on port 5000
- Check Next.js proxy configuration in `next.config.mjs`

## 🗺️ Roadmap

### Phase 2 (Database & PDF)
- [ ] PostgreSQL integration
- [ ] PDF generation service  
- [ ] Template versioning
- [ ] User authentication

### Phase 3 (Advanced Features)
- [ ] Calculated fields and formulas
- [ ] Conditional field visibility
- [ ] Template inheritance
- [ ] Batch processing

### Phase 4 (Production)
- [ ] Admin interface
- [ ] Multi-tenant support
- [ ] Advanced validation rules
- [ ] Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Next.js, Express.js, and modern web technologies.** 