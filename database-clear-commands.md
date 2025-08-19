# MongoDB Database Clear Commands

## 1. Connect to MongoDB using mongosh
mongosh "YOUR_MONGODB_CONNECTION_STRING"

## 2. Switch to your database
use zeitarbeit

## 3. Drop entire database (CAUTION: This deletes everything!)
db.dropDatabase()

## OR 4. Delete all collections individually
db.users.deleteMany({})
db.clients.deleteMany({})
db.employees.deleteMany({})
db.assignments.deleteMany({})

## 5. Verify database is empty
show collections
db.stats()

## Alternative: Drop specific collections
db.users.drop()
db.clients.drop()
db.employees.drop()
db.assignments.drop()
