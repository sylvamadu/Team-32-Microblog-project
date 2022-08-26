import { useState } from 'react'
import './index.css';
import marni from '../img/marni.png';
import LUNAR from '../img/LUNAR.png';

export function SubscriptionPrice({deploy}){
  const [ price, setPrice ] = useState('')

  return(
    <div className='section subscription' style={{display: 'flex', flexDirection: 'column'}}>
      <img className="lunar" src={LUNAR} alt='lunar' />
      <main>
        <img className="marni-img" src={marni} alt='marni' />
        <div className='aside-subscribe'>
            <input className='price_input'
            type={'number'}
            style={{backgroundColor:'#D9D9D9',}}
            onChange={e => setPrice(e.target.value)}/>
            
            <button className='button-price' onClick={() => deploy(parseInt(price))}>Set Subscription Price</button>
        </div>
      </main>
      
    </div>
  )
}