import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  IsAdmin: string;
}

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/Auth/login", { email, password });
      const token = response.data.token;

      const decoded = jwtDecode<JwtPayload>(token);
      const user = {
        id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        fullName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        isAdmin: decoded.IsAdmin === "True",
      };

      login(token, user);
      navigate(user.isAdmin ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const e = err as ApiError;
      setError(e.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="card authCard">
        <div className="header">
          <div>
            <h2 className="title">HRConnect</h2>
            <div className="subtle">Login to manage leave requests</div>
          </div>
        </div>

        {error && <p style={{ color: "#ffb5b5", marginTop: 0 }}>{error}</p>}

        <div className="field">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn btnPrimary"
          style={{ width: "100%", marginTop: 16, justifyContent: "center" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <hr className="sep" />
        <p className="subtle" style={{ margin: 0 }}>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;

