# Secure Inventory Management System

A production-ready full-stack Inventory Management System built with Java Spring Boot and vanilla JavaScript.

## Overview

This application provides a secure, RESTful API for managing product inventory with JWT authentication, proper input validation, and a responsive frontend interface.

## Features

### Backend
- **RESTful API Design**: Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **JWT Authentication**: Secure token-based access control
- **Input Validation**: Jakarta Bean Validation on all endpoints
- **SQL Injection Protection**: Using parameterized queries via JPA/Hibernate
- **Custom Exception Handling**: Proper error responses without exposing internal details
- **Database**: MySQL
- **Security Headers**: X-Frame-Options, X-Content-Type-Options

### Frontend
- **Single Page Application**: Vanilla JavaScript SPA
- **User Authentication**: Login/Register with JWT
- **Product Management**: Full CRUD operations
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Toast notifications for user feedback

## Project Structure

```
inventory-management/
├── backend/
│   ├── src/main/java/com/inventory/
 ├── config/          │   │   # Security configuration
│   │   ├── controller/       # REST Controllers
│   │   ├── service/          # Business Logic
│   │   ├── repository/       # Data Access
│   │   ├── model/            # Entity classes
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── exception/        # Custom exceptions
│   │   └── security/         # JWT utilities
│   ├── src/main/resources/
│   │   ├── application.yml   # Application config
│   │   └── data.sql          # Sample data
│   └── pom.xml
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js           # API client
│       ├── auth.js          # Authentication
│       └── app.js            # Main application
├── SPEC.md                   # Technical specification
└── README.md                # This file
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | User login | No |

### Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/products | Get all products (paginated) | Yes |
| GET | /api/products/{id} | Get product by ID | Yes |
| GET | /api/products/sku/{sku} | Get product by SKU | Yes |
| GET | /api/products/search?q= | Search products | Yes |
| POST | /api/products | Create new product | Yes |
| PUT | /api/products/{id} | Update product (full) | Yes |
| PATCH | /api/products/{id} | Update product (partial) | Yes |
| DELETE | /api/products/{id} | Delete product | Yes |

## Response Format

### Success Response
```
json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```
json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Security Measures

1. **JWT Token Authentication**: Stateless authentication with expiration
2. **Password Encryption**: BCrypt hashing
3. **Input Validation**: Bean Validation with custom messages
4. **SQL Injection Prevention**: JPA parameterized queries
5. **CORS Configuration**: Whitelisted origins only
6. **Security Headers**: X-Frame-Options, X-Content-Type-Options
7. **Error Handling**: No stack traces in production responses

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+

## MySQL Setup

1. Install MySQL 8.0 or higher
2. Create a database (or let the app create it automatically):

```
sql
CREATE DATABASE inventory_db;
```

3. Update the database credentials in `application.yml` if needed:

```
yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/inventory_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: root
```

## Building and Running

### Backend Setup

1. Navigate to the backend directory:
```
bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```
bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory
2. Open `index.html` in a web browser

For development, you can use a simple HTTP server:
```
bash
# Python 3
python -m http.server 5500

# Node.js
npx http-server -p 5500
```

Then open `http://localhost:5500` in your browser.

## Usage

1. Open the frontend in your browser
2. Click "Register" to create a new account
3. Login with your credentials
4. Start managing your inventory!

## Configuration

### Backend (application.yml)
```
yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/inventory_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: root
  
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect

app:
  jwt:
    secret: YourSuperSecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLong!
    expiration: 86400000
```

### Environment Variables
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRATION`: Token expiration in milliseconds
- `DB_URL`: Database connection URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

## Testing

Run unit tests:
```
bash
mvn test
```

## Built With

- **Spring Boot 3.2** - Application framework
- **Spring Security** - Security framework
- **Spring Data JPA** - Data access
- **MySQL** - Database
- **JWT** - Token authentication
- **Lombok** - Reduce boilerplate code

## License

This project is for demonstration purposes.
