import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { AuthContext } from "../contexts/authContext";
import "../styles/history.css";

function HistoryPage() {
    const navigate = useNavigate();
    const { getHistory } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([]);
    const [userInfo, setUserInfo] = useState({ name: "", username: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistory();
                setMeetings(data.meetings || []);
                setUserInfo({ name: data.name, username: data.username });
            } catch (e) {
                setError("Failed to load history. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1800);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const uniqueCodes = [...new Set(meetings.map((m) => m.meetingCode))];

    return (
        <div className="historyContainer">

            {/* ── NAV ── */}
            <nav className="historyNav">
                <div className="historyNavLogo">
                    VOX<span className="logoAccentH">A</span>{" "}
                    <span className="logoMeetH">Meet</span>
                </div>
                <div className="historyNavRight">
                    <button className="historyNavLink" onClick={() => navigate("/home")}>
                        Back
                    </button>
                    <button className="historyLogoutBtn" onClick={handleLogout}>
                        Sign out
                    </button>
                </div>
            </nav>

            <main className="historyMain">

                {/* ── PAGE HEADER ── */}
                <div className="historyHeader">
                    <div className="historyBadge">
                        <span className="historyBadgeDot" />
                        {userInfo.username ? `${userInfo.username}` : "Your activity"}
                    </div>
                    <h1 className="historyTitle">
                        Meeting <span className="historyAccent">History</span>
                    </h1>
                    <p className="historySub">
                        All the meetings you've attended — ready to revisit or share.
                    </p>
                </div>

                {/* ── STATS ROW ── */}
                {!loading && !error && (
                    <div className="historyStats">
                        <div className="historyStat">
                            <div className="historyStatNum">{meetings.length}</div>
                            <div className="historyStatLabel">Total Sessions</div>
                        </div>
                        <div className="historyStat">
                            <div className="historyStatNum">{uniqueCodes.length}</div>
                            <div className="historyStatLabel">Unique Rooms</div>
                        </div>
                        <div className="historyStat">
                            <div className="historyStatNum">
                                {meetings.length > 0
                                    ? new Date(meetings[0].date).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                    })
                                    : "—"}
                            </div>
                            <div className="historyStatLabel">Last Meeting</div>
                        </div>
                    </div>
                )}

                {/* ── LOADING ── */}
                {loading && (
                    <div className="historyLoading">
                        <div className="historySpinner" />
                        <p className="historyLoadingText">Loading your meetings…</p>
                    </div>
                )}

                {/* ── ERROR ── */}
                {error && <div className="historyError">{error}</div>}

                {/* ── MEETING LIST ── */}
                {!loading && !error && (
                    <>
                        <p className="historySectionTitle">Recent meetings</p>

                        {meetings.length === 0 ? (
                            /* Empty state */
                            <div className="historyEmpty">
                                <div className="historyEmptyIcon">📭</div>
                                <div className="historyEmptyTitle">No meetings yet</div>
                                <p className="historyEmptyText">
                                    Join or create a meeting from the dashboard
                                    <br />
                                    and it'll appear here automatically.
                                </p>
                            </div>
                        ) : (
                            <div className="historyList">
                                {meetings.map((m) => (
                                    <div className="historyItem" key={m._id}>

                                        {/* Icon */}
                                        <div className="historyItemIcon">
                                            <i className="fas fa-history"></i>
                                        </div>

                                        {/* Meeting code + date */}
                                        <div className="historyItemInfo">
                                            <div className="historyItemCode">{m.meetingCode}</div>
                                            <div className="historyItemDate">{formatDate(m.date)}</div>
                                        </div>

                                        {/* Copy code button */}
                                        <button
                                            className={`historyItemCopy${copiedId === m._id ? " copied" : ""}`}
                                            onClick={() => handleCopy(m.meetingCode, m._id)}
                                        >
                                            {copiedId === m._id ? "✓ Copied" : "Copy code"}
                                        </button>

                                        {/* Rejoin button */}
                                        <button
                                            className="historyRejoinBtn"
                                            onClick={() => navigate(`/${m.meetingCode}`)}
                                        >
                                            Rejoin
                                        </button>

                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

            </main>
        </div>
    );
}

export default withAuth(HistoryPage);
