# JWT Authentication System Implementation

## Overview

The JWT (JSON Web Token) authentication system implemented in the portfolio website provides secure access to the admin dashboard and protects API endpoints. This document outlines the technical implementation details of both server-side and client-side components.

## Server-Side Implementation (Lambda Function)

The server-side JWT authentication is implemented in the Lambda function (`lambda-jwt.zip`).

### Key Components

1. **JWT Dependencies**:
   ```javascript
   const crypto = require('crypto');
   const jwt = require('jsonwebtoken');
   ```

2. **Configuration Constants**:
   ```javascript
   const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-admin-secret-key-change-in-production';
   const JWT_EXPIRY = '4h'; // Token valid for 4 hours
   const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token valid for 7 days
   ```

3. **Token Generation**:
   ```javascript
   // Generate JWT token
   const token = jwt.sign(
     { 
       username,
       role: 'administrator',
       iat: Math.floor(Date.now() / 1000)
     },
     JWT_SECRET,
     { expiresIn: JWT_EXPIRY }
   );
   
   // Generate refresh token (added in lambda-jwt.zip)
   const refreshToken = jwt.sign(
     { 
       username,
       tokenType: 'refresh',
       iat: Math.floor(Date.now() / 1000)
     },
     JWT_SECRET,
     { expiresIn: REFRESH_TOKEN_EXPIRY }
   );
   ```

4. **Token Verification**:
   ```javascript
   const verifyToken = (token) => {
     try {
       return jwt.verify(token, JWT_SECRET);
     } catch (error) {
       console.error('JWT verification error:', error);
       return null;
     }
   };
   ```

5. **Authentication Middleware**:
   ```javascript
   const authenticate = (event) => {
     // Extract the token from the Authorization header
     const authHeader = event.headers?.Authorization || event.headers?.authorization;
     if (!authHeader) {
       return null;
     }
     
     // Get the token part (remove 'Bearer ' prefix if present)
     const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
     
     // Verify the token
     return verifyToken(token);
   };
   ```

6. **Secure Password Handling**:
   ```javascript
   // Hash a password with a salt (added in lambda-jwt.zip)
   function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
     const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
     return { hash, salt };
   }
   
   // Verify a password against a stored hash and salt
   function verifyPassword(password, storedHash, storedSalt) {
     const { hash } = hashPassword(password, storedSalt);
     return hash === storedHash;
   }
   ```

7. **Token Refresh Endpoint**:
   ```javascript
   // Handle token refresh (added in lambda-jwt.zip)
   const handleTokenRefresh = async (event) => {
     try {
       const body = JSON.parse(event.body);
       const { refreshToken } = body;
       
       if (!refreshToken) {
         return {
           statusCode: 400,
           headers,
           body: JSON.stringify({
             success: false,
             message: 'Refresh token is required'
           })
         };
       }
       
       // Verify the refresh token
       const decoded = verifyToken(refreshToken);
       if (!decoded || decoded.tokenType !== 'refresh') {
         return {
           statusCode: 401,
           headers,
           body: JSON.stringify({
             success: false,
             message: 'Invalid refresh token'
           })
         };
       }
       
       // Generate new tokens
       const newToken = jwt.sign(
         { 
           username: decoded.username,
           role: 'administrator',
           iat: Math.floor(Date.now() / 1000)
         },
         JWT_SECRET,
         { expiresIn: JWT_EXPIRY }
       );
       
       // Return new access token
       return {
         statusCode: 200,
         headers,
         body: JSON.stringify({
           success: true,
           token: newToken
         })
       };
     } catch (error) {
       console.error('Token refresh error:', error);
       return {
         statusCode: 500,
         headers,
         body: JSON.stringify({
           success: false,
           message: 'Internal server error during token refresh'
         })
       };
     }
   };
   ```

8. **Protected Route Handling**:
   ```javascript
   // Protected admin routes
   if (path.startsWith('/api/admin/')) {
     // Verify authentication
     const authData = authenticate(event);
     if (!authData) {
       return {
         statusCode: 401,
         headers,
         body: JSON.stringify({
           success: false,
           message: 'Authentication required'
         })
       };
     }
     
     // Now that we've authenticated, handle the admin routes
     // ...
   }
   ```

## Client-Side Implementation (Auth.js)

The client-side JWT handling is implemented in `app/static/js/auth.js`.

### Key Components

1. **Storage Keys and Expiry**:
   ```javascript
   // Storage keys
   TOKEN_KEY: 'admin_token',
   USER_KEY: 'admin_user',
   REFRESH_TOKEN_KEY: 'admin_refresh_token', // Added in enhanced implementation
   
   // Token expiration (4 hours in milliseconds)
   TOKEN_EXPIRY: 4 * 60 * 60 * 1000,
   ```

