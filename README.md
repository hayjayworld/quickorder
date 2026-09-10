# QuickOrder — Multi-Tenant Restaurant QR Ordering SaaS

Turn every table into an ordering point. Let customers scan, browse, and order from their phones while restaurant teams manage everything from one powerful dashboard.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/quickorder.git
cd quickorder

# Install dependencies
npm install

# Copy environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Update .env files with your credentials

# Set up the database
npm run prisma:migrate
npm run prisma:generate

# Seed the database
npm run seed

# Start development servers
npm run dev