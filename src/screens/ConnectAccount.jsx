import './index.css';
import moon from '../img/moon.png';
import welcome from '../img/welcome.png';

export function ConnectAccount({connect}){
  return(
    <div className='section connectAcct'>
      <img className="moon" src={moon} alt='moon' />
      <img className="welcome" src={welcome} alt='welcome' />
      <button className='button' onClick={() => connect()}>Connect To MyAlgoConnect Wallet</button>
    </div>
  )
}