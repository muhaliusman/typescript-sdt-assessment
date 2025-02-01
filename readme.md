# Typescript Assessment

This is a technical test project created as part of the application process for a Software engineer position. This project is built with typescript and has the following simple features:

1. Create User
2. Update User
3. Delete User
4. Cronjob every hour
5. Queue to send emails according to timezone

## Prerequisite

1. Node.js version 20 and above.
2. MySQL
3. Redis

## Installation

Clone or download this project

```bash
git clone https://github.com/muhaliusman/typescript-sdt-assessment
```

Enter to the project directory

```bash
cd typescript-sdt-assessment
```

Install dependency

```bash
npm install
```

copy .env.example and rename it to .env for development

```bash
cp .env.example .env
```

create a database and change environment variables and adjust them to your own

```bash
# sample
APP_PORT=3000

DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=db_name
DB_PORT=3306

REDIS_HOST=localhost
REDIS_PORT=6379

EMAIL_ENDPOINT=https://fake-endpoint/send-email
```

run migration to set initial tables

```bash
npm run migration:run:dev
```

Run the application

```bash
npm run dev #for hot reload
or
npm run start
```

## API Documentation

after running the application you can check the API documentation via [http://localhost:3000](http://localhost:3000)
there are only 3 endpoint

1. **POST: /api/users** : to create new user
2. **PUT: /api/users/{id}** : to update user
3. **Delete: /api/users/{id}** : to delete user

## User Schema

```bash
{
   firstName!: string
   lastName!: string
   location!: string # Iana timezone,
   birthday!: date # YYYY-MM-DD
   email!: string
}
```

location us IANA timezone name for example Asia/Jakarta please refer to this [wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Cron & Queue

in this project i use cron that runs every hour and fetches data from database based on user location. then the data will be sent to queue to handle sending email (fake) to users.
Flow:

1. cron runs every hour and fetches user data in whose area it is 9 am
2. Cron will send the data to bullmq.
3. The worker will take the queue and send it to the user's email
4. If the delivery fails, the queue will be retried 3 times using the exponential backoff method
5. If after the retry it still fails, the data will be kept in the database and will be tried to be sent again the next day
6. This process will repeat for 3 days, and if it still fails, it will be sent next year

For more details, please see this diagram:

![Flow 1](https://i.imgur.com/0LjAMhe.png) ![Flw 2](https://i.imgur.com/BUwmD3z.png)

**NOTE** : it is necessary to run the worker so that the queue can be consumed.

```bash
npm run worker:dev # in development env
npm run worket # in production
```

## Test

There are 2 tests in this project.

1. Unit test

```bash
npm t
```

2. End to End Testing
   For this test you need to setup database and also redis. You can change it in .env.test after that just run

```bash
npm run test:e2e
```
