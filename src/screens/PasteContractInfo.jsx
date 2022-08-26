import { useState } from 'react'
import './index.css';
import LUNAR from '../img/LUNAR.png';

export function PasteContractInfo({attach}){
  const [ info, setInfo ] = useState('')

  return(
    <div className='section' style={{display: 'flex', flexDirection: 'column'}}>
      <img className="lunar" src={LUNAR} alt='lunar' />
      <h5>Paste Contract Address</h5>
      <textarea className='textarea'
       style={{backgroundColor:'#D9D9D9',}}
        onChange={e => setInfo(e.target.value)}/>
      <button className='button-blog' onClick={() => attach(info)}>Attach To Blog</button>
    </div>
  )
}