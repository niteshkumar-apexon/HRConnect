import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import type { Employee, LeaveRequest } from "../../types";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"employees" | "leaves"| "allEmployees">("employees");
  const [loading, setLoading] = useState(false);

  // Add Employee form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    userId: "",
    department: "",
    designation: "",
    joiningDate: "",
  });
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit Employee form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState({
    id: "",
    userId: "",
    department: "",
    designation: "",
    joiningDate: "",
    fullName: "",
  });
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  



  const handleEditEmployee = async () => {
    setEditing(true);
    setEditError("");
    try {
      // Prefer update by id. Adjust endpoint if your backend uses a different route.
      await api.put(`/Employees/${editEmployee.id}`, {
        userId: editEmployee.userId,
        department: editEmployee.department,
        designation: editEmployee.designation,
        joiningDate: editEmployee.joiningDate,
      });
      setShowEditForm(false);
      setEditEmployee({
        id: "",
        userId: "",
        department: "",
        designation: "",
        joiningDate: "",
        fullName: "",
      });
      fetchEmployees();
    } catch (err: unknown) {
      const anyErr = err as {
        response?: { data?: { message?: string } };
      };
      setEditError(anyErr.response?.data?.message || "Failed to update employee.");
    } finally {
      setEditing(false);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
    try {
      const [empRes] = await Promise.all([
        api.get("/Employees"),
      ]);

      // Supports both [..] and { data: [..] } response shapes.
      const empData = Array.isArray(empRes.data)
        ? empRes.data
        : empRes.data?.data ?? [];

      setEmployees(empData);
    } catch (err: unknown) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

const fetchEmployees = async (search = "") => {
  try {
    const res = await api.get("/Employees", {
      params: search ? { search } : {},
    });
    setEmployees(res.data);
  } catch {
    console.error("Failed to fetch employees");
  }
};
useEffect(() => {
  const delay = setTimeout(() => {
    fetchEmployees(searchTerm);
  }, 400);

  return () => clearTimeout(delay);
}, [searchTerm]);

const fetchLeaves = async () => {
  try {
    const res = await api.get("/leaves");
    setLeaves(res.data);
  } catch {
    console.error("Failed to fetch leaves");
  }
};

  const handleAddEmployee = async () => {
    setAdding(true);
    setAddError("");
    try {
      await api.post("/Employees", newEmployee);
      setShowAddForm(false);
      setNewEmployee({ userId: "", department: "", designation: "", joiningDate: "" });
      fetchEmployees();
    } catch (err) {
      const anyErr = err as {
        response?: { data?: { message?: string } };
      };
      const message = anyErr.response?.data?.message;
      setAddError(message || "Failed to add employee.");
      return;
    } finally {
      setAdding(false);
    }
  };

  const handleLeaveStatus = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch {
      console.error("Failed to update leave status");
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      Approved: "badgeApproved",
      Rejected: "badgeRejected",
      Cancelled: "badgeCancelled",
      Pending: "badgePending",
    };
    return `badge ${map[status] || "badgePending"}`;
  };

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        {/* <div className="header">
          <h2 className="title">⚙️ Admin Panel</h2>
          <button className="btn btnGhost" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div> */}

        {/* Tabs */}
        <div className="pillRow" style={{ marginBottom: 24 }}>
          <button
            className={`pill ${activeTab === "employees" ? "pillActive" : ""}`}
            onClick={() => setActiveTab("employees")}>
            👥 Employees
          </button>
           <button
    className={`pill ${activeTab === "allEmployees" ? "pillActive" : ""}`}
    onClick={() => setActiveTab("allEmployees")}>
    🧑‍🤝‍🧑 All Employees
  </button>
          <button
            className={`pill ${activeTab === "leaves" ? "pillActive" : ""}`}
            onClick={() => setActiveTab("leaves")}>
            📋 Leave Requests
          </button>
        </div>

        {loading && <p className="subtle">Loading...</p>}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div>
            <div className="header" style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>All Employees ({employees.length})</h3>
              <button className="btn btnSuccess" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? "✕ Cancel" : "+ Add Employee"}
              </button>
            </div>

            {/* Add Employee Form */}
            {showAddForm && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 14px" }}>New Employee</h4>
                {addError && (
                  <div style={{ background: "rgba(255,77,79,.15)", border: "1px solid rgba(255,77,79,.4)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#ffb5b5" }}>
                    {addError}
                  </div>
                )}
                <div className="grid2">
                  <div className="field">
                    <label className="label">User ID</label>
                    <input className="input" type="text"
                      placeholder="User UUID"
                      value={newEmployee.userId}
                      onChange={(e) => setNewEmployee({ ...newEmployee, userId: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">Department</label>
                    <input className="input" type="text"
                      placeholder="e.g. Engineering"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">Designation</label>
                    <input className="input" type="text"
                      placeholder="e.g. Developer"
                      value={newEmployee.designation}
                      onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">Joining Date</label>
                    <input className="input" type="date"
                      value={newEmployee.joiningDate}
                      onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })} />
                  </div>
                </div>
                <div className="btnRow" style={{ marginTop: 16 }}>
                  <button className="btn btnSuccess" onClick={handleAddEmployee} disabled={adding}>
                    {adding ? "Adding..." : "✅ Add Employee"}
                  </button>
                  <button className="btn btnGhost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Edit Employee Form */}
            {showEditForm && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 14px" }}>Edit Employee</h4>
                {editError && (
                  <div style={{ background: "rgba(255,77,79,.15)", border: "1px solid rgba(255,77,79,.4)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#ffb5b5" }}>
                    {editError}
                  </div>
                )}
                <div className="grid2">
                  <div className="field">
                    <label className="label">User ID</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="User UUID"
                      value={editEmployee.userId}
                      onChange={(e) => setEditEmployee({ ...editEmployee, userId: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="label">Department</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Engineering"
                      value={editEmployee.department}
                      onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="label">Designation</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Developer"
                      value={editEmployee.designation}
                      onChange={(e) => setEditEmployee({ ...editEmployee, designation: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="label">Joining Date</label>
                    <input
                      className="input"
                      type="date"
                      value={editEmployee.joiningDate}
                      onChange={(e) => setEditEmployee({ ...editEmployee, joiningDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="btnRow" style={{ marginTop: 16 }}>
                  <button className="btn btnSuccess" onClick={handleEditEmployee} disabled={editing}>
                    {editing ? "Saving..." : "✅ Save Changes"}
                  </button>
                  <button
                    className="btn btnGhost"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="searchRow" style={{ marginBottom: 16 }}>
  <input
    type="text"
    className="input"
    placeholder="Search employees..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

            {/* Employees Table */}
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Name</th>
                    <th className="th">Department</th>
                    <th className="th">Designation</th>
                    <th className="th">Joining Date</th>
                    <th className="th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td className="td" colSpan={5} style={{ textAlign: "center" }}>
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
                        <td className="td">
                          <button
                            className="btn btnGhost"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                            onClick={() => {
                              setEditEmployee({
                                id: emp.id,
                                userId: emp.userId,
                                department: emp.department,
                                designation: emp.designation,
                                joiningDate: emp.joiningDate?.split("T")[0] || "",
                                fullName: emp.fullName,
                              });
                              setShowEditForm(true);
                              setAddError("");
                            }}
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      {/* All Users Table */}
      {activeTab === "allEmployees" && (
<div className="tableWrap" >
  <table className="table">
    <thead>
      <tr>
        <th className="th">Username</th>
        <th className="th">Full Name</th>
        <th className="th">Designation</th>
        <th className="th">Department</th>
        <th className="th">Is Employee Added</th>
        <th className="th">Actions</th>
      </tr>
    </thead>
    <tbody>
      {employees.length === 0 ? (
        <tr>
          <td className="td" colSpan={6} style={{ textAlign: "center" }}>
            No employees found
          </td>
        </tr>
      ) : (
        employees.map((user) => (
          <tr key={user.id}>
            {/* <td className="td">{user.username}</td> */}
            <td className="td">{user.fullName}</td>
            <td className="td">{user.designation || "-"}</td>
            <td className="td">{user.department || "-"}</td>
            {/* <td className="td">{user.isEmployeeAdded ? "✅ Yes" : "❌ No"}</td> */}
            {/* <td className="td">
              {!user.isEmployeeAdded && (
                <button
                  className="btn btnGhost"
                  style={{ padding: "6px 12px", fontSize: 13 }}
                  onClick={() => {
                    setEditEmployee({
                      id: 0,
                      userId: user.id,
                      department: "",
                      designation: "",
                      joiningDate: "",
                      fullName: user.fullName,
                    });
                    setShowEditForm(true);
                    setAddError("");
                  }}
                >
                  ➕ Add Employee
                </button>
              )}
            </td> */}
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>)}

        {/* Leaves Tab */}
        {activeTab === "leaves" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>All Leave Requests ({leaves.length})</h3>
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
                    <tr><td className="td" colSpan={6} style={{ textAlign: "center" }}>No leave requests found</td></tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td className="td">{leave.employeeId}</td>
                        <td className="td">{leave.leaveType}</td>
                        <td className="td">{leave.startDate?.split("T")[0]}</td>
                        <td className="td">{leave.endDate?.split("T")[0]}</td>
                        <td className="td">
                          <span className={getStatusBadge(leave.status)}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="td">
                          {leave.status === "Pending" && (
                            <div className="btnRow">
                              <button className="btn btnSuccess"
                                style={{ padding: "6px 12px", fontSize: 13 }}
                                onClick={() => handleLeaveStatus(leave.id, "Approved")}>
                                ✅ Approve
                              </button>
                              <button className="btn btnDanger"
                                style={{ padding: "6px 12px", fontSize: 13 }}
                                onClick={() => handleLeaveStatus(leave.id, "Rejected")}>
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
    </div>
  );
};

export default Admin;