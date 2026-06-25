export interface User {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface AllUser {
  id: string;
  email: string;
  fullName: string;
  designation?: string;
  department?: string;
  isEmployeeCreated: boolean;
}

export interface Employee {
  id: string;
  userId: string;
  department: string;
  designation: string;
  joiningDate: string;
  fullName: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reason: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveType: string;
  totalDays: number;
  usedDays: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}



export interface AddEmployeeErrors {
  userId: string;
  department: string;
  designation: string;
  joiningDate: string;
}

export interface PendingLeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
}