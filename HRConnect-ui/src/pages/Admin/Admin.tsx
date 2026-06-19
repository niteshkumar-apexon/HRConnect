import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import type { AddEmployeeErrors, Employee, PendingLeaveRequest, User } from "../../types";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<PendingLeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"employees" | "leaves">("employees");
  const [loading, setLoading] = useState(false);

  // Add Employee form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    userId: "",
    department: "",
    designation: "",
    joiningDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState<AddEmployeeErrors>({
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
  const [editUserOptions, setEditUserOptions] = useState<User[]>([]);
  const [editUsersLoading, setEditUsersLoading] = useState(false);

  const toArrayData = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) return payload as T[];
    if (payload && typeof payload === "object" && "data" in payload) {
      const nested = (payload as { data?: unknown }).data;
      return Array.isArray(nested) ? (nested as T[]) : [];
    }
    return [];
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [empRes, leaveRes] = await Promise.allSettled([
          api.get("/Employees"),
          api.get("/leaves/admin/pending"),
        ]);

        if (empRes.status === "fulfilled") {
          setEmployees(toArrayData<Employee>(empRes.value.data));
        } else {
          console.error("Failed to fetch employees");
          setEmployees([]);
        }

        if (leaveRes.status === "fulfilled") {
          setLeaves(toArrayData<PendingLeaveRequest>(leaveRes.value.data));
        } else {
          console.error("Failed to fetch leaves");
          setLeaves([]);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

const fetchEmployees = async () => {
  try {
    const res = await api.get("/Employees");
    setEmployees(toArrayData<Employee>(res.data));
  } catch {
    console.error("Failed to fetch employees");
    setEmployees([]);
  }
};

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
      setEditUserOptions([]);
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

const fetchLeaves = async () => {
  try {
    const res = await api.get("/leaves/admin/pending");
    setLeaves(toArrayData<PendingLeaveRequest>(res.data));
  } catch {
    console.error("Failed to fetch leaves");
    setLeaves([]);
  }
};

const fetchAvailableUsers = async () => {
  setUsersLoading(true);
  try {
    const res = await api.get("/Employees/available-users");
    const userData = toArrayData<User>(res.data);
    setAvailableUsers(userData);
  } catch {
    console.error("Failed to fetch available users");
    setAvailableUsers([]);
  } finally {
    setUsersLoading(false);
  }
};

const fetchEditUserOptions = async (
  currentUserId: string,
  currentFullName: string
) => {
  setEditUsersLoading(true);
  const currentUser: User = {
    id: currentUserId,
    fullName: currentFullName,
    email: "",
    isAdmin: false,
  };

  try {
    const res = await api.get("/Employees/available-users");
    const userData = toArrayData<User>(res.data);
    const hasCurrentUser = userData.some((user) => user.id === currentUserId);

    setEditUserOptions(
      hasCurrentUser
        ? userData
        : [currentUser, ...userData]
    );
  } catch {
    console.error("Failed to fetch users for edit");
    setEditUserOptions([currentUser]);
  } finally {
    setEditUsersLoading(false);
  }
};

useEffect(() => {
  if (showAddForm) {
    void fetchAvailableUsers();
  } else {
    setFieldErrors({
      userId: "",
      department: "",
      designation: "",
      joiningDate: "",
    });
    setAddError("");
  }
}, [showAddForm]);

  const validateAddEmployee = () => {
    const errors: AddEmployeeErrors = {
      userId: "",
      department: "",
      designation: "",
      joiningDate: "",
    };

    if (!newEmployee.userId) {
      errors.userId = "Please select a user.";
    }

    if (!newEmployee.department.trim()) {
      errors.department = "Department is required.";
    }

    if (!newEmployee.designation.trim()) {
      errors.designation = "Designation is required.";
    }

    if (!newEmployee.joiningDate) {
      errors.joiningDate = "Joining date is required.";
    } else {
      const selectedDate = new Date(newEmployee.joiningDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        errors.joiningDate = "Joining date cannot be in the future.";
      }
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleAddEmployee = async () => {
    if (!validateAddEmployee()) {
      return;
    }

    setAdding(true);
    setAddError("");
    try {
      await api.post("/Employees", newEmployee);
      setShowAddForm(false);
      setNewEmployee({ userId: "", department: "", designation: "", joiningDate: "" });
      setFieldErrors({ userId: "", department: "", designation: "", joiningDate: "" });
      fetchEmployees();
      fetchAvailableUsers();
    } catch (err:any) {
      setAddError(err.response?.data?.message || "Failed to add employee.");
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
        <div className="header">
          <h2 className="title">⚙️ Admin Panel</h2>
          <button className="btn btnGhost" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="pillRow" style={{ marginBottom: 24 }}>
          <button
            className={`pill ${activeTab === "employees" ? "pillActive" : ""}`}
            onClick={() => setActiveTab("employees")}>
            👥 Employees
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
                    <label className="label">User</label>
                    <select
                      className="select"
                      value={newEmployee.userId}
                      onChange={(e) => {
                        setNewEmployee({ ...newEmployee, userId: e.target.value });
                        setFieldErrors({ ...fieldErrors, userId: "" });
                      }}
                      disabled={usersLoading}
                      style={{ border: fieldErrors.userId ? "1px solid red" : undefined }}
                    >
                      <option value="">
                        {usersLoading ? "Loading users..." : "Select user"}
                      </option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} ({user.email})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.userId && (
                      <small style={{ color: "red", display: "block", marginTop: 4 }}>
                        {fieldErrors.userId}
                      </small>
                    )}
                  </div>
                  <div className="field">
                    <label className="label">Department</label>
                    <input className="input" type="text"
                      placeholder="e.g. Engineering"
                      value={newEmployee.department}
                      onChange={(e) => {
                        setNewEmployee({ ...newEmployee, department: e.target.value });
                        setFieldErrors({ ...fieldErrors, department: "" });
                      }}
                      style={{ border: fieldErrors.department ? "1px solid red" : undefined }} />
                    {fieldErrors.department && (
                      <small style={{ color: "red", display: "block", marginTop: 4 }}>
                        {fieldErrors.department}
                      </small>
                    )}
                  </div>
                  <div className="field">
                    <label className="label">Designation</label>
                    <input className="input" type="text"
                      placeholder="e.g. Developer"
                      value={newEmployee.designation}
                      onChange={(e) => {
                        setNewEmployee({ ...newEmployee, designation: e.target.value });
                        setFieldErrors({ ...fieldErrors, designation: "" });
                      }}
                      style={{ border: fieldErrors.designation ? "1px solid red" : undefined }} />
                    {fieldErrors.designation && (
                      <small style={{ color: "red", display: "block", marginTop: 4 }}>
                        {fieldErrors.designation}
                      </small>
                    )}
                  </div>
                  <div className="field">
                    <label className="label">Joining Date</label>
                    <input className="input" type="date"
                      value={newEmployee.joiningDate}
                      onChange={(e) => {
                        setNewEmployee({ ...newEmployee, joiningDate: e.target.value });
                        setFieldErrors({ ...fieldErrors, joiningDate: "" });
                      }}
                      style={{ border: fieldErrors.joiningDate ? "1px solid red" : undefined }} />
                    {fieldErrors.joiningDate && (
                      <small style={{ color: "red", display: "block", marginTop: 4 }}>
                        {fieldErrors.joiningDate}
                      </small>
                    )}
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
                    <label className="label">User</label>
                    <select
                      className="select"
                      value={editEmployee.userId}
                      onChange={(e) => setEditEmployee({ ...editEmployee, userId: e.target.value })}
                      disabled={editUsersLoading}
                    >
                      <option value="">
                        {editUsersLoading ? "Loading users..." : "Select user"}
                      </option>
                      {editUserOptions.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName}
                          {user.email ? ` (${user.email})` : ""}
                        </option>
                      ))}
                    </select>
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
                      setEditUserOptions([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
                    <tr><td className="td" colSpan={4} style={{ textAlign: "center" }}>No employees found</td></tr>
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
                              void fetchEditUserOptions(emp.userId, emp.fullName);
                              setShowEditForm(true);
                              setEditError("");
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

        {/* Leaves Tab */}
        {activeTab === "leaves" && (
          <div>
            <h3 style={{ marginBottom: 16 }}>Pending Leave Requests ({leaves.length})</h3>
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
                    <tr><td className="td" colSpan={6} style={{ textAlign: "center" }}>No pending leave requests found</td></tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave.id}>
                        <td className="td">{leave.employeeName || leave.employeeId}</td>
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