import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import type { LeaveRequest } from "../../types";

const LEAVE_TYPES = ["Casual", "Sick", "Earned"];

interface LeaveBalance {
  leaveType: string;
  totalDays: number;
  usedDays: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/leaves/mine");
        setLeaves(res.data);

        // Build balances from leave data or use defaults
        const computed = LEAVE_TYPES.map((type) => {
          const used = res.data
            .filter((l: LeaveRequest) => l.leaveType === type && l.status === "Approved")
            .reduce((acc: number) => acc + 1, 0);
          return { leaveType: type, totalDays: 10, usedDays: used };
        });
        setBalances(computed);
      } catch {
        // If employee not found, show empty state with defaults
        setBalances(LEAVE_TYPES.map((type) => ({ leaveType: type, totalDays: 10, usedDays: 0 })));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filters = ["All", "Pending", "Approved", "Rejected", "Cancelled"];
  const filtered = activeFilter === "All" ? leaves : leaves.filter((l) => l.status === activeFilter);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      Approved: "badgeApproved",
      Rejected: "badgeRejected",
      Cancelled: "badgeCancelled",
      Pending: "badgePending",
    };
    return `badge ${map[status] || "badgePending"}`;
  };

  const balanceColors = ["#ff6b35", "#1890ff", "#52c41a"];

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="header" style={{ marginBottom: 6 }}>
          <div>
            <h2 className="title" style={{ marginBottom: 2 }}>Leave Management</h2>
            <p className="subtle" style={{ margin: 0 }}>Manage your leave balance and applications.</p>
          </div>
          <div className="btnRow">
            <span className="subtle" style={{ fontWeight: 700 }}>👤 {user?.fullName}</span>
            {user?.isAdmin && (
              <button className="btn btnSuccess" onClick={() => navigate("/admin")}>
                ⚙️ Admin Panel
              </button>
            )}
            <button className="btn btnPrimary" onClick={() => navigate("/leaves")}>
              + Apply for Leave
            </button>
            <button className="btn btnDanger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <hr className="sep" />

        {/* Leave Balance Cards */}
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>My Available Balance</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {balances.map((b, i) => (
            <div key={b.leaveType} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: balanceColors[i] }}>
                {b.totalDays - b.usedDays}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{b.leaveType} Leave</div>
                <div className="subtle" style={{ fontSize: 12, marginTop: 2 }}>
                  Already taken{" "}
                  <span style={{ color: balanceColors[i], fontWeight: 700 }}>
                    {b.usedDays}.00 days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="pillRow" style={{ marginBottom: 18 }}>
          {filters.map((f) => {
            const count = f === "All" ? leaves.length : leaves.filter((l) => l.status === f).length;
            return (
              <button
                key={f}
                className={`pill ${activeFilter === f ? "pillActive" : ""}`}
                onClick={() => setActiveFilter(f)}
                style={{ fontSize: 13 }}>
                {f} {count > 0 && <span style={{ opacity: 0.7, marginLeft: 4 }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Leave History Table */}
        {loading ? (
          <p className="subtle">Loading...</p>
        ) : (
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Leave Type</th>
                  <th className="th">Start Date</th>
                  <th className="th">End Date</th>
                  <th className="th">Reason</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={5} style={{ textAlign: "center", padding: 32 }}>
                      No leave requests found. Click <strong>+ Apply for Leave</strong> to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((leave) => (
                    <tr key={leave.id}>
                      <td className="td">{leave.leaveType}</td>
                      <td className="td">{leave.startDate?.split("T")[0]}</td>
                      <td className="td">{leave.endDate?.split("T")[0]}</td>
                      <td className="td">{leave.reason}</td>
                      <td className="td">
                        <span className={getStatusBadge(leave.status)}>{leave.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;