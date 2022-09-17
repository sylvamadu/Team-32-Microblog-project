# REACH MICROBLOG

In this workshop, we'll design a microblog application. The application would allow users to either create and deploy a personal blog where they can make posts, or attach to an already existing blog and view posts made by its deployer. The blockchain would serve as a database, storing all the posts published by the deployer.

The blog deployer can choose to tag some of their posts as premium, which can only be viewed by premium subscribers who have paid a subscription price.

---
We'll assume that you'll go through this workshop in a directory named `~/reach/workshop-microblog`


```
$ mkdir -p ~/reach/workshop-microblog && cd ~/reach/workshop-microblog
```

And that you have a copy of Reach [installed](https://docs.reach.sh/tool/#ref-install) in `~/reach` so you can write


```
$ ../reach version
```
And it will run Reach. You should start off by initializing your Reach program:

```
$ ../reach init
```

## Problem Analysis
The first step in a reach program design is an analysis of the participants involved in the program. We'll need to answer the following questions:

* Who is involved in this application?
* What information do they know at the start of the program?
* What information are they going to discover and use in the program?
* What funds change ownership during the application and how?

You should write your answers in your Reach program (index.rsh) using a comment.

`/* Remember comments are written like this */`

#### Write down the problem analysis of this program as a comment.

Let's see how your answers compare to our answers:

* This program involves two kinds of entities: the deployer who deploys a blog and publishes posts to it, and the attachers who attach to the existing blog and view its posts. We'll calll the first 'Creator' and the second 'Subscriber'. There can only be one Creator in a deployed blog, but there can be any number of Subscribers.
* The Creator starts off knowing the amount they want to set as price for subscribing to their premium content.
* The Subscriber starts off without any prior information asides their quest for entertainment.
* The Creator gets an update everytime a Subscriber subscribes to his premium content, and also when a Subscriber unsubscribes.
* The Subscriber optionally gets information about posts made by the Creator. When the Creator makes a post and tags it as premium, only Subscribers who have paid the premium subscription price can see it. However, all posts not tagged as premium can be seen by all Subscribers.
* The Subscriber transfers the subscription price to the contract when they subscribe to premium, and the Creator gets those funds whenever he chooses.

It's okay if your answers are different. There are many ways to kill a bird. Problem analysis isn't set in stone.

---

## Data Definition
Now we know what information our program will deal with, next thing we have to do is decide how to translate that information into concrete data. 

First things first, we'll need to define our participants within the context of Reach by answering the following questions.

* What entity type will the Creator be?
* What entity type will the Subscriber be?


> Refer to [this](https://docs.reach.sh/model/#term_participant%20instances) for a reminder of the entity t
ypes available in Reach.

When doing this step, an important thing to consider is if the entity is meant to be one account or multiple accounts. If the entity can strictly only be one account, then it is a [Participant](https://docs.reach.sh/rsh/appinit/#rsh_Participant). If it can be multiple accounts, then either the [ParticipantClass](https://docs.reach.sh/rsh/appinit/#rsh_ParticipantClass) or the [API](https://docs.reach.sh/rsh/appinit/#rsh_API) can be used. The ParticipantClass is getting deprecated by Reach, but it's very convenient to use in certain scenarios. 

The major disadvantage of using the ParticipantClass is seen in cases where its members have to publish to the contract. This leads to a weird async race which you do not want in your program. However, in cases where all its members do is have data passed to their interact interfaces without publishing to the contract, the ParticipantClass is a perfect fit.

The API is convenient in cases where its members perform actions on the contract like pay into it or publish data to it. However, you wouldn't be able to keep track of the program flow as the API members only interact with the contract by calling functions on it. The contract cannot perform any action on the API member until the API member calls a function. 

In a program where multiple entities have to view data but also perform actions on the smart contract, usage of both the ParticipantClass and the API at once makes the program flow smoothly; you get the best of both worlds. This is possible because one account can connect as both a ParticipantClass member and an API member at the same time. 

> This isn't the only way to get around the limitation of the API class. You can use an API alongside a [View](https://docs.reach.sh/rsh/appinit/#rsh_View)

> The API class can also be used alongside the Participant.


Next we'll need to define the data types for the information that would be shared across the program, by answering these questions:

* What data type will represent the subscription price set by the Creator?
* What data type will represent a post made by the Creator?
* What data type will represent a subscription or unsubscription notification as seen by the Creator?

> Refer to [Types](https://docs.reach.sh/rsh/compute/#ref-programs-types) for a reminder of what data types are available in Reach.

After deciding those things, you should think about how the program will be provided these values. In other words:


* What participant interact interface will the participants use?
* What API function would be used if any?

You should look back at your problem analysis to do this step. Whenever a participant starts off knowing something, then it is a field in the [interact](https://docs.reach.sh/rsh/local/#rsh_interact) object. If they learn something, then it will be an argument to a function. If they provide something later, then it will be the result of the function. This also applies to API functions.

You should write your answers in your Reach file (`index.rsh`) as the participant interact interface for each of the participants


### Write down the data definitions for this program as definitions.

Let's compare notes again.

* The Creator will be a Participant and an API.
* The Subscriber will be a ParticipantClass and an API
* We will represent the subscription price set by the Creator as an unsigned integer (`UInt`) named `subscriptionPrice`.
* We will represent a post made by the Creator as an object with keys `post` and `premium`. `post` will be a string (`Bytes(1000)`) and premium will be a boolean (`Bool`). The object would be named `post` defined as (`Object({post: Bytes(1000), premium: Bool})`).
* We will represent a subscription/unsubscription notification as the tuple `[Address, Bool]` where `Address` is the wallet address of the subscriber/unsubscriber and `Bool` is true when its a subscription but false when its an unsubscription.

> Don't be alarmed that the Creator was also made an API member. This was done because there are certain actions he can perform on the program that are essentially optional, actions he can perform at his convenience, or not at all. One of such actions is the `withdraw` action where he has the contract's accumulated funds transferred to his account. Another is the `post` action where he makes a post. (A blog can be empty, not a crime :grin:)

We wrote this in our program as: 

```
const Creator = Participant('Creator', {
    subscriptionPrice: UInt,
    viewNewPremiumSubscriber: Fun([Address, Bool], Null),
  });

  const Subscriber = ParticipantClass('Subscriber', {
    viewPost: Fun([Bytes(1000)], Null)
  });

  const SubscriberActions = API('SubscriberActions', {
    subscribe: Fun([], Bool),
    unsubscribe: Fun([], Bool)
  });

  const CreatorActions = API('CreatorActions', {
    withdraw: Fun([], Bool),
    post: Fun([Object({post: Bytes(1000), premium: Bool})], Bool)
  });

  init();
```

At this point, you can modify your Javsascript file (`index.mjs`) to contain definitions of these values.


## Program Flow
Now that we've defined the data that would be shared across the program and how it would be shared, now we design the flow of the program. It is good practice to represent the flow of a program first in the form of [pseudocode](https://www.freecodecamp.org/news/what-is-pseudocode-in-programming/) before translating it to reach code. This makes the work easier, and can help you process the complex logic of a program without having to deal with the limitations of a programming language's syntax.

Now write out the various steps of what our program should do.

* The creator publishes the price for subscribing to his blog as a premium member
* A means of storing the addresses of the premium members gets defined. A set, map or array can be used. A map is the best option for dealing with addresses.
* We define a loop that encapsulates all the actions that can be performed by the Creator or Subscriber. Since these actions are all API functions, we use a [parallelReduce](https://docs.reach.sh/rsh/consensus/#parallelreduce). The loop would be set to run nonstop.

> The parallelReduce is a mixture of a [while loop](https://docs.reach.sh/rsh/consensus/#rsh_while) and a [fork statement](https://docs.reach.sh/rsh/step/#rsh_fork). Only one branch of a fork statement gets executed everytime the program gets to the fork. The branch gets executed on a first-come-first-serve basis.

* We define the branches of the parallelReduce. Each branch represents an action.

    * The creator makes a post. A check is placed so that only the creator can call the post API function. The post can either be premium or not. If the post isn't premium, then it gets passed to the viewPost interact function of all subscribers. If its a premium post, then the program passes the post to the interact function of only subscribers on the premium list.
    * The subscriber subscribes to premium. A check is placed to make sure that only members who haven't subscribed to premium before can call this API function, and also the creator can't call this function. The subscriber has to pay the subscription price set by the creator before he can interact with this function. The subscriber's address gets added to the premium list, and the creator gets notified about this new subscriber.
    * The subscriber unsubscribes from premium. A check is placed to make sure that only members who have already subscribed to premium can call this API function and also the creator can't call this function. The subscriber's address gets removed from the premium list, and the creator gets notified about this unsubscription.
    * The creator withdraws the funds in the smart contract. A check is placed to make sure only the creator can call this function. The contents of the smart contract's escrow account are all transferred to the creator's wallet address.
* In line with the [token linearity property](https://docs.reach.sh/model/#term_token%20linearity%20property), the balance of the contract is transferred to the creator.

> Even though the end of the program is unreachable and the program basically runs forever, the token linearity property still has to be met. Reach isn't taking any chances.

If your pseudocode didn't follow the same algorithm as ours, that is still cool. As long as your microblog program still meets the basic criteria of a microblog application with a premium feature.

Now we translate this pseudocode into Reach code.

```
  Creator.only(() => {
    const subscriptionPrice = declassify(interact.subscriptionPrice);
  });
  Creator.publish(subscriptionPrice);
  const PREMIUM = new Set();

  const [ counter ] =
    parallelReduce([ 0 ])
      .invariant(balance() == balance())
      .while(true)
      .api_(CreatorActions.post, ({post, premium}) => {
        check( this == Creator);

        return [0, (resolve) => {
          resolve(true);

          Subscriber.only(() => {
            const subscriberAddress = this;
            if(premium){
              if(PREMIUM.member(subscriberAddress)){
                interact.viewPost(post);
              }
            }
            else {
              interact.viewPost(post);
            };
          });

          return [ counter ];
        }];
      })
      .api_(SubscriberActions.subscribe, () => {
        check((this != Creator)&&(!PREMIUM.member(this)));

        return [ subscriptionPrice * 1000000, (resolve) => {
          resolve(true);
          PREMIUM.insert(this);
          Creator.interact.viewNewPremiumSubscriber(this, true);
          return [ counter ];
        }];
      })
      .api_(SubscriberActions.unsubscribe, () => {
        check((this != Creator)&&(PREMIUM.member(this)));

        return [ 0, (resolve) => {
          resolve(true);
          PREMIUM.remove(this);
          Creator.interact.viewNewPremiumSubscriber(this, false);
          return [ counter ];
        }]
      })
      .api_(CreatorActions.withdraw, () => {
        check( this == Creator);

        return [0, (resolve) => {
          resolve(true);
          transfer(balance()).to(Creator);
          return [ counter ];
        }];
      });

  transfer(balance()).to(Creator);
  commit();

  exit();

```

At this point, when we 
```
../reach compile
```
We get a warning about untrustworthy maps and algorand. To fix this, add this line of code to the beginning of the program just before the participants get defined.
```
setOptions({ untrustworthyMaps: true });
```
When we compile again, we'll get a happy message that all our theorems are true and our program was compiled without any errors. Great job! But we still need to run our program!


## Deployment Decisions
Now that our smart contract is ready, we'll need to decide how we want to test and deploy it. 
> In a real world scenario, don't run this application. Even though a premium post doesn't get passed to the interact function of non premium members, the premium post still gets published to the consensus network and thus can be accessed by anyone on the network. A more realistic version would need the premium post to be encrypted, and need premium members to have access to a decryption key for decrypting that post. This key would be provided to them when they subscribe to premium. However, for learning purposes, this program touches many features of Reach and will help expand your knowledge of the programming language.

First we start with a simple testing console program to show the application. Here's the code for it:

```
import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);
const acc = await stdlib.newTestAccount(startingBalance);

//Set up functions for checking balance
const fmt = (x) => stdlib.formatCurrency(x, 4);

const before = await getBalance()
console.log('Your starting balance is: ' + before)
console.log(`Your address is ${acc.getAddress()}`)

const Creator = {
  post : async () => {
    const post = await ask(
      `Type in a blog post.. (1000 characters max including space)`
    );
    const isPremium =  await ask('Is this a premium post?', yesno)
    return { post, premium: isPremium };
  },

  viewNewPremiumSubscriber: (address, subscribed) => {
    console.log(`${address} just ${subscribed ? 'subscribed' : 'unsubscribed'}`)
  },
}

const Subscriber = {
  viewPost: (post) => {
    console.log('----------NEW POST----------');
    console.log(post)
    console.log('----------------------------');
  }
}



const createStream = async () => {
  const isBlogOwner = await ask(
    `Do you want to create a blog?`,
    yesno
  );
  const who = isBlogOwner ? 'Owner' : 'Subscriber';

  console.log(`Starting as ${who}`);

  let ctc = null;
  if (isBlogOwner) {
    const subscriptionPrice = await ask('How much is your subscription price?', parseFloat)
    ctc = acc.contract(backend);
    backend.Creator(ctc, {
      ...Creator,
      subscriptionPrice
    })
    console.log('Deploying Blog...');
    const info = JSON.stringify(await ctc.getInfo(), null, 2);
    console.log('Contract info..')
    console.log(info);

    while(true){
      const makePost = await ask('Do you want to create post?', yesno)
      if(makePost){
        const post = await ask(
          `Type in a blog post.. (1000 characters max including space)`
        );
        const isPremium =  await ask('Is this a premium post?', yesno)
        await ctc.apis.CreatorActions.post({
          post,
          premium: isPremium
        });
      }
      else {
        const withdraw = await ask('Do you want to withdraw your funds?', yesno)
        if(!withdraw) continue
        await ctc.apis.CreatorActions.withdraw()
      }
      
    }
  } else {
    const info = await ask(
      `Please paste the contract information of the blog you want to subscribe to:`,
      JSON.parse
    );
    ctc = acc.contract(backend, info);
    let subscribed = false

    backend.Subscriber(ctc, {
      viewPost: async (post) => {
        console.log('----------NEW POST----------');
        console.log(post)
        console.log('----------------------------');
      }
    });

    console.log("...Successfully Connected...")
    while(true){
      if(!subscribed){
        const subscribe = await ask('Do you want to subscribe for premium', yesno)
        if(subscribe){
          const sub = await ctc.apis.SubscriberActions.subscribe();
          if(sub) {
            console.log('You are now a premium member')
            subscribed = true
          }
        }
      }
      else{
        const unsubscribe = await ask('Do you want to unsubscribe from premium', yesno)
        if(unsubscribe){
          const sub = await ctc.apis.SubscriberActions.unsubscribe();
          if(sub) {
            console.log('You are no longer a premium member')
            subscribed = false
          }
        }
      }
    }
  }
};

await createStream();
```

Now when we run `$ ../reach run` we get an execution of the program. We can use one terminal as the Creator and any number of others as the Subscribers.
A web frontend implementation of this program can be seen [here](https://lunar-decentralized-microblog.netlify.app/), and its code can be found [here](https://github.com/sylvamadu/Team-32-Microblog-project).

## Discussion
You did it!

You implemented a Reach program totally on your own, with only a little bit of prodding.

If you found this workshop rewarding, please let us know on the Discord community!
