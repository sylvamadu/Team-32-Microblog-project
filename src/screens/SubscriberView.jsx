import { useState } from 'react'
import './index.css';
import LUNAR from '../img/LUNAR.png';
import like from '../img/like.png';
import comment from '../img/comment.png';
import circle from '../img/circle.png';
import sus from '../img/sus.png';
import bg from '../img/bg.png';

export function SubscriberView({subscribed, change, posts, subscribe, unsubscribe}){
  const [ loading, setLoading ] = useState(false)
  const styles = {
    'backgroundImage': `url(${bg})`,
    'backgroundSize': 'cover',
    'height':'100%',
    'width': '100%'
  }
  const onSubscribe = async () => {
    setLoading(true)
    await subscribe()
    setLoading(false)
  }

  const onUnsubscribe = async () => {
    setLoading(true)
    await unsubscribe()
    setLoading(false)
  }

  return(
    <div className='normal__posts' style={styles}>
      <header className="header_post">
        <img className="lunar_posts" src={LUNAR} alt='lunar' />
      </header>
      <h4 className='blog-feed-header'>Blog Feed</h4>

      <div className="button_subscribe">
        {
          subscribed ? 
          <button onClick={onUnsubscribe} className={loading ? 'loading' : ''}>
            { loading ? 'Unsubscribing..' : 'Unsubscribe from premium'}
          </button>
          :
          <button onClick={onSubscribe} className={loading ? 'loading' : ''}>
            { loading ? 'Subscribing..' : 'Subscribe to premium'}
          </button>
        }
        
      </div>

      {
        posts.length === 0 &&
        <div className='premium_blog sub empty'>
          <p>Blog owner hasn't made any posts yet.</p>
        </div>
      }

      {
        posts.length > 0 &&
        <div className="premium_blog sub">
          {
            posts.map((item, index)=>(
              <div className='card-wrapper' key={index}>
              <div className="premium_card" >
                <img src={sus} alt="profile icon" className='img-icon' />
                <div className="card_inner">
                  <p className='name_post'>sus</p>
                  <p className='post_content'>
                    {item}
                  </p>
                  <div className='social_icons'>
                    <img src={like} alt="icons" />
                    <img src={comment} alt="icons" />
                    <img src={circle} alt="icons" />
                  </div>
                </div>
              </div>
              </div>
            ))
          }
        </div>
      }
      <small style={{color: "transparent", position: 'fixed'}}>{change}</small>
    </div>
  )
}