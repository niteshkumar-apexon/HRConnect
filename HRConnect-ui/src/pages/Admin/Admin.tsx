import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import type { Employee, LeaveRequest } from "../../types";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"employees" | "leaves">("employees");
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Employees");
      setEmployees(res.data);
    } catch {
      console.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data);
    } catch {
      console.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Defer to avoid "setState in effect" lint warnings
    const t = window.setTimeout(() => {
      void fetchEmployees();
      void fetchLeaves();
    }, 0);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeaveStatus = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      await fetchLeaves();
    } catch {
      console.error("Failed to update leave status");
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
          <h2 className="title">⚙️ Admin Panel</h2>
          <div className="subtle">Manage employees and approve leave requests</div>
        </div>
        <button onClick={() => navigate("/dashboard")} className="btn btnGhost">
          ← Back to Dashboard
        </button>
      </div>

      <div className="pillRow" style={{ marginBottom: 18 }}>
        <button
          onClick={() => setActiveTab("employees")}
          className={`pill ${activeTab === "employees" ? "pillActive" : ""}`}
        >
          👥 Employees
        </button>
        <button
          onClick={() => setActiveTab("leaves")}
          className={`pill ${activeTab === "leaves" ? "pillActive" : ""}`}
        >
          📋 Leave Requests
        </button>
      </div>

      {loading && <p className="subtle">Loading...</p>}

      {activeTab === "employees" && (
        <div>
          <h3 style={{ marginTop: 0 }}>All Employees ({employees.length})</h3>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Name</th>
                  <th className="th">Department</th>
                  <th className="th">Designation</th>
                  <th className="th">Joining Date</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={4} style={{ textAlign: "center" }}>
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="td">{emp.fullName}</td>
                      <td className="td">{emp.department}</td>
                      <td className="td">{emp.designation}</td>
                      <td className="td">{emp.joiningDate?.split("T")[0]}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "leaves" && (
        <div>
          <h3 style={{ marginTop: 0 }}>All Leave Requests ({leaves.length})</h3>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Employee</th>
                  <th className="th">Type</th>
                  <th className="th">Start</th>
                  <th className="th">End</th>
                  <th className="th">Status</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td className="td" colSpan={6} style={{ textAlign: "center" }}>
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="td">{leave.employeeId}</td>
                      <td className="td">{leave.leaveType}</td>
                      <td className="td">{leave.startDate}</td>
                      <td className="td">{leave.endDate}</td>
                      <td className="td">
                        <span className={getStatusBadgeClass(leave.status)}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="td">
                        {leave.status === "Pending" && (
                          <div className="btnRow">
                            <button
                              onClick={() => handleLeaveStatus(leave.id, "Approved")}
                              className="btn btnSuccess"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleLeaveStatus(leave.id, "Rejected")}
                              className="btn btnDanger"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

