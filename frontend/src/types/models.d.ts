export interface User {
  id: string;
  agreed: boolean;
  birthdate: string;
  city: string;
  email_address: string;
  first_surname: string;
  gender: string;
  height: number;
  interests: string[];
  name: string;
  password: string;
  phone_number: string;
  profile_img_path?: string;
  second_surname: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserParams {
  agreed: boolean;
  birthdate: string;
  city: string;
  email_address: string;
  first_surname: string;
  gender: string;
  height: number;
  interests: string[];
  name: string;
  password: string;
  phone_number: string;
  profile_img_path?: string;
  second_surname: string;
  weight: number;
}
