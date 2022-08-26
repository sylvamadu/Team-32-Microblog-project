import logo from '../logo.svg'
import './index.css'
import '../screens/index.css'
import LUNAR from '../img/LUNAR.png'

export function Loader(){
  return(
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <img className="lunar" src={LUNAR} alt='lunar' />
      <img src={logo} className='loader' alt='loader'/>
    </div>)
}