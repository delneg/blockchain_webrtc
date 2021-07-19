# Serverless Blockchain Webrtc video chat


This project is a proof-of-concept (POC) example of how one could achieve serverless-ish video conferencing setup
using WebRTC and a 'distributed storage' via blockchain (in this case Sia Skynet https://siasky.net) for signaling and Google's STUN servers.



## Fundamental problems

1. **p2p mesh doesn't scale**

WebRTC is in nature p2p (peer-to-peer) technology, and that means that each participant has to broadcast his stream as well as receive all other streams.
This quickly becomes unmanageable because of the limited bandwidth (especially in mobile scenarios).
So, this is only good for ~10 participants max.

https://bloggeek.me/webrtc-p2p-mesh/

2. **No TURN**

STUN server is sufficient in some scenarios, however the majority of connections nowadays are heavily NAT-ted, and thus - require TURN.

While STUN server is non-demanding for resources and there are plenty of free STUN servers out there, 
with TURN servers it's a whole other story - they require A LOT of bandwith because they route all media traffic from the participants.
That's why it's uncommon to find free TURN servers.

One could, however, register an account at https://numb.viagenie.ca/ and use it, however that's against the philosophy of this project.


## Achievements

1. It works
2. Signaling via SkyNet is actually quite fast
3. The website can be hosted on SkyNet itself
4. It's actually usable even on the phone




## Used technologies

* SkyNET js sdk (4.0 beta at the time of writing)  https://github.com/SkynetLabs/skynet-js
* Simple peer https://github.com/feross/simple-peer
* Preact https://preactjs.com/
* WebRTC adapter https://github.com/webrtcHacks/adapter





## CLI Commands
*   `npm install`: Installs dependencies

*   `npm run dev`: Run a development, HMR server

*   `npm run serve`: Run a production-like server

*   `npm run build`: Production-ready build

*   `npm run lint`: Pass TypeScript files using ESLint

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).



P.S. THIS IS SDPARTA!