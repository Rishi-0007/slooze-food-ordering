# API Documentation

The backend provides a GraphQL API accessible at http://localhost:4000/graphql (or configured port).

## Authentication

All operations except `login` and `register` require an Authorization header.

**Header Format:**
```
Authorization: Bearer <access_token>
```

### Login
```graphql
mutation {
  login(loginInput: {
    email: "nick@slooze.com",
    password: "password123"
  }) {
    accessToken
    user {
      id
      name
      role
      country {
        name
      }
    }
  }
}
```

## Core Operations

### Get Restaurants
Returns restaurants. For non-admin users, this list is filtered by their country.
```graphql
query {
  restaurants {
    id
    name
    description
    country {
      name
    }
    menuItems {
      id
      name
      price
    }
  }
}
```

### Create Order (Add to Cart)
Adds an item to the user's cart.
```graphql
mutation {
  addToCart(input: {
    menuItemId: "menu-item-id-here",
    quantity: 2
  }) {
    id
    status
    totalPrice
    items {
      menuItem {
        name
      }
      quantity
    }
  }
}
```

### Checkout
Confirms the order. **Restricted to ADMIN and MANAGER roles.**
```graphql
mutation {
  checkout(input: {
    orderId: "order-id-here",
    paymentMethodId: "payment-method-id-here"
  }) {
    id
    status
  }
}
```

### Cancel Order
Cancels an order. **Restricted to ADMIN and MANAGER roles.**
```graphql
mutation {
  cancelOrder(orderId: "order-id-here") {
    id
    status
  }
}
```

### Create Payment Method
**Restricted to ADMIN role.**
```graphql
mutation {
  createPaymentMethod(input: {
    type: "CREDIT_CARD",
    details: "**** **** **** 1234",
    isDefault: true
  }) {
    id
    type
    details
  }
}
```
