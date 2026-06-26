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

interface LeaveDashboardResponse {
  casualLeaveTotal: number;
  casualLeaveUsed: number;
  casualLeaveRemaining: number;
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  sickLeaveRemaining: number;
  earnedLeaveTotal: number;
  earnedLeaveUsed: number;
  earnedLeaveRemaining: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancellingLeaveId, setCancellingLeaveId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leavesRes, balanceRes] = await Promise.all([
          api.get("/leaves/mine"),
          api.get<LeaveDashboardResponse>("/leaves/dashboard"),
        ]);

        setLeaves(leavesRes.data);

        const data = balanceRes.data;
        setBalances([
          {
            leaveType: "Casual",
            totalDays: data.casualLeaveTotal ?? 0,
            usedDays: data.casualLeaveUsed ?? 0,
          },
          {
            leaveType: "Sick",
            totalDays: data.sickLeaveTotal ?? 0,
            usedDays: data.sickLeaveUsed ?? 0,
          },
          {
            leaveType: "Earned",
            totalDays: data.earnedLeaveTotal ?? 0,
            usedDays: data.earnedLeaveUsed ?? 0,
          },
        ]);
      } catch {
        // Fallback values when API fails
        setLeaves([]);
        setBalances(
          LEAVE_TYPES.map((type) => ({
            leaveType: type,
            totalDays: 0,
            usedDays: 0,
          }))
        );
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

  const formatUsedDays = (days: number) => {
    return Number.isInteger(days) ? days.toFixed(2) : `${days}`;
  };

  const handleCancelLeave = async (leaveId: string) => {
    setCancellingLeaveId(leaveId);
    try {
      await api.put(`/leaves/${leaveId}/cancel`);
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === leaveId ? { ...leave, status: "Cancelled" } : leave
        )
      );
    } catch {
      console.error("Failed to cancel leave request");
    } finally {
      setCancellingLeaveId(null);
    }
  };

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="header" style={{ marginBottom: 6 }}>
          <div>            
            <h2 className="title" style={{ marginBottom: 2 }}>Employee & Leave Management System</h2>
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
                    {formatUsedDays(b.usedDays)} days
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
                  <th className="th">No of Days</th>
                  <th className="th">Reason</th>
                  <th className="th">Status</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={6} style={{ textAlign: "center", padding: 32 }}>
                      No leave requests found. Click <strong>+ Apply for Leave</strong> to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((leave) => (
                    <tr key={leave.id}>
                      <td className="td">{leave.leaveType}</td>
                      <td className="td">{leave.startDate?.split("T")[0]}</td>
                      <td className="td">{leave.endDate?.split("T")[0]}</td>
                      <td className="td">{leave.totalDays}</td>
                      <td className="td">{leave.reason}</td>
                      <td className="td">
                        <span className={getStatusBadge(leave.status)}>{leave.status}</span>
                      </td>
                      <td className="td">
                        {leave.status === "Pending" ? (
                          <button
                            className="btn btnDanger"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                            onClick={() => handleCancelLeave(leave.id)}
                            disabled={cancellingLeaveId === leave.id}
                          >
                            {cancellingLeaveId === leave.id ? "Cancelling..." : "Cancel"}
                          </button>
                        ) : (
                          "-"
                        )}
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