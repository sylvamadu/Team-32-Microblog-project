import { useState } from 'react'
import './index.css';
import LUNAR from '../img/LUNAR.png';
import like from '../img/like.png';
import comment from '../img/comment.png';
import circle from '../img/circle.png';
import sus from '../img/sus.png';
import { CreatePost } from './CreatePost';

export function CreatorView({ change, posts, createPost, notifications, withdraw, info}){
  const [ open, setOpen ] = useState(false)
  const [ loading, setLoading ] = useState({
    upload: false,
    withdraw: false
  })

  const onPost = async (post, premium) => {
    setOpen(false)
    setLoading(loading => ({
      ...loading,
      upload: true
    }))
    await createPost(post, premium)
    setLoading(loading => ({
      ...loading,
      upload: false
    }))
  }

  const onWithdraw = async () => {
    setLoading(loading => ({
      ...loading,
      withdraw: true
    }))
    await withdraw()
    setLoading(loading => ({
      ...loading,
      withdraw: false
    }))
  }

  const parseNotification = (item) => {
    let final = ''
    switch (item.type) {
      case 'subscribed':
        final = `${item.address} just subscribed to your blog`
        break;
      case 'unsubscribed':
        final = `${item.address} just unsubscribed from your blog`
        break;
      case 'withdrew':
        final = 'You successfully withdrew your earnings so far'
        break;
      case 'post_failed':
      case 'withdrawal_failed':
        final = item.address
        break;
      default:
        break;
    }
    return final
  }


  return(
    <div className='pasteInfo' style={{display: 'flex', flexDirection: 'column'}}>
      {
        open && 
        <CreatePost 
          onClose={() => setOpen(false)}
          onPost={onPost}
        />
      }
      <header className='main_header'>
        <img className="lunar_main" src={LUNAR} alt='lunar' />
      </header>
      <div className="premium_content">
        <div className='left-main'>
          <div className='actions'>
            <button
              className={loading.upload ? 'loading' : ''}
              disabled={loading.upload}
              onClick={() => setOpen(true)}>
                {
                  loading.upload ? 'Uploading Post...' : 'Create post'
                }
            </button>
            <button
              disabled={loading.withdraw}
              onClick={onWithdraw}
              className={loading.withdraw ? 'loading' : ''}
              >
                {
                  loading.withdraw ? 'Withdrawing...' : 'Withdraw Funds'
                }
            
            </button>
          </div>

          {
            posts.length === 0 &&
            <div className='premium_blog empty'>
              <p>You haven't made any posts to your blog yet.</p>
            </div>
          }

          {
            posts.length > 0 &&
            <div className="premium_blog">
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
          

        </div>
        <div className='right_info'>
          <div className="inner_notification">
            <h3 className='notification'>
              Notifications
            </h3>
            {
              notifications.length === 0 ?
              <small style={{fontSize: '15px', fontFamily: 'monospace'}}>No notifications yet</small>
              :
              notifications.map((item, index)=> (
                <div className="card-notify" key={index}>
                  <p>{parseNotification(item)}</p>
                  <hr />
                </div>
              ))
            }
          </div>
          <div className="contract-address">
            <h3>Contract Address</h3>
            <p>
              {info}
            </p>
          </div>
        </div>

      </div>
      <small style={{color: "transparent", position: 'fixed'}}>{change}</small>
      
    </div>
  )
}