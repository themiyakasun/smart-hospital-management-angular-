export interface DoctorPayloadModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  departmentId: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}
