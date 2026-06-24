import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context
    const navigate = useNavigate()

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return data
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {
        } finally {
            setLoading(false)
        }
    }

   useEffect(() => {
    const getAndSetUser = async () => {
        try {
            const data = await getMe()
            setUser(data.user)
        } catch (err) {
            setUser(null)
            // ✅ Only redirect if not already on login or register page
            const path = window.location.pathname
            if (path !== '/login' && path !== '/register') {
                navigate("/login")
            }
        } finally {
            setLoading(false)
        }
    }
    getAndSetUser()
}, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}