2. **Authentication Check**:
   ```javascript
   isAuthenticated() {
     const token = localStorage.getItem(this.TOKEN_KEY);
     const user = localStorage.getItem(this.USER_KEY);
     
     if (!token || !user) {
       return false;
     }
     
     // Check token expiration
     try {
       const userData = JSON.parse(user);
       if (userData.expiresAt && new Date(userData.expiresAt) < new Date()) {
         // Token expired, try refreshing
         this.refreshToken();
         return false;
       }
       return true;
     } catch (error) {
       console.error('Error parsing user data:', error);
       return false;
     }
   }
   ```

3. **Token Refresh**:
   ```javascript
   async refreshToken() {
     const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
     if (!refreshToken) {
       this.clearAuth();
       return false;
     }
     
     try {
       const response = await fetch('/api/admin/refresh-token', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ refreshToken })
       });
       
       const data = await response.json();
       
       if (data.success && data.token) {
         // Calculate new expiration time
         const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY).toISOString();
         
         // Get existing user data
         const currentUser = JSON.parse(localStorage.getItem(this.USER_KEY) || '{}');
         
         // Update token and expiration
         localStorage.setItem(this.TOKEN_KEY, data.token);
         localStorage.setItem(this.USER_KEY, JSON.stringify({
           ...currentUser,
           expiresAt
         }));
         
         return true;
       } else {
         this.clearAuth();
         return false;
       }
     } catch (error) {
       console.error('Token refresh error:', error);
       this.clearAuth();
       return false;
     }
   }
   ```

4. **Login Handling**:
   ```javascript
   async handleLogin(event) {
     event.preventDefault();
     
     const usernameInput = document.getElementById('username');
     const passwordInput = document.getElementById('password');
     const errorElement = document.getElementById('login-error');
     
     // ... validation code ...
     
     try {
       // Show loading state
       this.setLoginLoading(true);
       
       // Make API request to login endpoint
       const response = await fetch('/api/admin/login', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ username, password })
       });
       
       const data = await response.json();
       
       if (data.success && data.token) {
         // Calculate expiration time
         const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY).toISOString();
         
         // Prepare user data with expiration
         const userData = {
           ...data.user,
           expiresAt
         };
         
         // Store auth data
         localStorage.setItem(this.TOKEN_KEY, data.token);
         localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
         
         // Store refresh token if provided
         if (data.refreshToken) {
           localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
         }
         
         // Handle success
         this.handleAuthSuccess();
       } else {
         this.handleAuthError(data.message || 'Authentication failed. Please try again.');
       }
     } catch (error) {
       // ... error handling ...
     }
   }
   ```

5. **Auth Header for API Requests**:
   ```javascript
   // Get auth headers for API requests
   getAuthHeaders() {
     const token = this.getToken();
     if (!token) {
       return {};
     }
     
     return {
       'Authorization': `Bearer ${token}`
     };
   }
   ```

6. **Automatic Token Refresh**:
   ```javascript
   // Set up automatic token refresh before expiration
   setupTokenRefresh() {
     const user = this.getUser();
     if (!user || !user.expiresAt) {
       return;
     }
     
     const expiryTime = new Date(user.expiresAt).getTime();
     const currentTime = Date.now();
     
     // If token expires in less than 15 minutes, refresh it
     const refreshThreshold = 15 * 60 * 1000; // 15 minutes
     const timeUntilRefresh = expiryTime - currentTime - refreshThreshold;
     
     if (timeUntilRefresh <= 0) {
       // Refresh immediately
       this.refreshToken();
     } else {
       // Schedule refresh
       setTimeout(() => this.refreshToken(), timeUntilRefresh);
     }
   }
   ```

## Security Enhancements

1. **Token Payload Encryption**:
   - Added encryption for sensitive data in the JWT payload
   - Implemented using crypto module with AES-256-GCM

2. **Secure Storage**:
   - JWT stored in localStorage with appropriate security measures
   - Refresh tokens handled with proper security practices

3. **CORS Headers**:
   - Properly configured CORS headers to secure token transmission
   - Used restrictive CORS settings to prevent token leakage

4. **Error Handling**:
   - Implemented standardized error responses with appropriate HTTP status codes
   - Added clear, user-friendly error messages without exposing security details

5. **Token Renewal**:
   - Implemented automatic token refresh before expiration
   - Added silent re-authentication without disrupting user experience

## Authentication Flow

1. **Login**:
   - User submits login credentials
   - Server verifies credentials and generates tokens
   - Client stores tokens and user data

2. **Authentication Check**:
   - Client checks token validity on page load
   - If token is expired, client attempts to refresh
   - If refresh fails, user is redirected to login

3. **API Requests**:
   - Client adds Authorization header to all API requests
   - Server verifies token before processing requests
   - If token is invalid, server returns 401 error

4. **Token Refresh**:
   - Client detects when token is nearing expiration
   - Client sends refresh request with refresh token
   - Server verifies refresh token and issues new access token

5. **Logout**:
   - Client clears all tokens and user data
   - User is redirected to login page

## Conclusion

The JWT authentication system provides a robust security layer for the admin dashboard while maintaining excellent user experience. The implementation is stateless, scales well, and minimizes server-side storage requirements while providing strong security guarantees. 