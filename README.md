# ticket-service
The system allows customers to be able to place support requests, and support agents to process the request.

### Features

1.  Account creation
2.  Update Account
3.  Update User role
4.  Authentication
5.  Ticket creation
6.  Close Ticket
7. Reopen ticket
8. Comment on ticket


# Quick Start Guide
To run the cloned codebase directly, you need to have Node.js and Docker installed if you don't have mongoDB installed locally.

1. Run `npm i` to install dependencies.
2. Run `sudo docker-compose up -d` to get a MongoDB instance running.
3. Make your own `.env` file in the project root, following the key name but not value used in [`.env.example`]..
4. From there, any the following should work:
  - `npm run test`
  - `npm run test-debug`
  - `npm start`
  - `npm run debug`
  
  To make user admin on the first time, go to mongodb console:

```sql
use tickets_db
db.users.updateOne( { email: "admin@test.com" },
    {
        $set: {
            role: 4
        }
    })
```
##### Email will be the already created user email


  