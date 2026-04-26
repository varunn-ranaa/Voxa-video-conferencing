import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from "socket.io-client";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from "../styles/videoComponent.css"
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Badge from '@mui/material/Badge';
import server from '../environment.js';

const server_url = `${server}`;

var connections = {}; //in memo to store peers

var peerConfigconnections = { // stun server
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
};

export default function VideoMeetComponent() {

  const navigate = useNavigate();
  const { url } = useParams();
  const isGuestLobby = url === 'guest'; // true when navigated from "Join as Guest"
  var socketRef = useRef(); // socket.io connection
  let socketIdRef = useRef(); // socket id by server
  let localVideoRef = useRef(); // local video box
  const videoRef = useRef([]); // peer video record
  const chatMessagesRef = useRef(null); // chat autoscroll container

  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [showChat, setShowChat] = useState(false);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [meetCode, setMeetCode] = useState(""); // guest only — meeting code input
  let [videos, setVideos] = useState([]);
  let [socketUserMap, setSocketUserMap] = useState({});
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  const getPermission = async () => {
    let videoAllowed = false;
    let audioAllowed = false;

    // camera/mic available
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoAllowed = true;
      videoStream.getTracks().forEach(track => track.stop());
    } catch (err) {
      videoAllowed = false;
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true }); /* To do */
      audioAllowed = true;
      audioStream.getTracks().forEach(track => track.stop());
    } catch (err) {
      audioAllowed = false;
    }
    setVideoAvailable(videoAllowed);
    setAudioAvailable(audioAllowed);

    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }

    if (videoAllowed || audioAllowed) {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAllowed,
          audio: audioAllowed
        });
        window.localStream = userMediaStream; //save globally
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
      } catch (err) {
        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }
      }
    } else {
      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }
    }
    return { videoAllowed, audioAllowed }; // return so callers can use without waiting for state update
  };

  useEffect(() => {
    const init = async () => {
      const storedName = sessionStorage.getItem('guestName');
      const isGuestArrival = !!(storedName && !isGuestLobby);

      if (isGuestArrival) {
        sessionStorage.removeItem('guestName');
        setUsername(storedName);
      }

      const { videoAllowed, audioAllowed } = await getPermission();

      // Guest arrived from /guest flow — skip second lobby, join directly
      if (isGuestArrival) {
        setAskForUsername(false);
        setVideo(videoAllowed);
        setAudio(audioAllowed);
        connectToSocketServer();
        // Re-attach stream to PiP after React re-renders the meeting screen
        setTimeout(() => {
          if (localVideoRef.current && window.localStream) {
            localVideoRef.current.srcObject = window.localStream;
          }
        }, 100);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  useEffect(() => {
    if (!askForUsername && localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) { console.log(e); }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
        }).catch(e => console.log(e));
      });
    }

    stream.getTracks().forEach(track => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        for (let id in connections) {
          connections[id].addStream(window.localStream);
          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description).then(() => {
              socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
            }).catch(e => console.log(e));
          });
        }
      };
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };



  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer') {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
              }).catch(e => console.log(e));
            }).catch(e => console.log(e));
          }
        }).catch(e => console.log(e));
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: sender, data: data }
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages(prev => prev + 1);
    }
  };

  let sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit('chat-message', message, username);
    setMessage('');
  };

  let handleChatToggle = () => {
    setShowChat(prev => !prev);
    setNewMessages(0);
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
      console.log("connect clicked")
      socketRef.current.emit("join-call", window.location.href, username);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-joined", (id, clients, userMap) => {

        setSocketUserMap(userMap);

        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigconnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            console.log("onaddstream fired!", socketListId);
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if (videoExists) {
              setVideos(videos => {
                const updateVideos = videos.map(video =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updateVideos;
                return updateVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true
              };
              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) { }

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
              }).catch(e => console.log(e));
            });
          }
        }
      });

      socketRef.current.on("user-left", (id) => {
        setVideos(videos => videos.filter(video => video.socketId !== id));
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    // Guest mode: validate code + name, store name and navigate to real meeting
    if (isGuestLobby) {
      if (!username.trim()) { alert('Please enter your name'); return; }
      if (!meetCode.trim()) { alert('Please enter a meeting code'); return; }
      sessionStorage.setItem('guestName', username.trim());
      navigate(`/${meetCode.trim()}`);
      return;
    }
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {

    setVideo(!video);

  }

  let handleAudio = () => {

    setAudio(!audio);

  }

  let handleEndCall = () => {
    //tracks stop
    try {
      let tracks = window.localStream.getTracks();
      tracks.forEach(track => track.stop());
    } catch (e) {
      console.log(e);
    }

    //peerconnections close
    for (let id in connections) {
      connections[id].close();
    }
    connections = {};

    socketRef.current.disconnect();
    setVideos([]);
    videoRef.current = [];
    setSocketUserMap({});
    setAskForUsername(true);
    getPermission();

  }


  let getDisplayMediaSucess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    }
    catch (e) { console.log(e) }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
        }).catch(e => console.log(e));
      });

    }
    stream.getTracks().forEach(track => {
      track.onended = () => {
        setScreen(false);

        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        getUserMedia();
      };
    });

  }

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSucess)
          .then((stream) => { })
          .catch((e) => console.log(e))
      }
    }
  }


  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  }

  return (
    <div className="voxa-root">

      {/* ---LOBBY SCREEN ---*/}
      {askForUsername ? (
        <div className="voxa-lobby">

          {/* background orbs */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          {/* card */}
          <div className="lobby-card">

            <div className="lobby-brand">
              <span className="brand-voxa">VOX</span>
              <span className="brand-a">A</span>
              <span className="brand-meet"> MEET</span>
            </div>

            <p className="lobby-sub">Enter your name to join the call</p>

            <div className="lobby-preview-wrap">
              <video ref={localVideoRef} autoPlay muted className="lobby-preview" />
              <div className="preview-label">Preview</div>
            </div>

            <input
              className="lobby-input"
              placeholder="Your name…"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && username && !isGuestLobby && connect()}
            />

            {/* Meeting code — only shown for guests */}
            {isGuestLobby && (
              <input
                className="lobby-input"
                placeholder="Meeting code…"
                value={meetCode}
                onChange={e => setMeetCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && username && meetCode && connect()}
              />
            )}

            <button
              className="lobby-btn"
              onClick={connect}
              disabled={isGuestLobby ? !username || !meetCode : !username}
            >
              {isGuestLobby ? 'Join Meeting' : 'Join Now'}
            </button>

            <button
              className="lobby-back-btn"
              onClick={() => navigate('/home')}
            >
              Back to Home
            </button>
          </div>
        </div>

      ) : (

        /* --- MEETING SCREEN --- */
        <div className="voxa-meet">

          {/* background orbs (meeting bhi same vibe) */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          {/* ── conference grid ── */}
          <div className={`conference-grid${showChat ? ' chat-open' : ''}`}>
            {videos.length === 0 ? (
              <div className="waiting-pill">
                <span className="waiting-dot" />
                Waiting for others to join…
              </div>
            ) : (
              videos.map((v) => (
                <div key={v.socketId} className="remote-tile">
                  <video
                    ref={ref => { if (ref && v.stream) ref.srcObject = v.stream; }}
                    autoPlay
                    playsInline
                    className="remote-video"
                  />
                  <div className="tile-id">{socketUserMap[v.socketId] || v.socketId.slice(0, 6)}</div>
                </div>
              ))
            )}
          </div>

          {/* ── chat panel ── */}
          <div className={`chat-panel${showChat ? ' chat-panel--open' : ''}`}>
            <div className="chat-header">
              <span className="chat-title">In-call Chat</span>
              <IconButton className="chat-close-btn" onClick={handleChatToggle}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.length === 0 ? (
                <p className="chat-empty">No messages yet. Say hi! 👋</p>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === username;
                  return (
                    <div key={idx} className={`chat-bubble-wrap ${isMe ? 'me' : 'them'}`}>
                      <span className="chat-sender">{isMe ? 'You' : msg.sender}</span>
                      <div className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                        {msg.data}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                placeholder="Type a message…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <IconButton className="chat-send-btn" onClick={sendMessage} disabled={!message.trim()}>
                <SendIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          {/* ── local pip ── */}
          <div className="local-pip">
            <video ref={localVideoRef} autoPlay muted className="local-video" />
            <div className="pip-label">You</div>
          </div>

          {/* ── controls bar ── */}
          <div className="controls-bar">
            <div className="controls-inner">

              <IconButton className="ctrl-btn" onClick={handleVideo}>
                {video ? <VideocamIcon /> : <VideocamOffIcon className="icon-off" />}
              </IconButton>

              <IconButton className="ctrl-btn" onClick={handleAudio}>
                {audio ? <MicIcon /> : <MicOffIcon className="icon-off" />}
              </IconButton>

              {screenAvailable && (
                <IconButton className="ctrl-btn" onClick={handleScreen}>
                  {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>
              )}

              <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton
                  className={`ctrl-btn${showChat ? ' ctrl-btn--active' : ''}`}
                  onClick={handleChatToggle}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>

              {/* end call —  red button */}
              <IconButton className="ctrl-btn ctrl-end" onClick={handleEndCall}>
                <CallEndIcon />
              </IconButton>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
