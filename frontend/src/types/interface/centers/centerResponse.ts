export interface CenterResponse {
  centers: Center[];
}

export interface Center {
  id: string;
  name: string;
  description: string;
  address: string;
  location: Location;
  services: any[];
  prices: Prices;
  socialMedia: SocialMedia;
  createdAt: CreatedAt;
  updatedAt: null;
}

export interface CreatedAt {
  _seconds: number;
  _nanoseconds: number;
}

export interface Location {
  lat: string;
  lng: string;
}

export interface Prices {
  anualPlan: string;
  mensaulPlan: string;
}

export interface SocialMedia {
  instagram: string;
  facebook: string;
  twitter: string;
  website: string;
}
