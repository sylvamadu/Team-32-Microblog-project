import './App.css';
import { loadStdlib } from '@reach-sh/stdlib';
import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';
import * as backend from './reach/build/index.main.mjs'
import { useState } from 'react';
import { views, Loader } from './utils/';
import bg from './img/bg.png';
import { ConnectAccount,
   PasteContractInfo,
    SelectRole,
    TestView,
    WaitForAttacher,
    SubscriptionPrice,
    CreatorView,
    SubscriberView
} from './screens';


const reach = loadStdlib('ALGO');
reach.setWalletFallback(reach.walletFallback( { providerEnv: 'TestNet', MyAlgoConnect } ));

function App() {
  const [ account, setAccount ] = useState({})
  const [ view, setView ] = useState(views.CONNECT_ACCOUNT)
  const [ contractInfo, setContractInfo ] = useState(`{"type": "BigNumber":"0x0blah"}`)
  const [ subscribed, setSubscribed ] = useState(false)
  const [ contract, setContract ] = useState()
  const [ change, setChange ] = useState(0)
  const [ post, setPost ] = useState([
    // "Test post kilishi",
  ])
  const [ notifications, setNotifications ] = useState([
    // { type: 'subscribed', address: 'Oxoblahblahblah'},
    // { type: 'unsubscribed', address: 'Oxdodblahblahbalhba'},
    // { type: 'withdrew', address: ''},
    // { type: 'post_failed', address: 'Post failed'},
    // { type: 'withdrawal_failed', address: 'Withdrawal failed'}
  ])

  const reachFunctions = {
    connect: async (secret, mnemonic = false) => {
      let result = ""
      try {
        const account = mnemonic ? await reach.newAccountFromMnemonic(secret) : await reach.getDefaultAccount();
        setAccount(account);
        setView(views.DEPLOY_OR_ATTACH);
        result = 'success';
      } catch (error) {
        result = 'failed';
      }
      return result;
    },

    setAsDeployer: (deployer = true) => {
      if(deployer){
        setView(views.SET_TOKEN_INFO);
      }
      else{
        setView(views.PASTE_CONTRACT_INFO);
      }
    },

    deploy: async (price) => {
      const contract = account.contract(backend);
      setContract(contract)
      backend.Creator(contract, {
        ...Creator,
        subscriptionPrice: price
      });
      setView(views.DEPLOYING);
      const ctcInfo = JSON.stringify(await contract.getInfo(), null, 2)
      setContractInfo(ctcInfo);
      setView(views.CREATOR_VIEW)
    },

    attach: (contractInfo) => {
      const contract = account.contract(backend, JSON.parse(contractInfo));
      setContract(contract)
      backend.Subscriber(contract, Subscriber)
      setView(views.SUBSCRIBER_VIEW)
    },

    createPost: async (post, premium = false) => {
      if(post.length>1000){
        setNotifications(n => {
          const copy = [ ...n ]
          copy.push({type: 'post_failed', address: 'Post failed. Text was too long'})
          return copy
        })
        setChange(Math.random())
        return false
      }
      else {
        try {
          await contract.apis.CreatorActions.post({ post, premium })
          setPost(p => {
            const copy = [...p]
            copy.push(post)
            return copy
          })
          setChange(Math.random())

          return true
        } catch (error) {
          console.log(error)
          setNotifications(n => {
            const copy = [ ...n ]
            copy.push({type: 'post_failed', address: 'Post failed. Try again'})
            return copy
          })
          setChange(Math.random())
          return false
        }
      }
    },

    withdraw: async () => {
      try {
        await contract.apis.CreatorActions.withdraw()
        setNotifications(n => {
          const copy = [ ...n ]
          copy.push({type: 'withdrew', address: ''})
          return copy
        })
        setChange(Math.random())
        return true
      } catch (error) {
        console.log(error)
        setNotifications(n => {
          const copy = [ ...n ]
          copy.push({type: 'withdrawal_failed', address: 'Withdrawal failed.'})
          return copy
        })
        setChange(Math.random())
        return false
      }
    },

    subscribe: async () => {
      try {
        await contract.apis.SubscriberActions.subscribe()
        setSubscribed(true)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },

    unsubscribe: async () => {
      try {
        await contract.apis.SubscriberActions.unsubscribe()
        setSubscribed(false)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    }
  }


  const Creator = {
    ready: () => {
      console.log('ready')
      setView(views.CREATOR_VIEW)
    },

    viewNewPremiumSubscriber: (address, subbed) => {
      setNotifications(n => {
        const copy = [...n]
        copy.push({
          type: subbed === true ? 'subscribed':'unsubscribed',
          address
        })
        return copy
      })
      setChange(Math.random())
    },

    checkBalance: () => {}
  }

  const Subscriber = {
    viewPost: (post) => {
      setPost(p => {
        const copy = [...p]
        copy.push(post)
        return copy
      })
      setChange(Math.random())
    }
  }
  
  const styles ={
    'backgroundImage': `url(${bg})`,
    'backgroundSize': 'cover',
    'height':'100vh',
    'width': '100%'
  }

  return (
    <div className="App">
      <header className="App-header" style={styles}>
        {
          view === views.CONNECT_ACCOUNT && 
          <ConnectAccount connect={reachFunctions.connect}/>
        }

        {
          view === views.DEPLOY_OR_ATTACH &&
          <SelectRole deploy={() => setView(views.SUBSCRIBING)} attach={() => setView(views.PASTE_CONTRACT_INFO)}/>
        }

        {
          view === views.SUBSCRIBING &&
          <SubscriptionPrice deploy={reachFunctions.deploy}/>
        }

        {
          view === views.SUBSCRIBER_VIEW &&
          <SubscriberView 
            subscribed={subscribed} 
            change={change} 
            posts={post} 
            subscribe={reachFunctions.subscribe} 
            unsubscribe={reachFunctions.unsubscribe}
          />
        }

        {
          view === views.CREATOR_VIEW &&
          <CreatorView 
            change={change}  
            posts={post} 
            withdraw={reachFunctions.withdraw}
            createPost={reachFunctions.createPost} 
            notifications={notifications} 
            info={contractInfo}
          />
        }

        {
          (view === views.DEPLOYING || view === views.ATTACHING) &&
          <Loader />
        }

        {
          view === views.PASTE_CONTRACT_INFO &&
          <PasteContractInfo attach={reachFunctions.attach}/>
        }

        {
          view === views.WAIT_FOR_ATTACHER &&
          <WaitForAttacher info={contractInfo}/>
        }

        {
          view === views.TEST_VIEW &&
          <TestView />
        }
      </header>
    </div>
  );
}

export default App;
