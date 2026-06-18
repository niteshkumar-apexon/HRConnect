import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import type { LeaveRequest } from "../../types";
import { useNavigate } from "react-router-dom";

const Leaves = () => {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [leaveType, setLeaveType] = useState("");
  // const [leaveSubType, setLeaveSubType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [firstHalf, setFirstHalf] = useState(false);
  const [secondHalf, setSecondHalf] = useState(false);
  const [firstDaySecondHalf, setFirstDaySecondHalf] = useState(false);
  const [lastDayFirstHalf, setLastDayFirstHalf] = useState(false);

  const [attachments, setAttachments] = useState<File[]>([]);
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
    void fetchLeaves();
  }, []);

  const calculateDays = () => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  let days =
    (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24) +
    1;

  if (days <= 0) return 0;

  // Single-day leave
  if (startDate === endDate) {
    if (firstHalf || secondHalf) {
      return 0.5;
    }
    return 1;
  }

  // Multi-day leave adjustments
  if (firstDaySecondHalf) {
    days -= 0.5;
  }

  if (lastDayFirstHalf) {
    days -= 0.5;
  }

  return days;
};

  const numberOfDays = calculateDays();
 const handleBack=()=>{
    navigate("/dashboard");
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

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
  const isSingleDayLeave =
  startDate &&
  endDate &&
  startDate === endDate;

  return (
    <div className="page">
      {/* Header */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Apply for Leave</h2>
            <p
              style={{
                marginTop: "6px",
                color: "#6b7280",
              }}
            >
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
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
          </div>
        </div>
      </div>

      {/* Leave Form */}
      <div className="card" style={{ marginBottom: "24px" }}>
        {error && (
          <p style={{ color: "red", marginBottom: "16px" }}>
            {error}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          <div className="field">
            <label className="label">Leave Type *</label>
            <select
              className="select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="">Select leave type</option>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

         

          <div className="field">
            <label className="label">Start Date *</label>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
            />
          </div>

          <div className="field">
            <label className="label">End Date *</label>
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={firstHalf}
               disabled={!isSingleDayLeave}
              onChange={(e) =>
                setFirstHalf(e.target.checked)
              }
            />{" "}
            First Half
          </label>

          <label>
            <input
              type="checkbox"
              checked={secondHalf}
               disabled={!isSingleDayLeave}
              onChange={(e) =>
                setSecondHalf(e.target.checked)
              }
            />{" "}
            Second Half
          </label>

          <label>
            <input
              type="checkbox"
              checked={firstDaySecondHalf}
               disabled={isSingleDayLeave}
              onChange={(e) =>
                setFirstDaySecondHalf(
                  e.target.checked
                )
              }
            />{" "}
            First Day Second Half
          </label>

          <label>
            <input
              type="checkbox"
              checked={lastDayFirstHalf}
               disabled={isSingleDayLeave}
              onChange={(e) =>
                setLastDayFirstHalf(
                  e.target.checked
                )
              }
            />{" "}
            Last Day First Half
          </label>
        </div>

        <div
          style={{
            maxWidth: "300px",
            marginBottom: "20px",
          }}
        >
          <label className="label">
            Number of Days
          </label>

          <input
            className="input"
            value={numberOfDays}
            readOnly
          />
        </div>

        <div className="field">
          <label className="label">
            Reason For Leave *
          </label>

          <textarea
            className="input"
            rows={5}
            placeholder="Provide reason (minimum 10 characters)..."
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
          />
        </div>

        <div
          className="field"
          style={{ marginTop: "20px" }}
        >
          <label className="label">
            Please attach supporting documents
            (Optional) - Max 4 files
          </label>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) =>
              setAttachments(
                Array.from(
                  e.target.files || []
                ).slice(0, 4)
              )
            }
          />
        </div>
      </div>

      {/* Leave History */}
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
                  <th className="th">
                    Start Date
                  </th>
                  <th className="th">
                    End Date
                  </th>
                  <th className="th">Reason</th>
                  <th className="th">Status</th>
                </tr>
              </thead>

              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td
                      className="td"
                      colSpan={5}
                      style={{
                        textAlign: "center",
                      }}
                    >
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="td">
                        {leave.leaveType}
                      </td>

                      <td className="td">
                        {leave.startDate}
                      </td>

                      <td className="td">
                        {leave.endDate}
                      </td>

                      <td className="td">
                        {leave.reason}
                      </td>

                      <td className="td">
                        <span
                          className={getStatusBadgeClass(
                            leave.status
                          )}
                        >
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