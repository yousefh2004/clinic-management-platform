export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  active: boolean;
}

export interface PatientResponse extends PatientSummary {
  dateOfBirth: string;
  gender: string;
  address: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string | null;
  address: string | null;
}