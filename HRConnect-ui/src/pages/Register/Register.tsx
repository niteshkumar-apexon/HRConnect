import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/Auth/register", { fullName, email, password });
      navigate("/login");
    } catch (err: unknown) {
      const e = err as ApiError;
      setError(e.response?.data?.message || "Registration failed. Try again.");
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
            <div className="subtle">Create your account</div>
          </div>
        </div>

        {error && <p style={{ color: "#ffb5b5", marginTop: 0 }}>{error}</p>}

        <div className="field">
          <label className="label">Full Name</label>
          <input
            className="input"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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
          onClick={handleRegister}
          disabled={loading}
          className="btn btnSuccess"
          style={{ width: "100%", marginTop: 16, justifyContent: "center" }}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <hr className="sep" />
        <p className="subtle" style={{ margin: 0 }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;

