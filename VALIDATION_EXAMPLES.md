# Email and Password Validation Examples

## Email Validation
The system validates email format using a comprehensive regex pattern that checks for:
- Valid email structure (user@domain.com)
- Proper domain format
- Valid top-level domain

### Valid Email Examples:
- `user@example.com`
- `test.email+tag@domain.co.uk`
- `user123@company.org`

### Invalid Email Examples:
- `invalid-email`
- `@domain.com`
- `user@`
- `user@domain`

## Password Validation
The system enforces strong password requirements:

### Password Requirements:
1. **Minimum 8 characters** (maximum 128)
2. **At least one lowercase letter** (a-z)
3. **At least one uppercase letter** (A-Z)
4. **At least one number** (0-9)
5. **At least one special character** (!@#$%^&*()_+-=[]{}|;':",./<>?)
6. **No spaces allowed**

### Valid Password Examples:
- `Password123!` (8+ chars, all requirements met)
- `MySecure@Pass1` (8+ chars, all requirements met)
- `Strong#Pass99` (8+ chars, all requirements met)
- `Secure123!` (8+ chars, all requirements met)

### Invalid Password Examples:
- `password` (no uppercase, number, or special char)
- `PASSWORD123!` (no lowercase)
- `Password!` (no number)
- `Password123` (no special character)
- `Pass word123!` (contains space)
- `Pass1!` (too short - less than 8 characters)
- `MyPass1!` (too short - less than 8 characters)

## API Testing Examples

### 1. Login Validation
```bash
POST /api/auth/login
Content-Type: application/json

# Valid request
{
  "email": "user@example.com",
  "password": "password123"
}

# Invalid request - will return validation errors
{
  "email": "invalid-email",
  "password": "123"
}
```

### 2. Organization Signup Validation
```bash
POST /api/auth/organization/signup
Content-Type: application/json

# Valid request
{
  "organizationId": "org123",
  "email": "admin@company.com",
  "password": "SecurePass123!"
}

# Invalid request - will return validation errors
{
  "organizationId": "",
  "email": "invalid-email",
  "password": "weak"
}
```

### 3. Store Signup Validation
```bash
POST /api/auth/store/signup
Content-Type: application/json

# Valid request
{
  "storeId": "store456",
  "email": "manager@store.com",
  "password": "StorePass123!"
}
```

### 4. Forgot Password Validation
```bash
POST /api/auth/forgot-password
Content-Type: application/json

# Valid request
{
  "email": "user@example.com"
}

# Invalid request
{
  "email": "invalid-email"
}
```

### 5. Reset Password Validation
```bash
POST /api/auth/reset-password
Content-Type: application/json

# Valid request
{
  "token": "abc123...",
  "password": "NewPass123!",
  "confirmPassword": "NewPass123!"
}

# Invalid request - passwords don't match
{
  "token": "abc123...",
  "password": "NewPass123!",
  "confirmPassword": "DifferentPass123!"
}
```

## Error Response Format
All validation errors return in this format:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number"
  ]
}
```

## Security Features
- **Email Privacy**: Forgot password doesn't reveal if email exists
- **Strong Passwords**: Enforces complex password requirements
- **Input Sanitization**: Validates all input before processing
- **Consistent Error Format**: Standardized error responses
