import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import type { LeaveRequest } from "../../types";
import { useNavigate } from "react-router-dom";

const Leaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [leaveType, setLeaveType] = useState("Annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/leaves/mine");
      setLeaves(res.data);
    } catch {
      setError("Failed to fetch leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // defer to avoid "setState in effect" lint
    const t = window.setTimeout(() => {
      void fetchLeaves();
    }, 0);

    return () => window.clearTimeout(t);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/leaves", { leaveType, startDate, endDate, reason });
      setLeaveType("Annual");
      setStartDate("");
      setEndDate("");
      setReason("");
      await fetchLeaves();
    } catch {
      setError("Failed to submit leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "badge badgeApproved";
      case "Rejected":
        return "badge badgeRejected";
      case "Cancelled":
        return "badge badgeCancelled";
      default:
        return "badge badgePending";
    }
  };

  return (
    <div className="page">
      <div className="header">
        <div>
          <h2 className="title">My Leave Requests</h2>
          <div className="subtle">Submit, track, and manage your leave</div>
        </div>
        <button onClick={() => navigate("/dashboard")} className="btn btnGhost">
          ← Back to Dashboard
        </button>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 style={{ marginTop: 0 }}>Apply for Leave</h3>
        {error && <p style={{ color: "#ffb5b5", marginTop: 0 }}>{error}</p>}

        <div className="grid2" style={{ alignItems: "end" }}>
          <div className="field" style={{ marginTop: 0 }}>
            <label className="label">Leave Type</label>
            <select
              className="select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option>Annual</option>
              <option>Sick</option>
              <option>Casual</option>
              <option>Unpaid</option>
            </select>
          </div>

          <div className="field" style={{ marginTop: 0 }}>
            <label className="label">Start Date</label>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: 0 }}>
            <label className="label">End Date</label>
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: 0 }}>
            <label className="label">Reason</label>
            <input
              className="input"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn btnPrimary"
          style={{ width: "100%", marginTop: 16 }}
        >
          {submitting ? "Submitting..." : "Submit Leave Request"}
        </button>
      </div>

      <h3>My Leave History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Type</th>
                <th className="th">Start Date</th>
                <th className="th">End Date</th>
                <th className="th">Reason</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td className="td" colSpan={5} style={{ textAlign: "center" }}>
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="td">{leave.leaveType}</td>
                    <td className="td">{leave.startDate}</td>
                    <td className="td">{leave.endDate}</td>
                    <td className="td">{leave.reason}</td>
                    <td className="td">
                      <span className={getStatusBadgeClass(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaves;

