import type { IBook } from "../server/types/advanced";
import type { IExTracker } from "../server/types/basic";

export interface Welcome {
  quotes: Quote[];
  total: number;
  skip: number;
  limit: number;
}

export interface Quote {
  id: number;
  quote: string;
  author: string;
}

export interface ReqData {
  ipaddress: string;
  language: string[];
  software: string;
}

export interface TimeStampData {
  unix: number;
  utc: string;
}

export interface ShortUrlResult {
  original_url: string;
  short_url: string;
}

export interface ConversionResult {
  initNum: number;
  initUnit: string;
  returnNum: number;
  returnUnit: string;
  string: string;
}

export interface TranslateResult {
  text: string;
  translation: string;
}

export interface BoardQuery {
  id: string;
  thread_count: number;
}

export interface ThreadQuery {
  _id: string;
  text: string;
  created_on: string;
  bumped_on: string;
  replies: Reply[];
  replycount: number;
}

export interface Reply {
  _id: string;
  text: string;
  created_on: string;
}

export interface ErrorQuery {
  error: string;
}

export interface CreateThread {
  board: string;
  text: string;
  password: string;
}

/** ----------------------------------------------------------------------- */

export interface User {
  username: string;
  password: string;
}
export interface UserState {
  username: string;
  token: string;
  error: null | string;
  action: null | string;
  verifyToken: (token: string) => Promise<string>;
  createUser: ({ username, password }: User) => Promise<boolean>;
  loginUser: ({ username, password }: User) => Promise<boolean>;
  logoffUser: () => void;
}
export interface ErrorAuth {
  message: string;
  cause: null | "ExpiredToken" | "BadToken";
}

// Axios types
export interface EmptyData {
  error: string;
  category: string;
}
export interface ResponseAction {
  action: string;
}
export interface responseLogin {
  username: string;
  token: string;
}
export type Token = Pick<responseLogin, "token">;
export interface SingleOperation {
  id: string;
  token: string;
}

export interface ExerciseData {
  token: string;
  from?: string;
  to?: string;
  limit?: string;
}
export interface resGetExercise {
  username: string;
  count: number;
  log: IExTracker[];
}
export interface NewExercise {
  token: string;
  description: string;
  status: string;
  date?: Date;
}
export interface updateExerciseService {
  token: string;
  id: string;
  description: string;
  status: string;
}
export type UpdateExerciseHook = Omit<updateExerciseService, "token">;
export type ResultUpdate = Pick<IExTracker, "_id" | "description" | "status">;
export type NewExerciseHook = Omit<NewExercise, "token">;
export type StatusEx = "Pending" | "Completed" | "Deleted" | "Current";
export type DeleteExerciseHook = Omit<DeleteExercise, "token">;

export type BookService = Omit<IBook, "username" | "notes">;
export interface CreateBookService {
  token: string;
  title: string;
  status: string;
}
export type ResultCreateBook = Pick<BookService, "_id" | "title">;
export type SingleBook = Omit<IBook, "username">;
export interface UpdateBookService extends SingleOperation {
  title?: string;
  status: string;
  review?: string;
  recommend: string;
}
export type ResultUpdateBook = Omit<BookService, "_id">;
export type UpdateBookHook = Omit<UpdateBookService, "token">;
export interface CreateNoteService extends SingleOperation {
  note: string;
}
export type CreateNoteHook = Pick<CreateNoteService, "note">;
export type ResultCreateNote = Pick<IBook, "_id" | "title" | "notes">;
export interface DeleteNoteService extends SingleOperation {
  number: string;
}
export type DeleteNoteHook = Pick<DeleteNoteService, "number">;
export type ResultDeleteNote = Omit<ResultCreateNote, "title">;
export type BookStatus =
  | "Plan to Read"
  | "Current Reading"
  | "Completed"
  | "Dropped/Unfinish";
