import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVerification } from "./useVerification";
import * as BookService from "../services/books";
import { useState } from "react";
import type { CreateBookHook } from "../types";

/** Custom hook that manages the operations of the library, from getting all the
 * user books, add a new one or deleting all the library.
 *
 * It returns the functions to perform those operations and information
 * about if user session still valid or need to login to use this service.
 */
export function useBooks() {
  const client = useQueryClient();
  const { errorAuth, token, validFetch } = useVerification();
  const [successMutation, setSuccessMutation] = useState(false);

  /** Function that brings all the user books from database */
  const getBooks = useQuery({
    queryKey: ["books"],
    queryFn: () => BookService.getAllBooks({ token }),
    enabled: validFetch,
  });
  /** Function that adds a new book to the library */
  const createBook = useMutation({
    mutationFn: BookService.createBook,
    onSuccess: () => {
      setSuccessMutation(true);
      client.invalidateQueries({ queryKey: ["books"] });
    },
    onError: () => {
      setSuccessMutation(false);
    },
  });
  /** Function that remove all books from the user library */
  const deleteBooks = useMutation({
    mutationFn: BookService.deleteLibrary,
    onSuccess: () => {
      setSuccessMutation(true);
      client.invalidateQueries({ queryKey: ["books"] });
    },
    onError: () => {
      setSuccessMutation(false);
    },
  });

  // Return the data needed to perform those operations and display the info that user needs and wants from the service
  return {
    data: getBooks.data,
    errorBook: getBooks.error,
    errorAuth,
    success: successMutation,
    createNewBook: ({ title, status }: CreateBookHook) => {
      createBook.mutate({ title, status, token });
    },
    deleteLibrary: () => {
      deleteBooks.mutate({ token });
    },
  };
}
