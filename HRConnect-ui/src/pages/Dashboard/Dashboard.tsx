import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div>
          <h2 className="title">HRConnect Dashboard</h2>
          <div className="subtle">Employee leave management</div>
        </div>

        <div className="btnRow" style={{ justifyContent: "flex-end" }}>
          <span className="subtle" style={{ marginRight: 6, fontWeight: 700 }}>
            👤 {user?.fullName}
          </span>
          <button onClick={handleLogout} className="btn btnDanger">
            Logout
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>
          Welcome, {user?.fullName}! 👋
        </h3>
        <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
          Role: {user?.isAdmin ? "HR Admin" : "Employee"}
        </p>
      </div>

      {/* Quick Links */}
      <div className="btnRow">
        <button onClick={() => navigate("/leaves")} className="btn btnPrimary" style={{ padding: "14px 22px" }}>
          📋 My Leaves
        </button>
        {user?.isAdmin && (
          <button onClick={() => navigate("/admin")} className="btn btnSuccess" style={{ padding: "14px 22px" }}>
            ⚙️ Admin Panel
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;