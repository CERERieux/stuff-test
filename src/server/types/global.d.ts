import type { IExTracker, IShortenerUrl } from "./basic";
import type { IBook, IIssueTracker } from "./advanced";

declare global {
  namespace Express {
    interface Request {
      _id: string;
    }
  }
}

export interface ErrorStatus {
  error: string;
  category: string;
}

export interface IGlobalUser {
  _id: string;
  password: string;
  img: string;
  exercises: IExTracker[];
  issues: IIssueTracker[];
  books: IBook[];
  shortUrl: IShortenerUrl[];
}

export interface ReqBodyCreateUser {
  _id: string;
  password: string;
}

export interface ImgSelected {
  img: string;
}
