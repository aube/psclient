const CALL_UUID = window.__CALL_CONFIG?.uuid;

if (!CALL_UUID) {
  document.getElementById('app').innerHTML = '<p style="text-align:center;padding:2rem;color:var(--color-error)">Invalid call link</p>';
  throw new Error('No call UUID');
}

const WS_URL = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/v1/ws/call`;

let ws = null;
let pc = null;
let localStream = null;
let callData = null;
let duration = 0;
let timerInterval = null;
let hasRemoteParticipant = false;
let mediaReady = false;
let signalingReady = false;
let pendingCandidates = [];

const $ = (id) => document.getElementById(id);

function buildUI() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <style>
      #call-videos {
        display: none;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 0.5rem;
        margin-top: 1rem;
      }
    </style>
    <div id="call-container" style="max-width:960px;margin:0 auto;padding:1rem;">
      <div id="call-status" style="text-align:center;padding:1rem;font-size:1.125rem;color:var(--color-text-secondary)">Connecting...</div>
      <div id="call-videos">
        <video id="local-video" muted playsinline style="width:100%;border-radius:0.5rem;background:#1a1a2e;min-height:240px;object-fit:cover"></video>
        <video id="remote-video" playsinline style="width:100%;border-radius:0.5rem;background:#1a1a2e;min-height:240px;object-fit:cover"></video>
      </div>
      <div id="call-timer" style="display:none;text-align:center;font-size:1.5rem;font-family:monospace;margin:1rem 0;color:var(--color-text-secondary)">00:00</div>
      <div id="call-controls" style="display:none;justify-content:center;gap:1rem;margin-top:1rem;flex-wrap:wrap">
        <button id="btn-toggle-audio" style="flex:1;min-width:100px;padding:0.5rem 1.5rem;border-radius:0.5rem;border:1px solid var(--color-border);background:var(--color-surface-main);cursor:pointer">Mute</button>
        <button id="btn-toggle-video" style="flex:1;min-width:100px;padding:0.5rem 1.5rem;border-radius:0.5rem;border:1px solid var(--color-border);background:var(--color-surface-main);cursor:pointer">Video Off</button>
        <button id="btn-end-call" style="flex:1;min-width:100px;padding:0.5rem 2rem;border-radius:0.5rem;border:none;background:#dc2626;color:#fff;cursor:pointer">End Call</button>
      </div>
    </div>
  `;
}

function setStatus(msg, isError) {
  const el = $('call-status');
  if (el) {
    el.textContent = msg;
    el.style.color = isError ? 'var(--color-error, #dc2626)' : 'var(--color-text-secondary)';
  }
}

function showLocalVideo() {
  const videos = $('call-videos');
  if (videos) videos.style.display = 'grid';
  setStatus('Waiting for participant...');
}

function showFullCall() {
  const status = $('call-status');
  if (status) status.style.display = 'none';
  const videos = $('call-videos');
  if (videos) videos.style.display = 'grid';
  const controls = $('call-controls');
  if (controls) controls.style.display = 'flex';
}

function tryStartCall() {
  if (!mediaReady || !signalingReady) return;
  if (!hasRemoteParticipant) return;

  createPeerConnection();
  showFullCall();
  startTimer();
  createOffer();
}

function updateTimer() {
  const el = $('call-timer');
  if (!el) return;
  const mins = String(Math.floor(duration / 60)).padStart(2, '0');
  const secs = String(duration % 60).padStart(2, '0');
  el.textContent = `${mins}:${secs}`;
  el.style.display = 'block';
}

function startTimer() {
  if (timerInterval) return;
  duration = 0;
  updateTimer();
  timerInterval = setInterval(() => {
    duration++;
    updateTimer();
    if (callData?.max_duration > 0 && duration >= callData.max_duration) {
      endCall('Time limit reached');
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

async function checkCall() {
  try {
    const resp = await fetch(`/api/v1/calls/${CALL_UUID}`);
    if (!resp.ok) {
      if (resp.status === 403) {
        setStatus('Access denied. You are not authorized for this call.', true);
      } else if (resp.status === 404) {
        setStatus('Call not found.', true);
      } else {
        setStatus(`Error: ${resp.status}`, true);
      }
      return null;
    }
    callData = await resp.json();

    if (callData.status !== 'pending' && callData.status !== 'active') {
      setStatus('This call is no longer available.', true);
      return null;
    }

    return callData;
  } catch (err) {
    setStatus('Failed to check call status.', true);
    return null;
  }
}

async function getWSToken() {
  try {
    const resp = await fetch('/api/v1/ws/token', { method: 'POST' });
    if (!resp.ok) throw new Error('Failed to get WS token');
    const data = await resp.json();
    return data.code;
  } catch (err) {
    setStatus('Failed to connect to signaling server.', true);
    return null;
  }
}

function connectWS(code) {
  return new Promise((resolve, reject) => {
    const url = code ? `${WS_URL}?code=${encodeURIComponent(code)}` : WS_URL;
    const socket = new WebSocket(url);

    socket.onopen = () => {
      setStatus('Connected, joining call...');
      socket.send(JSON.stringify({
        type: 'signal',
        action: 'join',
        call_uuid: CALL_UUID,
      }));

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log('WS recv:', data);
          if (data.type === 'signal') {
            handleWSSignal(data);
          }
        } catch (err) {
          console.error('Invalid WS message:', err);
        }
      };

      resolve(socket);
    };

    socket.onerror = () => {
      setStatus('WebSocket connection failed.', true);
      reject(new Error('WS connection failed'));
    };

    socket.onclose = () => {
      if (!hasRemoteParticipant) {
        setStatus('Disconnected from signaling server.', true);
      }
    };
  });
}

function createPeerConnection() {
  const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  pc = new RTCPeerConnection(config);

  pc.onicecandidate = (e) => {
    if (e.candidate && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'signal',
        action: 'ice',
        call_uuid: CALL_UUID,
        candidate: e.candidate.toJSON(),
      }));
    }
  };

  pc.ontrack = (e) => {
    console.log('ontrack:', e.track.kind, 'streams:', e.streams.length);
    const remoteVideo = $('remote-video');
    if (remoteVideo && e.streams[0]) {
      remoteVideo.srcObject = e.streams[0];
      remoteVideo.play().catch((err) => console.error('remote video play error:', err));
    }
  };

  pc.oniceconnectionstatechange = () => {
    console.log('ICE state:', pc.iceConnectionState);
    if (pc.iceConnectionState === 'connected') {
      console.log('ICE connected — P2P established');
    }
    if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
      setStatus('Connection lost.', true);
      cleanup();
    }
  };

  pc.onsignalingstatechange = () => {
    console.log('Signaling state:', pc.signalingState);
  };

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
  }
}

