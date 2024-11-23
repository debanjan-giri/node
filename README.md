# CRUD API with Authentication

This project is a Node.js-based CRUD API that includes user authentication using **access tokens** and **refresh tokens**. It integrates MongoDB for data storage, bcrypt for password hashing, Joi for input validation, and JSON Web Tokens (JWT) for secure and scalable authentication.

## Features

- **User Registration & Authentication**: Secure user registration, login, and password hashing.
- **Access & Refresh Tokens**: Implements short-lived access tokens and long-lived refresh tokens for secure and scalable authentication.
- **CRUD Operations**: Allows users to perform CRUD operations on data associated with their account.
- **Pagination**: Efficient data retrieval with pagination support.
- **Validation**: Input validation using Joi to ensure data integrity.

## Tech Stack

- **Node.js & Express**: Server-side framework for building RESTful APIs.
- **MongoDB & Mongoose**: NoSQL database for flexible and scalable data storage.
- **JWT (JSON Web Tokens)**: For secure user authentication and authorization.
- **Bcrypt**: For hashing and securing passwords.
- **Joi**: For robust input validation.


## API Endpoints

| Endpoint            | Method | Description                       | Auth Required |
|---------------------|--------|-----------------------------------|---------------|
| `/auth/register`    | POST   | Register new user and return token| No            |
| `/auth/login`       | POST   | Log in a user and return tokens   | No            |
| `/auth/refresh-token` | POST | Refresh access token              | No            |
| `/crud/create`      | POST   | Create new data entry             | Yes           |
| `/crud/read/all`    | GET    | Read all data                     | Yes           |
| `/crud/read/?page=1&limit=2` | GET  | pagination of data         | Yes           |
| `/crud/delete/:id`  | DELETE | Update data by ID                 | Yes           |
| `/crud/update/:id`  | PUT | Delete data by ID                    | Yes           |
