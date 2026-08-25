export interface DoctorSummary {
  id: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  specialty: string;
  active: boolean;
}

export interface DoctorResponse extends DoctorSummary {
  departmentId: string;
  email: string;
  phoneNumber: string;
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