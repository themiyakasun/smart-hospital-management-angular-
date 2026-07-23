export interface DoctorModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  departmentId: string;
  departmentName: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}
