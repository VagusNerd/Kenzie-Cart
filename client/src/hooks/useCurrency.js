import React, { createContext, useContext, useReducer, useMemo } from 'react'

const initialState = {
    currencySymbol: '$',
    currencyMultiplier: 1,
  }
  //EURO is €, multiplier = 0.8
  
  export const CurrencyContext = createContext(initialState)
  
  CurrencyContext.displayName = 'Currency'
  
  function currencyReducer(state, action) {
    const nextCurrency = action.payload;
    switch (action.type) {
      case 'SET_CURRENCY': {
        if (nextCurrency === '€'){
          state.currencySymbol = '€';
          state.currencyMultiplier = 0.8;
        }
        if (nextCurrency === '$'){
          state.currencySymbol = '$';
          state.currencyMultiplier = 1;
        }
        return {
          ...state
        }
      }
      default:
        return state
    }
  }

  
  export const CurrencyProvider = (props) => {
    const [state, dispatch] = useReducer(currencyReducer, initialState)
  
    const toggleCurrency = (currency) => dispatch({ type: 'SET_CURRENCY', payload: currency })

    const getPrice = (price) => {
      let newPrice = price;
      if (state.currencySymbol === '$') {
        newPrice = price * state.currencyMultiplier
        return `${state.currencySymbol} ${newPrice}`
      }
      if (state.currencySymbol === '€') {
        newPrice = price * state.currencyMultiplier
        return `${state.currencySymbol} ${newPrice}`
      }
    }
  
    const value = useMemo(
      () => ({
        ...state,
        toggleCurrency: toggleCurrency,
        getPrice,
      }),
      [state]
    )
  
    return <CurrencyContext.Provider value={value} {...props} />
  }
  
  const useCurrency = () => {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
      throw new Error(`useCurrency must be used within a CurrencyProvider`)
    }
    return context
  }
  
  export const ManagedCurrencyContext = ({ children }) => (
    <CurrencyProvider>{children}</CurrencyProvider>
  )
  
  export default useCurrency