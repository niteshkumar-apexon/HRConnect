import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import type { LeaveRequest } from "../../types";
import { useNavigate } from "react-router-dom";

interface AvailableLeaveType {
  leaveType: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

const Leaves = () => {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [leaveType, setLeaveType] = useState("");
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState<AvailableLeaveType[]>([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [firstHalf, setFirstHalf] = useState(false);
  const [secondHalf, setSecondHalf] = useState(false);
  const [firstDaySecondHalf, setFirstDaySecondHalf] = useState(false);
  const [lastDayFirstHalf, setLastDayFirstHalf] = useState(false);

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

  const fetchAvailableLeaveTypes = async () => {
    setLeaveTypesLoading(true);
    try {
      const res = await api.get("/leaves/leave-balance");
      const leaveTypes = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      setAvailableLeaveTypes(leaveTypes);
    } catch {
      setAvailableLeaveTypes([]);
    } finally {
      setLeaveTypesLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeaves();
    void fetchAvailableLeaveTypes();
  }, []);

  // ================= DATE VALIDATION =================
  const today = new Date();
today.setHours(0, 0, 0, 0);

const minDate = new Date();
minDate.setHours(0, 0, 0, 0);
minDate.setDate(minDate.getDate() - 15);


const minDateString = [
  minDate.getFullYear(),
  String(minDate.getMonth() + 1).padStart(2, "0"),
  String(minDate.getDate()).padStart(2, "0"),
].join("-");

const start = startDate ? new Date(startDate) : null;
const end = endDate ? new Date(endDate) : null;


const isDateValid =
  !!start &&
  !!end &&
  start >= minDate &&
  end >= start;


const reasonValid = reason.trim().length >= 10;


const isFormValid =
  !!leaveType &&
  isDateValid &&
  reasonValid;

  // ================= DAYS CALCULATION =================
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const startD = new Date(startDate);
    const endD = new Date(endDate);

    let days =
      (endD.getTime() - startD.getTime()) /
        (1000 * 60 * 60 * 24) +
      1;

    if (days <= 0) return 0;

    if (startDate === endDate) {
      if (firstHalf || secondHalf) return 0.5;
      return 1;
    }

    if (firstDaySecondHalf) days -= 0.5;
    if (lastDayFirstHalf) days -= 0.5;

    return days;
  };

  const numberOfDays = calculateDays();

const isSingleDayLeave =
  startDate && endDate && startDate === endDate;

  const handleBack = () => {
    navigate("/dashboard");
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    setError("");

    if (!isFormValid) {
      setError("Please fill all required fields correctly.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/leaves", {
        leaveType,
        startDate,
        endDate,
        reason,
        firstHalf,
        secondHalf,
        firstDaySecondHalf,
        lastDayFirstHalf,
      });

      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setFirstHalf(false);
      setSecondHalf(false);
      setFirstDaySecondHalf(false);
      setLastDayFirstHalf(false);

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

      {/* HEADER */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h2 style={{ margin: 0 }}>Apply for Leave</h2>
            <p style={{ marginTop: "6px", color: "#6b7280" }}>
              Submit a leave request for yourself.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn btnPrimary"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              className="btn btnPrimary"
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="card" style={{ marginBottom: "24px" }}>

        {error && (
          <p style={{ color: "red", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
        }}>

          {/* LEAVE TYPE */}
          <div className="field">
            <label className="label">Leave Type *</label>
            <select
              className="select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}>

                <option value="" style={{ color: "#000" }}>
                  {leaveTypesLoading ? "Loading leave types..." : "Select leave type"}
                </option>
                {availableLeaveTypes.map((type) => (
                  <option key={type.leaveType} value={type.leaveType} style={{ color: "#000" }}>
                    {type.leaveType} ({type.remainingDays} days available)
                  </option>
                ))}

            </select>
          </div>

          {/* START DATE */}
          <div className="field">
            <label className="label">Start Date *</label>
            <input
              className="input"
              type="date"
              value={startDate}
               min={minDateString}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* END DATE */}
          <div className="field">
            <label className="label">End Date *</label>
            <input
              className="input"
              type="date"
              value={endDate}
               min={minDateString}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

       {/* CHECKBOXES */}
       <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    marginTop: "20px",
    marginBottom: "20px",
  }}
>
  {/* SINGLE DAY OPTIONS */}
  <label>
    <input
      type="checkbox"
      checked={firstHalf}
      disabled={!isSingleDayLeave}
      onChange={(e) => setFirstHalf(e.target.checked)}
    />
    First Half
  </label>

  <label>
    <input
      type="checkbox"
      checked={secondHalf}
      disabled={!isSingleDayLeave}
      onChange={(e) => setSecondHalf(e.target.checked)}
    />
    Second Half
  </label>

  {/* MULTI DAY OPTIONS */}
  <label>
    <input
      type="checkbox"
      checked={firstDaySecondHalf}
      disabled={isSingleDayLeave || numberOfDays < 2}
      onChange={(e) =>
        setFirstDaySecondHalf(e.target.checked)
      }
    />
    First Day Second Half
  </label>

  <label>
    <input
      type="checkbox"
      checked={lastDayFirstHalf}
      disabled={isSingleDayLeave || numberOfDays < 2}
      onChange={(e) =>
        setLastDayFirstHalf(e.target.checked)
      }
    />
    Last Day First Half
  </label>
</div>

        {/* DAYS */}
        <div style={{ maxWidth: "300px", marginBottom: "20px" }}>
          <label className="label">Number of Days</label>
          <input className="input" value={numberOfDays} readOnly />
        </div>

        {/* REASON */}
        <div className="field">
          <label className="label">Reason For Leave *</label>

          <textarea
            className="input"
            rows={5}
            placeholder="Provide reason (minimum 10 characters)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

      </div>

      {/* HISTORY */}
      <div className="card">
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
                     <td className="td">{leave.startDate?.split("T")[0]}</td>
                      <td className="td">{leave.endDate?.split("T")[0]}</td>
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

    </div>
  );
};

export default Leaves;