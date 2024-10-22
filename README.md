# Rentify Drive API Documentation

## Base URL
`https://your-api-base-url.com`

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:



## Endpoints

### User Routes

#### Sign Up
- **POST** `/users/signup`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_token_here"
  }
  ```

#### Sign In
- **POST** `/users/signin`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_token_here"
  }
  ```

#### Update User Profile
- **PUT** `/users/profile`
- **Authentication:** Required
- **Body:** form-data
  - `address`: string
  - `mobileNumber`: string
  - `drivingLicensePhoto`: file (image)
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "email": "user@example.com",
      "name": "John Doe",
      "address": "123 Main St",
      "mobileNumber": "1234567890",
      "drivingLicensePhoto": "data:image/jpeg;base64,..."
    }
  }
  ```

### Car Routes

#### Create Car
- **POST** `/cars`
- **Authentication:** Required
- **Body:** form-data
  - `make`: string
  - `model`: string
  - `year`: number
  - `color`: string
  - `licensePlate`: string
  - `seats`: number
  - `fuelType`: string (petrol, diesel, electric, hybrid)
  - `transmission`: string (manual, automatic)
  - `pricePerDay`: number
  - `features`: string (comma-separated)
  - `images`: files (multiple, max 5)
- **Response:**
  ```json
  {
    "success": true,
    "car": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "color": "Blue",
      "licensePlate": "ABC123",
      "seats": 5,
      "fuelType": "petrol",
      "transmission": "automatic",
      "pricePerDay": 50,
      "features": ["GPS", "Bluetooth"],
      "images": ["data:image/jpeg;base64,..."]
    }
  }
  ```

#### Update Car
- **PUT** `/cars/:id`
- **Authentication:** Required
- **Body:** form-data (same fields as Create Car, all optional)
- **Response:** Same as Create Car

#### Get All Cars
- **GET** `/cars`
- **Response:**
  ```json
  {
    "success": true,
    "cars": [
      {
        "make": "Toyota",
        "model": "Camry",
        "year": 2022,
        "color": "Blue",
        "licensePlate": "ABC123",
        "seats": 5,
        "fuelType": "petrol",
        "transmission": "automatic",
        "pricePerDay": 50,
        "features": ["GPS", "Bluetooth"],
        "images": ["data:image/jpeg;base64,..."]
      },
      // ... more cars
    ]
  }
  ```

#### Get Car by ID
- **GET** `/cars/:id`
- **Response:** Same as single car object in Get All Cars

### Car Rental Routes

#### Create Rental
- **POST** `/rentals`
- **Authentication:** Required
- **Body:**
  ```json
  {
    "carId": "car_id_here",
    "startDate": "2023-05-01",
    "endDate": "2023-05-05",
    "totalCost": 200
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "rental": {
      "userId": "user_id_here",
      "carId": "car_id_here",
      "startDate": "2023-05-01T00:00:00.000Z",
      "endDate": "2023-05-05T00:00:00.000Z",
      "totalCost": 200,
      "status": "pending"
    }
  }
  ```

#### Get User Rentals
- **GET** `/rentals/user`
- **Authentication:** Required
- **Response:**
  ```json
  {
    "success": true,
    "rentals": [
      {
        "userId": "user_id_here",
        "carId": "car_id_here",
        "startDate": "2023-05-01T00:00:00.000Z",
        "endDate": "2023-05-05T00:00:00.000Z",
        "totalCost": 200,
        "status": "pending"
      },
      // ... more rentals
    ]
  }
  ```

#### Update Rental Status
- **PUT** `/rentals/:rentalId/status`
- **Authentication:** Required
- **Body:**
  ```json
  {
    "status": "confirmed"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "rental": {
      "userId": "user_id_here",
      "carId": "car_id_here",
      "startDate": "2023-05-01T00:00:00.000Z",
      "endDate": "2023-05-05T00:00:00.000Z",
      "totalCost": 200,
      "status": "confirmed"
    }
  }
  ```

#### Update Payment Status
- **PUT** `/rentals/:rentalId/payment`
- **Authentication:** Required
- **Body:**
  ```json
  {
    "paymentReferenceNumber": "REF123456",
    "paymentStatus": "paid"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "rental": {
      "userId": "user_id_here",
      "carId": "car_id_here",
      "startDate": "2023-05-01T00:00:00.000Z",
      "endDate": "2023-05-05T00:00:00.000Z",
      "totalCost": 200,
      "status": "confirmed",
      "paymentReferenceNumber": "REF123456",
      "paymentStatus": "paid"
    }
  }
  ```

#### Get Pending Rentals with Payment
- **GET** `/rentals/pending-with-payment`
- **Authentication:** Required (Admin only)
- **Response:**
  ```json
  {
    "success": true,
    "rentals": [
      {
        "_id": "rental_id_here",
        "userId": {
          "_id": "user_id_here",
          "name": "John Doe"
        },
        "carId": {
          "_id": "car_id_here",
          "make": "Toyota",
          "model": "Camry"
        },
        "startDate": "2023-05-01T00:00:00.000Z",
        "endDate": "2023-05-05T00:00:00.000Z",
        "totalCost": 200,
        "status": "pending",
        "paymentReferenceNumber": "REF123456"
      },
      // ... more rentals
    ]
  }
  ```

## Error Responses
All endpoints may return the following error response:

```json
{
"success": false,
"message": "Error message here"
}
```

## Notes
- All dates are in ISO 8601 format.
- Image uploads are limited to 5MB per file.
- Car images are limited to 5 per car.
