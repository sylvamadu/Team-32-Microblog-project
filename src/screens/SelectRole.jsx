import './index.css'
import LUNAR from '../img/LUNAR.png';
import innerimg from '../img/innerobject.png';
import Blob from '../img/Blob.png';

const styles = {
  'backgroundImage': `url(${Blob})`,
  'backgroundSize':'contain',
  'backgroundRepeat': 'no-repeat',
  'backgroundPosition': 'center center',
}

export function SelectRole({deploy, attach}){
  return(
    <div className='section selectRole'>
      <header>
      <img className="lunar" src={LUNAR} alt='lunar' />
      </header>

      <main>
        <p>
        Lunar is a decentralized microblog app that runs on the Algorand blockchain network.
         A platform on which users can either have a simple blog
         where they post anything of interest, or subscribe to an already existing blog.
        </p>
        <div className='side-img' style={styles}>
          <img className="innerimg" src={innerimg} alt='innerimg' />
        </div>
      </main>
      
      <div className='button-group'>
        <button className='button button-deploy' onClick={() => deploy()}>Create and deploy blog</button>
        <button className='button button-attach' onClick={() => attach()}>Attach to existing blog</button>
      </div>
    </div>
  )
}