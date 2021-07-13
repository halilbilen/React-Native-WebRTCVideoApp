import React, { useEffect, useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { API_URL } from 'react-native-dotenv'
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    mediaDevices,
} from 'react-native-webrtc';
import { HubConnectionBuilder, LogLevel } from "@aspnet/signalr";
import { connect } from 'react-redux'
import * as Actions from '../redux/actions'
function Chat({ route }) {
    const { username, userId, isHost, room } = route.params
    const [localStream, setLocalStream] = useState({ toURL: () => null });
    const [remoteStream, setRemoteStream] = useState({ toURL: () => null });
    const [messages, setMessages] = useState([]);
    const [isFront, setIsFront] = useState(true);
    const [hubConnection, setHubConnection] = useState(null);
    const [stunConnection, setStunConnection] = useState(
        new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302',
                }, {
                    urls: 'stun:stun1.l.google.com:19302',
                }, {
                    urls: 'stun:stun2.l.google.com:19302',
                }

            ],
        }),
    );
    useMemo(() => {
        setHubConnection(new HubConnectionBuilder()
            .withUrl(API_URL)
            .configureLogging(LogLevel.Information)
            .build())
    }, [])

    useEffect(() => {
        //socket start
        start()
        //video start
        startStream()

        //listen socket
        hubConnection.on("Connected", function (channelId, who, connectionId) {
            if (room == channelId) { join(); }
        });

        hubConnection.on("joined", function (roomId, connectionId, who) {
            console.log(who + " " + roomId + ' odasına katıldı.');
        });
        hubConnection.on("ready", function (roomId) {
            console.log("Ready:", roomId)
        });

        hubConnection.on("toggleVideo", function (roomId, connectionId) {
            console.log('Toggle Video', roomId);
            // remoteStream.getVideoTracks()[0].enabled = !(remoteStream.getVideoTracks()[0].enabled);
        });
        hubConnection.on("toggleAudio", function (roomId, connectionId) {
            console.log('Toggle Audio', roomId);
            // remoteStream.getAudioTracks()[0].enabled = !(remoteStream.getAudioTracks()[0].enabled);
        });

        hubConnection.on('message', function (message) {
            console.log("Message----->", message);
            switch (message.type) {
                case 'offer':
                    handleOffer(message.offer);
                    break;
                case 'answer':
                    handleAnswer(message.answer);
                    break;
                case 'candidate':
                    handleCandidate(message.candidate);
                    break;
                case 'leave':
                    handleLeave();
                    break;
                default:
                    break;
            }
        });

        stunConnection.onaddstream = event => { setRemoteStream(event.stream); };
        stunConnection.onicecandidate = event => { if (event.candidate) { send({ type: 'candidate', candidate: event.candidate, }); } };
    }, [])

    const start = () => { hubConnection.start().then(() => { hubConnection.invoke('Connected', room, userId, username, isHost).catch(err => console.error(err)); }).catch(err => console.log('Error while establishing connection', err)) }

    const join = () => { hubConnection.invoke('JoinRoom', room, username).catch(err => console.error(err)); }

    const send = (message) => { hubConnection.invoke('SendMessage', room, message).catch(err => console.error(err)); }

    //call user
    const onCall = () => { stunConnection.createOffer().then(offer => { stunConnection.setLocalDescription(offer).then(() => { send({ type: 'offer', offer: offer, }); }); }); };

    const handleOffer = async (offer) => {
        try {
            await stunConnection.setRemoteDescription(new RTCSessionDescription(offer));
            stunConnection.createAnswer().then((answer) => {
                stunConnection.setLocalDescription(answer);
                send({ type: 'answer', answer: answer });
            });
        } catch (err) {
            console.log('Offerr Error', err);
        }
    };

    const handleAnswer = answer => { stunConnection.setRemoteDescription(new RTCSessionDescription(answer)); };

    const handleCandidate = (candidate) => { stunConnection.addIceCandidate(new RTCIceCandidate(candidate)); };

    const startStream = () => {
        mediaDevices.enumerateDevices().then(sourceInfos => {
            var videoSourceId = sourceInfos.find((device) => device.kind === 'videoinput' && device.facing === (isFront ? 'front' : 'environment'));
            mediaDevices
                .getUserMedia({
                    audio: true,
                    video: {
                        mandatory: { minWidth: Dimensions.get('window').width, minHeight: Dimensions.get('window').height, minFrameRate: 30, },
                        facingMode: isFront ? 'user' : { exact: 'environment' },
                        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
                    },
                }).then(stream => {
                    setLocalStream(stream)
                    stunConnection.addStream(stream);

                })
                .catch(error => { console.log(error) });
        });
    }

    const handleLeave = () => {
        setRemoteStream({ toURL: () => null });
        stunConnection.close();
    };

    const stopStream = () => {
        send({ type: 'leave' });
        handleLeave();
        setLocalStream(null)
    }

    const startStopAudio = () => {
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled
        })
    }

    const switchCamera = () => {
        localStream.getVideoTracks().forEach((track) => {
            track._switchCamera()
        })
    }

    const startStopVideo = () => {
        remoteStream.getVideoTracks().forEach(function (track) {
            track.enabled = !track.enabled
        });
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ width: "100%", height: "90%", justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>

                <View style={{ width: "100%", height: "50%", justifyContent: "center", alignItems: "center", borderWidth: 1 }}>
                    {remoteStream && (<RTCView objectFit={"contain"} streamURL={remoteStream.toURL()} style={{ width: "100%", height: "100%" }} />)}
                </View>
                <View style={{ right: 0, bottom: 0, width: 118, height: "20%", justifyContent: "center", alignItems: "center", borderWidth: 1 }}>
                    {localStream && (<RTCView objectFit={"contain"} style={{ width: "100%", height: "100%", }} streamURL={localStream.toURL()} />)}
                </View>
            </View>
            <View style={{ width: "100%", height: "10%", flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#FFFFFF" }}>
                <TouchableOpacity style={{ width: 46, height: 46, borderRadius: 0, backgroundColor: "white", borderWidth: 1, borderColor: "#EFEFEF", justifyContent: "center", alignItems: "center" }} onPress={() => { onCall() }}>
                    <Text style={{ fontSize: 10 }}>ARA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 46, height: 46, borderRadius: 0, backgroundColor: "white", borderWidth: 1, borderColor: "#EFEFEF", justifyContent: "center", alignItems: "center" }} onPress={() => { stopStream() }}>
                    <Text style={{ fontSize: 10 }}>KONUŞMAYI BİTİR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 46, height: 46, borderRadius: 0, backgroundColor: "white", borderWidth: 1, borderColor: "#EFEFEF", justifyContent: "center", alignItems: "center" }} onPress={() => { switchCamera() }}>
                    <Text style={{ fontSize: 10 }}>KAMERAYI ÇEVİR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 46, height: 46, borderRadius: 0, backgroundColor: "white", borderWidth: 1, borderColor: "#EFEFEF", justifyContent: "center", alignItems: "center" }} onPress={() => { startStopVideo() }}>
                    <Text style={{ fontSize: 10 }}>KAMERAYI AÇ/KAPAT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: 46, height: 46, borderRadius: 0, backgroundColor: "white", borderWidth: 1, borderColor: "#EFEFEF", justifyContent: "center", alignItems: "center" }} onPress={() => { startStopAudio() }}>
                    <Text style={{ fontSize: 10 }}>SESİ AÇ/KAPAT</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
}
// remoteStream.getVideoTracks()[0].enabled = !(remoteStream.getVideoTracks()[0].enabled);

const mapStateToProps = state => {
    const { user } = state.login;
    return {
        user
    }
}

export default ChatContainer = connect(mapStateToProps, Actions)(Chat); 