import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  IsAdmin?: string;
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

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  // ================= VALIDATION =================
  const validateForm = () => {
    const errors = {
      email: "",
      password: "",
    };

    let isValid = true;

    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      errors.email = "Enter a valid email address";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post("/Auth/login", {
        email,
        password,
      });

      const token = response.data.token;

      const decoded = jwtDecode<JwtPayload>(token);

      const user = {
        id: decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
        email:
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        fullName:
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        isAdmin: decoded.IsAdmin === "True",
      };

      login(token, user);      
      navigate(user.isAdmin ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const e = err as ApiError;
      setError(
        e.response?.data?.message || "Login failed. Try again."
      );
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
            <div className="subtle">
              Login to manage leave requests
            </div>
          </div>
        </div>

        {/* SERVER ERROR */}
        {error && (
          <p style={{ color: "red", marginTop: 0 }}>{error}</p>
        )}

        {/* EMAIL */}
        <div className="field">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);

              // CLEAR OR UPDATE ERROR LIVE
              if (!value.trim()) {
                setValidationErrors((p) => ({
                  ...p,
                  email: "Email is required",
                }));
              } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
              ) {
                setValidationErrors((p) => ({
                  ...p,
                  email: "Enter a valid email address",
                }));
              } else {
                setValidationErrors((p) => ({
                  ...p,
                  email: "",
                }));
              }
            }}
            style={{
              border: validationErrors.email ? "1px solid red" : undefined,
            }}
          />

          {validationErrors.email && (
            <small style={{ color: "red", display: "block", marginTop: 4 }}>
              {validationErrors.email}
            </small>
          )}
        </div>

        {/* PASSWORD */}
        <div className="field">
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);

              if (!value) {
                setValidationErrors((p) => ({
                  ...p,
                  password: "Password is required",
                }));
              } else {
                setValidationErrors((p) => ({
                  ...p,
                  password: "",
                }));
              }
            }}
            style={{
              border: validationErrors.password
                ? "1px solid red"
                : undefined,
            }}
          />

          {validationErrors.password && (
            <small style={{ color: "red", display: "block", marginTop: 4 }}>
              {validationErrors.password}
            </small>
          )}
        </div>

        {/* BUTTON (NOT DISABLED) */}
        <button
          onClick={handleLogin}
          className="btn btnPrimary"
          style={{
            width: "100%",
            marginTop: 16,
            justifyContent: "center",
          }}
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