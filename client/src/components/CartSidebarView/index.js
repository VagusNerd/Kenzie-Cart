import React, { useState } from 'react'
import { Button, InputGroup, FormControl } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faShoppingBag } from '@fortawesome/free-solid-svg-icons'
import { useUI } from 'hooks'
import { useProvideCart, useRouter, useCurrency } from 'hooks'
import { CartList, CartSummary, CheckoutBox } from 'components'
import axios from 'axios'
import './CartSidebarView.scss'

const CartSidebarView = () => {
  const { closeSidebar, displaySidebar } = useUI()
  const { state, applyCoupon } = useProvideCart()
  const { push } = useRouter()
  const { getPrice } = useCurrency()
  const [ couponCode, setCouponCode ] = useState('')
  const [ coupon, setCoupon ] = useState({})

  const handleClose = () => closeSidebar()
  const handleCheckout = () => {
    closeSidebar()
    push({
      pathname: '/checkout',
      state: {coupon: coupon}
    })
  }
  const handleInputChange = (event) => {
    setCouponCode(event.target.value)
  }
  const verifyCoupon = () => {
    axios.get(`/api/coupons/verify?code=${couponCode}`)
      .then((data) => {
        if (couponCode === coupon.couponCode) {
          window.alert("This coupon has already been applied!")
        } 
        else if (couponCode !== coupon.couponCode) {
          setCoupon(data.data)
          applyCoupon(data.data)
          window.alert("Your coupon has been applied to your cart total!")
        }
        else {
          window.alert("Invalid coupon code")
        }
      })
  }

  return (
    <div className='cart'>
      <header className='cart-header'>
        {displaySidebar && (
          <Button
            onClick={handleClose}
            aria-label='Close panel'
            className='hover:text-gray-500 transition ease-in-out duration-150'
          >
            <FontAwesomeIcon size='xs' icon={faTimes} />
          </Button>
        )}
      </header>

      {state.cart.length > 0 ? (
        <div className='cart-body'>
          <CartList cartItems={state.cart} />
        </div>
      ) : (
        <div className='empty-cart'>
          <FontAwesomeIcon size='xs' icon={faShoppingBag} />
          <p>Your shopping cart is empty</p>
        </div>
      )}

      {state.cart.length > 0 && (
        <div className='cart-checkout'>
          <InputGroup>
            <FormControl
              placeholder="Enter Coupon Code Here..."
              aria-label="coupon"
              onChange={handleInputChange}
            />
            <Button 
              onClick={verifyCoupon}
              variant="outline-secondary">
              Enter
            </Button>
          </InputGroup>
          <div>
            <p>Current Discount Applied: {coupon.couponCode || "None"}</p>
            <p>Discount Amount: {Math.floor(coupon.discountAmount*100) || 0 + '%'}</p>
          </div>
          <CartSummary cartTotal={getPrice(state.cartTotal)} />
          <CheckoutBox
            handleShopping={handleClose}
            handleCheckout={handleCheckout}
          />
        </div>
      )}
    </div>
  )
}

export default CartSidebarView
