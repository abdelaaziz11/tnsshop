import React from 'react'
import logo from '../Assets/Frontend_Assets/logo.png'
import './Navbar.css'
import cart from '../Assets/Frontend_Assets/cart_icon.png'
import { Link } from 'react-router-dom'

const Navbar = () => {

  

  return (
    <div className='Navbar'>
      <div className='Nav'>
        <div className="logo">
          <img src={logo} alt="logo" />
          <p>TNS Shop</p>
        </div>
        <div className="nav-items">
          <ul className='center-items'>
            <li><a href="/store">Store</a></li>
            <li><a href="/male">Male</a></li>
            <li><a href="/women">Female</a></li>
          </ul>
          <ul className='right-items'>
            <li>
              <a href="/login"><button className="btn login-btn">Login</button></a>
            </li>
            <li>
              <img src={cart} alt="cart" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar