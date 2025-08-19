# Dotenvx Environment Encryption - Team Guide

## Overview
The project now uses `dotenvx` for environment variable encryption to secure sensitive credentials like MongoDB URI, NextAuth secrets, etc.

## Files
- `.env` - **ENCRYPTED** environment file (safe to commit)
- `.env.keys` - **PRIVATE KEYS** (NEVER commit, always in .gitignore)

## Development Setup

### First Time Setup
1. Install dotenvx globally:
```bash
npm install -g @dotenvx/dotenvx
```

2. Ask team lead for the `DOTENV_PRIVATE_KEY` value

3. Set the private key as environment variable:
```powershell
# PowerShell
$env:DOTENV_PRIVATE_KEY="c127130663ffdb466003d2937158f55766e2a1853366947c0f24c65ba6d95f5a"
```

```bash
# Bash/Git Bash
export DOTENV_PRIVATE_KEY="c127130663ffdb466003d2937158f55766e2a1853366947c0f24c65ba6d95f5a"
```

### Running the Application
All npm scripts now use dotenvx automatically:

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Database seeding
npm run seed
```

### Alternative Method
If you don't want to set environment variable, create `.env.keys` file:
```
# .env
DOTENV_PRIVATE_KEY=c127130663ffdb466003d2937158f55766e2a1853366947c0f24c65ba6d95f5a
```

**⚠️ WARNING: Never commit .env.keys to version control!**

## For Emergency (Unsafe Mode)
If dotenvx is not working, you can temporarily use:
```bash
npm run dev:unsafe
```

## Adding New Environment Variables

### 1. Create temporary .env.local
```bash
# Add your new variables to .env.local
echo "NEW_VARIABLE=your_value" >> .env.local
```

### 2. Re-encrypt
```bash
# Merge and encrypt
dotenvx encrypt
```

### 3. Clean up
```bash
# Remove temporary file
rm .env.local
```

## Production Deployment
Set `DOTENV_PRIVATE_KEY` as environment variable in your hosting platform:
- Vercel: Environment Variables section
- Heroku: Config Vars
- Docker: --env flag or docker-compose environment

## Troubleshooting

### Error: "failed to decrypt"
- Check if `DOTENV_PRIVATE_KEY` is set correctly
- Verify the private key value is complete (64 characters)

### Error: "dotenvx command not found"
```bash
npm install -g @dotenvx/dotenvx
```

### Variables not loading
- Ensure you're using `npm run dev` (not `npx next dev`)
- Check that .env file exists and is encrypted properly

## Security Notes
- ✅ `.env` (encrypted) - safe to commit
- ❌ `.env.keys` - NEVER commit
- ❌ `DOTENV_PRIVATE_KEY` value - only share securely with team
- ✅ Always use npm scripts that include `dotenvx run --`
