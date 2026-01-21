# Local Database Setup

## Quick Start

1. **Start the database:**
   ```bash
   npm run db:start
   ```

2. **Setup the schema:**
   ```bash
   npm run db:setup
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

## Available Commands

```bash
# Start database
npm run db:start

# Stop database
npm run db:stop

# Check status
npm run db:status

# Setup schema (start db + push schema + generate client)
npm run db:setup

# Reset everything (stop + remove + setup)
npm run db:reset

# Interactive database manager
npm run db
```

## Interactive Manager

Use the interactive database manager for more control:

```bash
npm run db
```

Then choose from:
- `start` - Start database
- `stop` - Stop database
- `setup` - Setup schema
- `test` - Test connection
- `status` - Show status
- `remove` - Remove container

## Troubleshooting

### Docker not installed
```bash
# Install Docker Desktop
# https://www.docker.com/products/docker-desktop
```

### Port 5432 already in use
```bash
# Stop other PostgreSQL instances
npm run db:stop

# Or use different port (edit scripts)
```

### Database connection fails
```bash
# Test connection
npm run db test

# Reset database
npm run db:reset
```

## Database Details

- **Container Name:** socialflyai-db
- **Database:** socialflyai
- **User:** postgres
- **Password:** postgres
- **Port:** 5432
- **URL:** postgresql://postgres:postgres@localhost:5432/socialflyai

## Data Persistence

⚠️ **Warning:** Database data is stored in Docker container. When you remove the container (`npm run db:reset`), all data is lost.

For persistent data, you can mount a volume:
```bash
docker run --name socialflyai-db -v socialflyai-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=socialflyai -p 5432:5432 -d postgres:15
```