export interface ReviewUser {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  image?: string;
  img?: string;
  country?: string;
}

export interface ReviewGig {
  _id?: string;
  id?: string;
  title?: string;
  price?: number | string;
  cover?: string;
  images?: string[];
}

export interface ReviewItem {
  _id?: string;
  id?: string;
  userID?: ReviewUser;
  user?: ReviewUser;
  orderID?: any;
  orderId?: string;
  gigID?: ReviewGig;
  star?: number;
  communicationRating?: number;
  qualityRating?: number;
  valueRating?: number;
  communication?: number;
  quality?: number;
  service?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  price?: number | string;
  duration?: string;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
}
