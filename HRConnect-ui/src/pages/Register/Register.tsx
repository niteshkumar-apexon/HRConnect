import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { useToaster } from "../../components/Toaster/Toaster";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToaster();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ================= VALIDATION =================
  const validateForm = () => {
    const errors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (!fullName.trim()) {
      errors.fullName = "Full Name is required";
      isValid = false;
    }

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
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.post("/Auth/register", {
        fullName,
        email,
        password,
      });

      showToast(
        "Your account is created successfully. Your leave(s) will get created to your account within some days.",
        "success"
      );

      window.setTimeout(() => navigate("/login"), 500);
    } catch (err: unknown) {
      const e = err as ApiError;
      setError(
        e.response?.data?.message || "Registration failed. Try again."
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
            <div className="subtle">Create your account</div>
          </div>
        </div>

        {error && (
          <p style={{ color: "red", marginTop: 0 }}>{error}</p>
        )}

        {/* FULL NAME */}
        <div className="field">
          <label className="label">Full Name</label>
          <input
            className="input"
            type="text"
            value={fullName}
            onChange={(e) => {
              const value = e.target.value;
              setFullName(value);

              setValidationErrors((p) => ({
                ...p,
                fullName: value.trim() ? "" : "Full Name is required",
              }));
            }}
          />

          {validationErrors.fullName && (
            <small style={{ color: "red" }}>
              {validationErrors.fullName}
            </small>
          )}
        </div>

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
          />

          {validationErrors.email && (
            <small style={{ color: "red" }}>
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
              } else if (value.length < 6) {
                setValidationErrors((p) => ({
                  ...p,
                  password: "Password must be at least 6 characters",
                }));
              } else {
                setValidationErrors((p) => ({
                  ...p,
                  password: "",
                }));
              }

              // confirm password re-check
              if (confirmPassword && value !== confirmPassword) {
                setValidationErrors((p) => ({
                  ...p,
                  confirmPassword: "Passwords do not match",
                }));
              } else {
                setValidationErrors((p) => ({
                  ...p,
                  confirmPassword: "",
                }));
              }
            }}
          />

          {validationErrors.password && (
            <small style={{ color: "red" }}>
              {validationErrors.password}
            </small>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="field">
          <label className="label">Confirm Password</label>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);

              if (!value) {
                setValidationErrors((p) => ({
                  ...p,
                  confirmPassword: "Confirm Password is required",
                }));
              } else if (value !== password) {
                setValidationErrors((p) => ({
                  ...p,
                  confirmPassword: "Passwords do not match",
                }));
              } else {
                setValidationErrors((p) => ({
                  ...p,
                  confirmPassword: "",
                }));
              }
            }}
          />

          {validationErrors.confirmPassword && (
            <small style={{ color: "red" }}>
              {validationErrors.confirmPassword}
            </small>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          className="btn btnSuccess"
          style={{
            width: "100%",
            marginTop: 16,
            justifyContent: "center",
          }}
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