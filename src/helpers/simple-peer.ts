import Peer from 'simple-peer'

export default class VideoCall {

    peer: Peer.Instance | null = null
    init = (stream: MediaStream, initiator: boolean): Peer.Instance => {
        console.log("Video call.init, stream: ")
        console.log(stream);
        this.peer = new Peer({
            initiator,
            stream,
            trickle: false,
            // rec: 1000,
            config: {
                iceServers: [
                    {urls: 'stun:stun4.l.google.com:19302'},
                    {urls: 'stun:global.stun.twilio.com:3478?transport=udp'},
                ],
                iceTransportPolicy: "relay"
            },
        })
        return this.peer
    }
    connect = (sdp: string): void => {
        if (this.peer) {
            console.log("Executing signal for sdp")
            this.peer.signal(sdp)
        } else {
            console.error("Peer is null in connect")
        }
    }
} 