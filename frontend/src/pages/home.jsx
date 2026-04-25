import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import { AuthContext } from '../contexts/authContext';
import '../styles/home.css';

function HomeComponent() {
    const navigate = useNavigate();
    const { addToActivity, getHistory } = useContext(AuthContext);
    const [meetingCode, setMeetingCode] = useState('');
    const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
    const [username, setUsername] = useState('');

    useEffect(() => {
        getHistory().then(data => {
            if (data?.username) setUsername(data.username);
        }).catch(() => { });
    }, []);

    const handleJoinMeeting = async () => {
        if (meetingCode.trim() === '') {
            alert('Please enter a meeting code');
            return;
        }
        const code = meetingCode.trim();
        await addToActivity(code);
        navigate(`/${code}`);
    };

    const handleCreateMeeting = async () => {
        const code = Math.random().toString(36).substring(2, 10);
        await addToActivity(code);
        navigate(`/${code}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <div className="homeContainer">
            {/* NAV */}
            <nav className="homeNav">
                <div className="homeNavLogo">
                    VOX<span className="logoAccent">A</span>{' '}
                    <span className="logoMeet">Meet</span>
                </div>
                <div className="homeNavRight">
                    <Link to="/history" className="homeHistoryBtn">
                        History
                    </Link>
                    <button className="homeLogoutBtn" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </nav>

            <main className="homeMain">
                {/* LEFT — */}
                <section className="homeLeft">
                    <div className="homeBadge">
                        <span className="badgeDot"></span>
                        {username ? `Welcome, ${username}` : 'Your dashboard'}
                    </div>
                    <h1 className="homeTitle">
                        Start or join<br />
                        <span className="homeAccent">a meeting</span>
                    </h1>
                    <p className="homeSub">
                        Connect instantly with HD video, crystal-clear audio, and
                        built-in collaboration tools.
                    </p>
                </section>

                {/* RIGHT — card */}
                <div className="meetCard">
                    <div className="meetTabs">
                        <button
                            className={`meetTab ${activeTab === 'join' ? 'meetTabActive' : ''}`}
                            onClick={() => setActiveTab('join')}
                        >
                            Join Meeting
                        </button>
                        <button
                            className={`meetTab ${activeTab === 'create' ? 'meetTabActive' : ''}`}
                            onClick={() => setActiveTab('create')}
                        >
                            New Meeting
                        </button>
                    </div>

                    {activeTab === 'join' ? (
                        <div className="meetJoin">
                            <p className="meetCardLabel">Enter a meeting code</p>
                            <div className="meetInputRow">
                                <input
                                    id="meetingCodeInput"
                                    type="text"
                                    className="meetInput"
                                    placeholder="e.g. abc-defg-hij"
                                    value={meetingCode}
                                    onChange={(e) => setMeetingCode(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()}
                                />
                                <button
                                    id="joinMeetingBtn"
                                    className="meetPrimaryBtn"
                                    onClick={handleJoinMeeting}
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="meetCreate">
                            <p className="meetCardLabel">Start an instant meeting</p>
                            <p className="meetCreateSub">
                                A unique meeting code will be generated automatically.
                            </p>
                            <button
                                id="createMeetingBtn"
                                className="meetPrimaryBtn meetCreateBtn"
                                onClick={handleCreateMeeting}
                            >
                                <span className="meetBtnIcon">+</span>
                                Start Meeting
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default withAuth(HomeComponent);