import {FunctionalComponent, h} from 'preact';
import {useEffect, useState, useRef} from 'preact/hooks';
import style from './style.css';
import { getDisplayStream } from '../../helpers/media-access';
import VideoCall from '../../helpers/simple-peer';
import {ShareScreenIcon, MicOnIcon, MicOffIcon, CamOnIcon, CamOffIcon} from '../icons';
import {SkynetClient, genKeyPairFromSeed, deriveChildSeed, KeyPair} from "skynet-js";
import Peer from "simple-peer";
const initiatorId = "-1";
const calleeId = "-2";
const masterSeed = "1011";
const portalUrl = "https://siasky.net"

interface Props {
    roomId: string;
}
enum ConnectionState {
    Begin,
    Connecting,
    SetRemoteSdp,
    Connected
}

const Video: FunctionalComponent<Props> = (props: Props) => {
    const {roomId} = props;

    const [localStream, setLocalStream] = useState<MediaStream>();
    // const [remoteStreamUrl, setRemoteStreamUrl] = useState<string>('');
    // const [streamUrl, setStreamUrl] = useState<string>('');
    const [initiator, setInitiator] = useState<boolean>(false);
    const [peer, setPeer] = useState<Peer.Instance>();
    const [full] = useState<boolean>(false);
    const [connecting, setConnecting] = useState<ConnectionState>(ConnectionState.Begin);
    const [waiting, setWaiting] = useState<boolean>(true);
    const [micState, setMicState] = useState<boolean>(true);
    const [camState, setCamState] = useState<boolean>(true);
    const childSeed = deriveChildSeed(masterSeed, roomId);
    const [{publicKey, privateKey}] = useState<KeyPair>(() => genKeyPairFromSeed(childSeed));
    const [client] = useState<SkynetClient>(() =>{
        const c = new SkynetClient(portalUrl);
        console.log(`Got public key ${publicKey}, private key ${privateKey}, initialized client for ${portalUrl}`);
        return c;
    });

    const [videoCall] = useState<VideoCall>(new VideoCall());


    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const getUserMedia = (): Promise<MediaStream> => {
        const op = {
            video: {
                width: {min: 160, ideal: 640, max: 1280},
                height: {min: 120, ideal: 360, max: 720}
            },
            audio: true
        };

        return navigator.mediaDevices.getUserMedia(op).then(stream =>{
            console.log("Setting local stream");
            console.log(stream);

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        });
    }


    const setAudioLocal = (): void => {
        if (localStream && localStream.getAudioTracks().length > 0){
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            })
        }
        setMicState(!micState);
    }

    const setVideoLocal = (): void => {
        if (localStream && localStream.getVideoTracks().length > 0){
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            })
        }
        setCamState(!camState);
    }

    const getDisplay = (): void => {
        getDisplayStream().then(stream => {
            stream.oninactive = (): void => {
                if (peer && localStream){
                    peer.removeStream(localStream);
                }

                getUserMedia().then(() => {
                    if (peer && localStream) {
                        peer.addStream(localStream);
                    }
                });
            };
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            if (peer && localStream) {
                peer.addStream(localStream);
            }
        });
    }

    // gets called when this route is navigated to
    useEffect(() => {
        const timer = window.setInterval(() => {
            console.debug(`Executing timer, connecting - ${ connecting}`);
            if (connecting == ConnectionState.Connecting || connecting == ConnectionState.SetRemoteSdp) {
                const dataKey = initiator ? calleeId : initiatorId;
                client.db.getJSON(publicKey, dataKey).then((data) => {
                    console.debug(`Timer json ok, data for ${dataKey}, we are ${initiator ? 'initiator' : 'callee'}`);
                    console.debug(data);
                    if (data.data) {
                        if (data.data.desc) {
                            console.debug("Data not null in timer");
                            console.debug(data);
                            const sdp: any = data.data.desc;
                            if ((sdp.type === 'offer' && !initiator) || (sdp.type === 'answer' && initiator)) {
                                console.log('Setting received sdp');
                                console.debug(sdp);
                                videoCall.connect(sdp);
                                setConnecting(ConnectionState.SetRemoteSdp)
                            }
                        }
                    }
                }).catch((error) => {
                    console.error("Timer getJson error")
                    console.error(error);
                })
            }
        }, 1000);

        // gets called just before navigating away from the route
        return (): void => {
            clearInterval(timer);
        };
    }, [connecting, initiator, client, publicKey]);


    const renderFull = (): string | undefined => {
        if (full) {
            return 'The room is full';
        }
    };

    const initiatePeer = (isInitiator: boolean): void => {
        getUserMedia().then((stream) => {
            const dataKey = isInitiator ? initiatorId : calleeId;
            console.log(`Will set 'joined' for ${dataKey} for room ${roomId}`);
            client.db.setJSON(privateKey, dataKey, {joined: true})
                .then(() => {
                    console.log('setJson result for joined success..');
                    console.log('Setting connecting to "Connecting"');
                    setConnecting(ConnectionState.Connecting);
                    if (stream == undefined){
                        console.warn("Aborting peer creation due to localStream == undefined")
                    } else {
                        const peer = videoCall.init(
                            stream,
                            isInitiator
                        );
                        console.log('Setting peer');
                        setPeer(peer);
                        peer.on('signal', data => {
                            const signal = {
                                desc: data
                            };
                            const dataKey = isInitiator ? initiatorId : calleeId;
                            console.log(`Will set 'signal' - for ${dataKey} for room ${roomId}`);
                            console.log(signal);
                            client.db.setJSON(privateKey, dataKey, signal)
                                .then(() => console.log('setJson signal ok'));
                        });
                        peer.on('stream', stream => {
                            console.log("Received remote stream")
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = stream;
                            } else {
                                console.log("Remote video is null")
                            }
                            setConnecting(ConnectionState.Connected);
                            setWaiting(false);
                        });
                        peer.on('error', (err) => {
                            console.warn('Peer error');
                            console.error(err);
                        });
                        peer.on('connect',() => {
                            console.log("Connected!");
                        })
                        console.log('Exiting "enter"');
                    }
                });
        });
    };


    useEffect(() => {
        client.db.getJSON(publicKey, initiatorId).then((data) => {
            console.debug(`Initial getJson ok, data`);
            console.debug(data);
            let isInitiator = false;
            if (!data.data){
                console.log("We are initiator");
                isInitiator = true;
            }
            setInitiator(isInitiator);
            initiatePeer(isInitiator);

        }).catch((error) => {
            console.error("Initial getJson error");
            console.error(error);
        })
    },[roomId]);

    return (
        <div class={style["video-wrapper"]}>
            <div class={style["video-wrapper"]}>
                <video
                    autoPlay
                    id={style.localVideo}
                    muted
                    ref={localVideoRef}
                />
            </div>
            <video
                autoPlay
                className={`${
                    connecting == ConnectionState.Connected ? '' : 'hide'
                }`}
                id={style.remoteVideo}
                ref={remoteVideoRef}
            />

            <div class={style.controls}>
                <button
                    class={style["control-btn"]}
                    onClick={getDisplay}>
                    <ShareScreenIcon />
                </button>


                <button
                    class={style["control-btn"]}
                    onClick={setAudioLocal}>
                    {
                        micState ? (
                            <MicOnIcon />
                        ):(
                            <MicOffIcon />
                        )
                    }
                </button>

                <button
                    class={style["control-btn"]}
                    onClick={setVideoLocal}>
                    {
                        camState ?(
                            <CamOnIcon />
                        ):(
                            <CamOffIcon />
                        )
                    }
                </button>
            </div>



            {connecting == ConnectionState.Connecting || connecting == ConnectionState.SetRemoteSdp && (
                <div class={style.status}>
                    <p>Establishing connection...</p>
                </div>
            )}
            {waiting && (
                <div class={style.status}>
                    <p>Waiting for someone...</p>
                </div>
            )}
            {renderFull()}
        </div>
    );
};

export default Video;
