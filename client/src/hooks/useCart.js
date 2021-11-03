import React, { useEffect, useReducer, useContext, createContext } from 'react'

const initialState = {
  cart: [],
  itemCount: 0,
  cartTotal: 0,
}

const calculateCartTotal = (cartItems) => {
  let total = 0

  cartItems.map((item) => (total += item.price * item.quantity))

  return parseFloat(total.toFixed(2))
}

const reducer = (state, action) => {
  let nextCart = [...state.cart];
  let storageCart;
  switch (action.type) {
    case 'ADD_ITEM':
      const existingIndex = nextCart.findIndex(
        (item) => item._id === action.payload._id
      )

      const numItemsToAdd = action.payload.quantity;

      if (existingIndex >= 0) {
        const newQuantity = parseInt(
          nextCart[existingIndex].quantity + numItemsToAdd
        )

        nextCart[existingIndex] = {
          ...action.payload,
          quantity: newQuantity,
        }
      } else {
        nextCart.push(action.payload)
      }

      storageCart = {
        ...state,
        cart: nextCart,
        itemCount: action.payload.quantity ? state.itemCount + action.payload.quantity : state.itemCount + 1,
        cartTotal: calculateCartTotal(nextCart)
      }

      localStorage.setItem('KenzieCart', JSON.stringify(storageCart))

      return storageCart

    case 'REMOVE_ITEM':
      nextCart = nextCart
        .map((item) =>
          item._id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

        storageCart = {
          ...state,
          cart: nextCart,
          itemCount: state.itemCount > 0 ? state.itemCount - 1 : 0,
          cartTotal: calculateCartTotal(nextCart),
        }

      localStorage.setItem('KenzieCart', JSON.stringify(storageCart))

      return storageCart
      
    case 'REMOVE_ALL_ITEMS':
      let quantity = state.cart.find((i) => i._id === action.payload).quantity

      storageCart = {
        ...state,
        cart: state.cart.filter((item) => item._id !== action.payload),
        itemCount: state.itemCount > 0 ? state.itemCount - quantity : 0,
      }

      localStorage.setItem('KenzieCart', JSON.stringify(storageCart))

      return storageCart
      
    case 'RESET_CART':
      localStorage.setItem('KenzieCart', JSON.stringify(initialState))

      return { ...initialState }
    case 'INIT_SAVED_CART':      
      
      console.log(action.payload)
      return {
        ...action.payload,
      }
    case 'APPLY_COUPON':
      return { 
        ...state,
        cartTotal: calculateCartTotal(state.cart) * (1 - action.payload.discountAmount),
        coupon: action.payload
      }
    default:
      return state
  }
}

const cartContext = createContext()

// Provider component that wraps your app and makes cart object ...
// ... available to any child component that calls useCart().
export function ProvideCart({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <cartContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </cartContext.Provider>
  )
}

// Hook for child components to get the cart object ...
// ... and re-render when it changes.
export const useCart = () => {
  return useContext(cartContext)
}

// Provider hook that creates cart object and handles state
const useProvideCart = () => {
  const { state, dispatch } = useCart()

  const addItem = (item) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: item,
    })
  }

  const removeItem = (id) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: id,
    })
  }

  const removeAllItems = (id) => {
    dispatch({
      type: 'REMOVE_ALL_ITEMS',
      payload: id,
    })
  }

  const resetCart = () => {
    dispatch({
      type: 'RESET_CART',
    })
  }

  const applyCoupon = (coupon) => {
    dispatch ({ 
      type: 'APPLY_COUPON',
      payload: coupon,
    })
  }

  const isItemInCart = (id) => {
    return !!state.cart.find((item) => item._id === id)
  }

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('KenzieCart')) || false
    if (savedCart) {
      dispatch({
        type: 'INIT_SAVED_CART',
        payload: savedCart,
      })
    }
  }, [dispatch])

  return {
    state,
    addItem,
    removeItem,
    removeAllItems,
    resetCart,
    isItemInCart,
    calculateCartTotal,
    applyCoupon,
  }
}

export default useProvideCart
