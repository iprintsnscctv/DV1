import { GuestReview } from '../types';

const REVIEWS_STORAGE_KEY = 'div_guest_reviews_v1';

export const INITIAL_REVIEWS: GuestReview[] = [
  {
    id: 'rev-1',
    roomId: 'room-0',
    roomName: 'Room 0 - Big Family Room',
    roomNumber: '0',
    reservationId: 'res-103',
    guestId: 'cust-3',
    guestName: 'Marcus Chen',
    guestEmail: 'm.chen@example.com',
    rating: 5,
    title: 'Exceptional hospitality and very clean transient rooms!',
    comment: 'We stayed with our entire family during our Vigan heritage trip. The location along Diversion Road is so convenient with ample parking space. The air conditioning was cold, showers had great pressure, and the hosts were super accommodating!',
    media: [
      {
        id: 'med-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        name: 'Spacious Family Bed Setup',
      },
      {
        id: 'med-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        name: 'Clean Room Interior',
      },
      {
        id: 'med-3',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        name: 'Room Walkthrough Tour.mp4',
      }
    ],
    status: 'approved',
    createdAt: '2026-09-18 19:30',
    reviewedAt: '2026-09-19 08:00',
  },
  {
    id: 'rev-2',
    roomId: 'room-3',
    roomName: 'Room 3 - Heritage Balcony Suite',
    roomNumber: '3',
    reservationId: 'res-102',
    guestId: 'cust-2',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.rostova@example.com',
    rating: 5,
    title: 'Peaceful stay close to Calle Crisologo!',
    comment: 'The balcony view is breathtaking in the morning. Fast Wi-Fi and the 24/7 front gate staff made us feel very safe and well taken care of. Highly recommended for couples or families looking for a relaxing villa vibe.',
    media: [
      {
        id: 'med-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        name: 'Balcony View',
      }
    ],
    status: 'approved',
    createdAt: '2026-09-22 11:20',
    reviewedAt: '2026-09-22 13:00',
  },
  {
    id: 'rev-3',
    roomId: 'room-1',
    roomName: 'Room 1 - Big Family Room',
    roomNumber: '1',
    reservationId: 'res-101',
    guestId: 'cust-1',
    guestName: 'Alexander Wright',
    guestEmail: 'alex.wright@example.com',
    rating: 5,
    title: 'Super spacious loft & clean private bath',
    comment: 'Loved the modern glass high ceiling and smart TV setup. Check-in was fast and seamless. Took a nice video tour of the lounge!',
    media: [
      {
        id: 'med-5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
        name: 'Family Lounge Area',
      },
      {
        id: 'med-6',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        name: 'Villa Tour.mp4',
      }
    ],
    status: 'pending',
    createdAt: '2026-09-24 16:45',
  },
  {
    id: 'rev-4',
    roomId: 'room-2',
    roomName: 'Room 2 - Studio Transient',
    roomNumber: '2',
    guestId: 'cust-4',
    guestName: 'Sophia Lorenzana',
    guestEmail: 'sophia.l@example.com',
    rating: 4,
    title: 'Great budget transient with hot shower',
    comment: 'Perfect for quick weekend trips. Clean sheets and towels provided. Easy access to main highway.',
    media: [
      {
        id: 'med-7',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        name: 'Room 2 Bed Setup',
      }
    ],
    status: 'pending',
    createdAt: '2026-09-24 20:10',
  }
];

export const getStoredReviews = (): GuestReview[] => {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored reviews', e);
    return INITIAL_REVIEWS;
  }
};

export const saveReview = (review: GuestReview): GuestReview[] => {
  const current = getStoredReviews();
  const exists = current.some((r) => r.id === review.id);
  const updated = exists
    ? current.map((r) => (r.id === review.id ? review : r))
    : [review, ...current];

  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save review', e);
  }
  return updated;
};

export const updateReviewStatus = (
  reviewId: string,
  status: 'approved' | 'rejected' | 'pending',
  adminFeedback?: string
): GuestReview[] => {
  const current = getStoredReviews();
  const updated = current.map((r) => {
    if (r.id === reviewId) {
      return {
        ...r,
        status,
        adminFeedback: adminFeedback !== undefined ? adminFeedback : r.adminFeedback,
        reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
    }
    return r;
  });

  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update review status', e);
  }
  return updated;
};

export const deleteStoredReview = (reviewId: string): GuestReview[] => {
  const current = getStoredReviews();
  const updated = current.filter((r) => r.id !== reviewId);
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete review', e);
  }
  return updated;
};
