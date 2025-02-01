import React from 'react'
import './Breadcrums.css'
import arrow_icon from '../Assets/Frontend_Assets/arrow.png'


const Breadcrums = ({ product }) => {
    //const {product} = props;
    if (!product) {
        return <div className="breadcrums">HOME <img src={arrow_icon} alt="arrow_icon" /> SHOP</div>;
      }
  return (
    <div className='breadcrums'>
        HOME <img src={arrow_icon} alt="arrow_icon" /> SHOP <img src={arrow_icon} alt="arrow_icon" /> {product.category} <img src={arrow_icon} alt="arrow_icon" /> {product.name}
    </div>
  )
}

export default Breadcrums