# Voxa Meet

A real-time video conferencing web app built with WebRTC, enabling peer-to-peer audio/video communication directly in the browser — no plugin required.

[Live Demo](https://voxa-video-conferencing.onrender.com)

---

## Features

- **Video & Audio Calls** — Real-time peer-to-peer communication via WebRTC
- **STUN Server Support** — Configurable ICE/STUN servers for NAT traversal
- **Screen Sharing** — Share your screen during a meeting
- **In-Meeting Chat** — Text chat alongside video
- **Authentication** — Register and login with an account
- **Guest Access** — Join as a guest without creating an account
- **Meeting Controls** — Create a meeting, join an existing one, or start instantly
- **Landing Page** — Clean entry point for new and returning users

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend | Node.js |
| Real-time | WebRTC (Peer-to-peer) |
| Signaling | WebSocket / Socket.io |
| NAT Traversal | STUN servers |
| Hosting | Render |

---

## Project Structure

```
Voxa-video-conferencing/
├── frontend/          # Client-side code (UI, WebRTC logic)
└── backend/           # Server-side code (signaling, auth, API)
```

---

## Getting Started

### Prerequisites

- Node.js (v16 or above)
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/varunn-ranaa/Voxa-video-conferencing.git
cd Voxa-video-conferencing
```

### Run the Backend

```bash
cd backend
npm install
npm run dev
```

### Run the Frontend

```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create a `.env` file in the `backend/` directory and add:

```env
PORT=8080
MONGO_URL=mongodb+srv://username:key@cluster0.cfmlstp.mongodb.net/voxa
```

Create a `.env` file in the `frontend/` directory and add:

```env
REACT_APP_API_URL=http://localhost:8080
```

---

## Upcoming Features

- [ ] Meeting Scheduling
- [ ] Virtual backgrounds
- [ ] Maybe shifting to SFU or MCU architecture for wider use

---

## Author

**Varun Rana**

> Open to contributing to projects.

