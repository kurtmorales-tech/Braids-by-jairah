
import { Service, Booking, BlogPost, FaqItem, Testimonial, GalleryImage } from './types';

export const MOCK_SERVICES: Service[] = [
  {
    id: "s1",
    name: "Knotless Braids (Small)",
    description: "Precision-engineered small knotless braids for maximum longevity and sleek finish.",
    price: 25000,
    duration: 360,
    image: "https://images.unsplash.com/photo-1646244109315-9988451121d1?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s2",
    name: "Boho Goddess Locs",
    description: "Cyber-romantic fusion featuring soft curls and textured locs.",
    price: 18000,
    duration: 240,
    image: "https://images.unsplash.com/photo-1620331700431-72439c36203c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s3",
    name: "Stitch Braid Matrix",
    description: "Clean, geometric stitch braids using high-performance gel logic.",
    price: 12000,
    duration: 120,
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f8c2b1ea?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "s4",
    name: "Fulani Protocol",
    description: "Modernized Fulani braids with customized patterns and metallic accents.",
    price: 15000,
    duration: 180,
    image: "https://images.unsplash.com/photo-1605497746444-ac961bc91bc4?q=80&w=800&auto=format&fit=crop"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Sasha Williams",
    text: "Jaira is more than a stylist; she's an architect. My knotless braids stayed fresh for 8 weeks and my edges are healthier than ever.",
    service: "Small Knotless",
    rating: 5
  },
  {
    id: "t2",
    name: "Elena Rodriguez",
    text: "The consultation felt so luxury. She truly understands hair health and density. The Goddess Locs are stunning.",
    service: "Boho Goddess Locs",
    rating: 5
  },
  {
    id: "t3",
    name: "Krystal J.",
    text: "I travel from out of state just to sit in her chair. The sanctuary vibe is real. 10/10 recommend.",
    service: "Fulani Braids",
    rating: 5
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: "g1", url: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=800", title: "Intricate Stitching", category: "Stitch" },
  { id: "g2", url: "https://images.unsplash.com/photo-1605497746444-ac961bc91bc4?q=80&w=800", title: "Golden Fulani", category: "Fulani" },
  { id: "g3", url: "https://images.unsplash.com/photo-1646244109315-9988451121d1?q=80&w=800", title: "Micro Perfection", category: "Knotless" },
  { id: "g4", url: "https://images.unsplash.com/photo-1620331700431-72439c36203c?q=80&w=800", title: "Bohemian Dream", category: "Locs" }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Secrets to Maintaining Your Knotless Braids",
    excerpt: "Keep your precision parts fresh and your edges healthy for up to 8 weeks with these pro tips.",
    category: "Maintenance",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?q=80&w=800&auto=format&fit=crop",
    content: "Maintaining knotless braids requires a balance of hydration and tension management. First, always sleep with a silk or satin scarf. Second, keep your scalp clean with a diluted witch hazel solution..."
  },
  {
    id: "blog-2",
    title: "Choosing the Right Extension Texture",
    excerpt: "Kanekalon vs. Human Hair? We break down the performance of different fiber types.",
    category: "Resources",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1593121925328-369cc8459c08?q=80&w=800&auto=format&fit=crop",
    content: "The foundation of any great protective style is the fiber selection. Kanekalon is excellent for longevity and crisp stitching, whereas human hair blends are superior for Goddess Locs..."
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "booking",
    question: "How far in advance should I book?",
    answer: "Our sanctuary typically books out 3-4 weeks in advance. New slots are released on the 1st of every month at 9 AM."
  },
  {
    category: "prep",
    question: "Is hair included in the service?",
    answer: "For specific luxury protocols (Goddess Locs, Small Knotless), high-performance hair is included. For other styles, check the service description."
  },
  {
    category: "maintenance",
    question: "How long do knotless braids typically last?",
    answer: "With proper nighttime maintenance (silk scarf) and bi-weekly scalp cleansing, our knotless protocols last 6 to 9 weeks."
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    createdAt: "2024-02-10T14:00:00Z",
    date: "2024-02-15T09:00:00",
    clientName: "Amara Cole",
    clientEmail: "amara@example.com",
    clientPhone: "+1 (555) 123-4567",
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentAmount: 3000,
    serviceId: "s1"
  }
];
