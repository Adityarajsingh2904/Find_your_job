export interface User {
  role: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  residentialAddress: string;
  profession: string;
  gender: string;
  summary?: string;
  profilePhoto?: string;
  resume?: string;
}
