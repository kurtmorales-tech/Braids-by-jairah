
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // In cents
  duration: number; // In minutes
  image: string;
}

export interface Booking {
  id: string;
  createdAt: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID';
  paymentAmount: number;
  serviceId: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  content: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'booking' | 'prep' | 'maintenance';
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  service: string;
  rating: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum BookingStep {
  SERVICE_SELECT = 1,
  TEMPORAL_SELECT = 2,
  CLIENT_INFO = 3,
  PAYMENT = 4,
  CONFIRMATION = 5
}
