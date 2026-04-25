import { createContext, use, useState } from "react";
import axios, { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8080/api/v1/user"

})

export const AuthProvider = ({ children }) => {

    const [userData, setUserData] = useState(null);
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {

        try {
            let req = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })

            if (req.status === HttpStatusCode.Created) {
                return req.data.message;
            }
        }
        catch (e) {
            throw e;
        }
    }

    const handleLogin = async (username, password) => {

        try {
            let req = await client.post("/login", {
                username: username,
                password: password
            });
            if (req.status === HttpStatusCode.Ok) {
                localStorage.setItem("token", req.data.token);
                router('/home');
            }
        }
        catch (e) {
            throw e;
        }
    }

    const getHistory = async () => {
        const token = localStorage.getItem('token');
        const res = await client.get('/get_all_activity', { params: { token } });
        return res.data;
    };

    const addToActivity = async (meetingCode) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await client.post('/add_to_activity', { token, meetingCode });
        } catch (e) {
            // silently fail — activity logging is non-critical
        }
    };

    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistory,
        addToActivity
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}