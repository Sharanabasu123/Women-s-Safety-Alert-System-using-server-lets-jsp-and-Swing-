export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  role: 'user' | 'admin';
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface Alert {
  id: string;
  userId: string;
  userName: string;
  timestamp: any; // Firestore Timestamp
  location: GeoLocation;
  status: 'active' | 'resolved';
  message: string;
}
