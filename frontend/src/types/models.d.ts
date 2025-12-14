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

// Group models
export interface Group {
  id: string;
  name: string;
  description: string;
  activityType: string;
  memberCount: number;
  imageUrl: string;
  isJoined: boolean;
  createdAt: Date;
}

// Chat & Message models
export interface Message {
  id: string;
  chatId: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Chat {
  id: string;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isStorySeen: boolean;
  unreadCount: number;
}

// Centers & Reservations models
export interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
}

export interface Center {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  activities: Activity[];
  images: string[];
  rating: number;
  reviewCount: number;
  hours: {
    open: string;
    close: string;
  };
  amenities: string[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Reservation {
  id: string;
  centerId: string;
  centerName: string;
  centerImage: string;
  activityId: string;
  activityName: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  createdAt: Date;
}
