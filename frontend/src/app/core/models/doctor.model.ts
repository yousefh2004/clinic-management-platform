export interface DoctorResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentId: string;
  departmentName: string;
  specialty: string;
  active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface DoctorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  departmentId: string;
  specialty: string;
}