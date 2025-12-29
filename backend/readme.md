
# 2. Initialize project
```sh
npm init -y
npm install express cors @prisma/client
npm install -D typescript ts-node @types/express @types/cors prisma
```

# 3. Initialize TypeScript
```sh
npx tsc --init
```

# 4. Initialize Prisma
```sh
npx prisma init
```
# 5. Create .env file
```sh
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/coaching_db"' > .env
```

# 6. Copy schema.prisma (from my previous message)
# 7. Copy src/index.ts (from my previous message)

# 8. Run PostgreSQL (via Docker or local install)
```sh
docker run -d --name coaching-pg -e POSTGRES_PASSWORD=password -p 5432:5432 postgres
```

# 9. Create database & tables
```sh
npx prisma migrate dev --name init
```
# 10. Start backend
```sh
npx ts-node src/index.ts
```
# API runs on http://localhost:3001

# 11. Clone frontend from Lovable GitHub
```sh
cd .. && git clone <your-lovable-repo> frontend
cd frontend && npm install
```
# 12. Set API URL (optional, defaults to localhost:3001)
echo 'VITE_API_URL=http://localhost:3001/api' > .env

# 13. Start frontend
npm run dev
# App runs on http://localhost:5173