async function startMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  } catch (err) {
    console.warn('Video unavailable, trying audio only:', err.name, err.message);
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err2) {
      console.error('getUserMedia error:', err2.name, err2.message);
      setStatus(`Microphone error: ${err2.message}`, true);
      return false;
    }
  }

  const localVideo = $('local-video');
  if (localVideo) {
    localVideo.srcObject = localStream;
    localVideo.play().catch(() => {});
  }
  return true;
}

async function createOffer() {
  if (!pc) createPeerConnection();
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('sending offer');
    ws.send(JSON.stringify({
      type: 'signal',
      action: 'offer',
      call_uuid: CALL_UUID,
      sdp: offer.sdp,
    }));
  } catch (err) {
    console.error('Error creating offer:', err);
  }
}

async function handleOffer(sdp) {
  if (!pc) createPeerConnection();
  try {
    console.log('received offer, creating answer');
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log('sending answer');
    ws.send(JSON.stringify({
      type: 'signal',
      action: 'answer',
      call_uuid: CALL_UUID,
      sdp: answer.sdp,
    }));
  } catch (err) {
    console.error('Error handling offer:', err);
  }
}

async function handleAnswer(sdp) {
  if (!pc) {
    console.warn('handleAnswer: no PC');
    return;
  }
  try {
    console.log('received answer, setting remote description');
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
    console.log('applying', pendingCandidates.length, 'pending candidates');
    for (const c of pendingCandidates) {
      await pc.addIceCandidate(new RTCIceCandidate(c));
    }
    pendingCandidates = [];
    console.log('answer handled successfully');
  } catch (err) {
    console.error('Error handling answer:', err);
  }
}

function handleIce(candidate) {
  if (!pc) return;
  if (pc.remoteDescription && pc.remoteDescription.type) {
    pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
  } else {
    pendingCandidates.push(candidate);
  }
}

function handleWSSignal(data) {
  switch (data.action) {
    case 'joined':
      signalingReady = true;
      if (data.participants > 1 || data.participants?.length > 1) {
        hasRemoteParticipant = true;
      }
      tryStartCall();
      break;

    case 'join':
    case 'participant_joined':
      if (!hasRemoteParticipant) {
        hasRemoteParticipant = true;
        if (mediaReady) {
          showFullCall();
          startTimer();
        }
      }
      break;

    case 'offer':
      hasRemoteParticipant = true;
      handleOffer(data.sdp);
      showFullCall();
      startTimer();
      break;

    case 'answer':
      handleAnswer(data.sdp);
      break;

    case 'ice':
      handleIce(data.candidate);
      break;

    case 'participant_left':
    case 'leave':
      showRemoteLeft();
      break;
  }
}

function showRemoteLeft() {
  setStatus('Remote participant disconnected.', true);
  stopTimer();
  cleanup();
}

function cleanup() {
  if (pc) {
    pc.close();
    pc = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  const localVideo = $('local-video');
  if (localVideo) localVideo.srcObject = null;
  const remoteVideo = $('remote-video');
  if (remoteVideo) remoteVideo.srcObject = null;
  hasRemoteParticipant = false;
  pendingCandidates = [];
}

function endCall(reason) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'signal',
      action: 'leave',
      call_uuid: CALL_UUID,
    }));
  }
  stopTimer();
  cleanup();
  if (ws) {
    ws.close();
    ws = null;
  }
  setStatus(reason || 'Call ended.', false);

  fetch(`/api/v1/calls/${CALL_UUID}`, { method: 'PATCH' }).catch(() => {});
}

function setupControls() {
  $('btn-end-call')?.addEventListener('click', () => endCall('Call ended'));

  let audioEnabled = true;
  let videoEnabled = true;

  $('btn-toggle-audio')?.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    localStream?.getAudioTracks().forEach((t) => { t.enabled = audioEnabled; });
    $('btn-toggle-audio').textContent = audioEnabled ? 'Mute' : 'Unmute';
  });

  $('btn-toggle-video')?.addEventListener('click', () => {
    videoEnabled = !videoEnabled;
    localStream?.getVideoTracks().forEach((t) => { t.enabled = videoEnabled; });
    $('btn-toggle-video').textContent = videoEnabled ? 'Video Off' : 'Video On';
  });
}

window.addEventListener('beforeunload', () => {
  endCall('Page closed');
});

async function init() {
  buildUI();
  setupControls();

  setStatus('Checking call...');

  const call = await checkCall();
  if (!call) return;

  setStatus('Connecting to signaling server...');

  const token = await getWSToken();
  if (!token) return;

  ws = await connectWS(token);

  const mediaOk = await startMedia();
  if (!mediaOk) return;
  mediaReady = true;
  showLocalVideo();

  tryStartCall();
}

document.addEventListener('DOMContentLoaded', init);
