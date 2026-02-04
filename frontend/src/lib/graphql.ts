import { gql } from '@apollo/client';

// Auth
export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      user {
        id
        email
        name
        role
        country {
          id
          name
          code
          currency
        }
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      country {
        id
        name
        code
        currency
      }
    }
  }
`;

// Restaurants
export const RESTAURANTS_QUERY = gql`
  query Restaurants {
    restaurants {
      id
      name
      description
      imageUrl
      countryId
    }
  }
`;

export const RESTAURANT_QUERY = gql`
  query Restaurant($id: ID!) {
    restaurant(id: $id) {
      id
      name
      description
      imageUrl
      countryId
      country {
        currency
      }
    }
    menuItems(restaurantId: $id) {
      id
      name
      description
      price
      imageUrl
      restaurant {
        country {
          currency
        }
      }
    }
  }
`;

// Cart & Orders
export const CART_QUERY = gql`
  query Cart {
    cart {
      id
      status
      totalPrice
      items {
        id
        quantity
        price
        menuItem {
          id
          name
          restaurant {
            country {
              currency
            }
          }
        }
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      totalPrice
      items {
        id
        quantity
        menuItem {
          id
          name
          restaurant {
            country {
              currency
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      id
      totalPrice
      items {
        id
        quantity
        menuItem {
          id
          name
          restaurant {
            country {
              currency
            }
          }
        }
      }
    }
  }
`;

export const CHECKOUT_MUTATION = gql`

  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      id
      status
      totalPrice
    }
  }
`;

export const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($orderId: ID!) {
    placeOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export const ORDERS_QUERY = gql`
  query Orders {
    orders {
      id
      status
      totalPrice
      createdAt
      items {
        id
        quantity
        price
        menuItem {
          id
          name
          restaurant {
            country {
              currency
            }
          }
        }
      }
      user {
        id
        name
        email
      }
    }
  }
`;

// Payment Methods
export const PAYMENT_METHODS_QUERY = gql`
  query PaymentMethods {
    paymentMethods {
      id
      type
      details
      isDefault
    }
  }
`;

export const CREATE_PAYMENT_METHOD_MUTATION = gql`
  mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      id
      type
      details
      isDefault
    }
  }
`;

export const DELETE_PAYMENT_METHOD_MUTATION = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id) {
      id
    }
  }
`;
