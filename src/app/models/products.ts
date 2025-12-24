import { UserReview } from './user-review';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  category: string;

  reviews: UserReview[];
};
