# SGM - Sistema de Gestão Metrológica

## Overview
SGM (Sistema de Gestão Metrológica) is a specialized metrology management system designed for the petroleum and natural gas industry. The application manages equipment calibration, certification tracking, well testing, chemical analysis, and regulatory compliance. It replaces manual Excel-based processes with an automated, centralized system that ensures complete traceability and compliance with ISO 17025, ISO 10012, and ANP/Inmetro standards.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful APIs with structured error handling
- **Middleware**: Custom logging and JSON parsing middleware
- **Development**: Hot reload with Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema versioning
- **Connection Pooling**: Neon serverless connection pooling

### Database Schema Design
The system uses a hierarchical organizational structure:
- **Polos** (Production hubs) → **Instalações** (Facilities) → **Equipamentos** (Equipment)
- Equipment tracking with calibration schedules and history
- Well management (cadastro_pocos) with BTP testing
- Orifice plate management with dimensional tracking
- Chemical analysis collection plans and execution

### Authentication and Authorization
- User authentication with role-based access control
- Session management for secure access
- User roles (admin, user) with appropriate permissions

### Key Business Logic Components
- **Equipment Management**: Complete lifecycle tracking with calibration schedules
- **Calibration Control**: Automated alerts based on certification expiry dates
- **Well Testing (BTP)**: Periodic testing scheduling and result tracking
- **Chemical Analysis**: Sample collection planning and laboratory coordination
- **Compliance Reporting**: Regulatory reports for audits and inspections

### Development Patterns
- **Shared Schema**: Common TypeScript types between frontend and backend
- **API Layer**: Centralized API client with consistent error handling
- **Component Composition**: Reusable UI components with proper separation of concerns
- **Form Validation**: Zod schema validation shared between client and server
- **Query Management**: Optimistic updates and cache invalidation strategies

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Performant form handling with validation

### UI Framework
- **@radix-ui**: Accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variant management
- **lucide-react**: Consistent icon library

### Development Tools
- **vite**: Fast development server and build tool
- **typescript**: Type safety across the entire stack
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management
- **WebSocket**: Real-time database connections via ws library

### Form and Validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod
- **drizzle-zod**: Automatic Zod schema generation from Drizzle schemas

The application is designed as a full-stack TypeScript solution with a focus on type safety, performance, and regulatory compliance for metrology management in the oil and gas industry.