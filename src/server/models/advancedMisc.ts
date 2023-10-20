import mongoose from "mongoose";
import type {
  StockAPI,
  LikeStock,
  OperationStocks,
  StockDocument,
  StockQuery,
  SingleConsultStock,
  IStocksData,
  IThreadFiltered,
  IReplyFiltered,
  CreateThread,
  UserDataCreate,
  GetReplies,
  DeleteElementBoard,
} from "../types/advancedMisc";
import { Stocks, Clients, Board, Thread, Reply } from "../schemas/advancedMisc";

// Link to the API we consult to get the stock market info
const STOCK_API =
  "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote";
const ERROR_STOCK = {
  CREATING_CLIENT: "Couldn't create new client, please try again later",
  CREATING_STOCK: "Couldn't create new stock, please try again later",
  FAIL_FETCH: "Couldn't get the info of the user stock, please try again later",
  FINDING_ALL_CLIENTS:
    "Couldn't get all clients due a problem, please try again later.",
  FINDING_STOCK: "Couldn't find the user stock, please try again later",
  PUTTING_LIKES:
    "Couldn't assign the likes to the wanted stock, please try again later",
  UPDATE_STOCK: "Couldn't update the user stock, please try again later",
};

/** ------------------------------------------------------------------------ */

export async function consultStock({ stock, like, _id }: StockQuery) {
  // We will search if client is new or already exist
  const dbClientId = await Clients.findById({ _id }).catch(err => {
    console.error(err);
    return { error: ERROR_STOCK.FINDING_ALL_CLIENTS };
  });

  let currentClient; // Auxiliar to get the current client
  // If it isn't new
  if (dbClientId !== null) {
    // In case of error, return the error
    if ("error" in dbClientId) return dbClientId;
    // If it's valid, then modify the likes
    currentClient = await putLikes({
      currentClient: dbClientId,
      stock,
      like,
    });
    if ("error" in currentClient) return currentClient;
  } else {
    // If is new, create it the ID and then the new client
    const newID = new mongoose.Types.ObjectId(_id);
    currentClient = await createNewClient(newID);
    if ("error" in currentClient) return currentClient;
    currentClient = await putLikes({ currentClient, stock, like });
    if ("error" in currentClient) return currentClient;
  }

  /** Once we got our client with the likes saved, we move to do
   * operations with the stocks */
  // First we have to see if the stock is 1 or 2
  if (typeof stock === "string") {
    // Call the function that do operations to the stock once with the client and the stock name
    const resultStock = await operationStocks({ currentClient, stock });
    if ("error" in resultStock) return resultStock;
    const infoStock = await fetchInfo(resultStock); // Fetch the info of the stock
    if ("error" in infoStock) return infoStock;
    // Make the result with the fetch dataand return it
    const resultConsult: SingleConsultStock = {
      stock: infoStock.symbol,
      price: infoStock.latestPrice,
      likes: resultStock.likes,
    };
    return resultConsult;
  } else {
    /** If there are 2 stocks, we call the operationStocks function for
     * each stock and then wait for both to finish */
    const stock1 = await operationStocks({ currentClient, stock: stock[0] });
    const stock2 = await operationStocks({ currentClient, stock: stock[1] });
    if ("error" in stock1) return stock1;
    if ("error" in stock2) return stock2;
    /** Once we finished all the stock and client operations, then we work to
     * display what client ask us for, the stock price, stock symbol and
     * relative likes of the stock
     * Since we have 2 stocks, we repeat the process of get first all the
     * info and then use both results */
    const infoStock1 = await fetchInfo(stock1);
    const infoStock2 = await fetchInfo(stock2);
    if ("error" in infoStock1) return infoStock1;
    if ("error" in infoStock2) return infoStock2;
    /** Call to fetchInfo function to get all the info needed to show final
     * result for each stock and once we got all the info, we get relative likes */
    const relLikes = stock1.likes - stock2.likes;

    let orderedStock; // Auxiliar to order stocks based on the likes
    // Get info needed from both stocks
    const stockData1 = {
      stock: infoStock1.symbol,
      price: infoStock1.latestPrice,
    };
    const stockData2 = {
      stock: infoStock2.symbol,
      price: infoStock2.latestPrice,
    };
    // Order them by likes
    if (relLikes > 0) {
      orderedStock = [
        { ...stockData1, rel_likes: relLikes },
        { ...stockData2, rel_likes: -relLikes },
      ];
    } else {
      orderedStock = [
        { ...stockData2, rel_likes: -relLikes },
        { ...stockData1, rel_likes: relLikes },
      ];
    }
    // Make the response to display and return it
    const resultConsult: IStocksData = {
      stockData: [{ ...orderedStock[0] }, { ...orderedStock[1] }],
    };
    return resultConsult;
  }
}

/** Function that creates and save a Client in the database */
async function createNewClient(_id: mongoose.Types.ObjectId) {
  const newClient = new Clients({
    _id,
    liked: {},
  });
  const resultSave = await newClient.save().catch(err => {
    console.error(err);
    return { error: ERROR_STOCK.CREATING_CLIENT };
  });
  return resultSave;
}

/** Function that do operations with the stocks, create those in case
 * aren't found in db or modify those if exist */
async function putLikes({ currentClient, stock, like }: LikeStock) {
  // Since like is a string, we get the bool value of it with the next
  const boolLike = like === "true"; // Auxiliar to get the boolean
  // We will update liked values in client, case where we only get 1 stock
  if (typeof stock === "string") {
    const lowerStock = stock.toLowerCase();
    currentClient.liked.set(lowerStock, boolLike);
  } else {
    stock.map(sStock => {
      const lowerStock = sStock.toLowerCase();
      currentClient.liked.set(lowerStock, boolLike);
      return null;
    });
  }
  const resultSave = await currentClient.save().catch(err => {
    console.error(err);
    return { error: ERROR_STOCK.PUTTING_LIKES };
  });
  return resultSave;
}

/** Function that do operations with the stocks, create those in case
 * aren't found in db or modify those if exist */
async function operationStocks({ currentClient, stock }: OperationStocks) {
  let resultSave; // Auxiliar to save the update of the stock
  const clientID = currentClient._id.toString(); // Id of current client
  const lStock = stock.toLowerCase();
  // Find the stock to consult
  const consultStock = await Stocks.findById({ _id: lStock })
    .populate("clients")
    .exec()
    .catch(err => {
      console.error(err);
      return { error: ERROR_STOCK.FINDING_STOCK };
    });

  // If the stock don't exist, create it
  if (consultStock === null) {
    const newStock = new Stocks({
      _id: stock.toLowerCase(),
      clients: [],
    });
    newStock.clients.push(currentClient); // Push the client who is consulting
    const isLikedStock = currentClient.liked.get(newStock._id);
    // Put likes to 1 if client liked it and save it
    if (typeof isLikedStock === "boolean" && isLikedStock) newStock.likes = 1;
    resultSave = await newStock.save().catch(err => {
      console.error(err);
      return { error: ERROR_STOCK.CREATING_STOCK };
    });
  } else {
    // If the stock exist and was an error, return the error
    if ("error" in consultStock) return consultStock;
    // If it's valid, we see if client is already in the stock
    let likes = 0; // Auxiliar to get the likes of the stock
    const existClient = consultStock.clients.filter(client => {
      const currentID = client._id.toString();
      return currentID === clientID;
    });
    // If the client is new, push it to the array
    if (existClient.length === 0) consultStock.clients.push(currentClient);

    // We get the likes of the stock
    consultStock.clients.map(client => {
      const isLikedStock = client.liked.get(consultStock._id);
      if (typeof isLikedStock === "boolean" && isLikedStock) likes++;
      return null;
    });
    consultStock.likes = likes;
    // And save the stock updated
    resultSave = await consultStock.save().catch(err => {
      console.error(err);
      return { error: ERROR_STOCK.UPDATE_STOCK };
    });
  }
  return resultSave;
}

/** Function to fetch the info from API and display the stock info that
 * user wants from it */
async function fetchInfo(resultStock: StockDocument) {
  // We need to replace the placeholder from the link
  const link = STOCK_API.replace("[symbol]", resultStock._id);
  const consult = await fetch(link) // Send a request to the API
    .then(response => response.json())
    .then((data: StockAPI) => {
      /** Translate response to json and then we got the data,
       * in data we get the 2 parameters we need to display, return
       * it to the main function */
      return data;
    })
    .catch(err => {
      console.error(err);
      return { error: ERROR_STOCK.FAIL_FETCH };
    });
  return consult;
}

/** ------------------------------------------------------------------------ */

const ERROR_BOARD = {
  COULD_NOT_FIND_BOARD:
    "We couldn't find the board you needed to make the operation, please try again later",
  COULD_NOT_SAVE_BOARD:
    "Couldn't save the board threads update in the required board, please try again later",
  COULD_NOT_DELETE_REPLY:
    "We couldn't delete the reply of the thread you wanted to delete, please try again later",
  COULD_NOT_FIND_REPLY:
    "We couldn't find the reply you needed to make the operation, please try again later",
  COULD_NOT_FIND_ID_REPLY:
    "The ID reply you introduce don't exist, revise that your ID is correct or exist",
  COULD_NOT_SAVE_REPLY:
    "Couldn't save the new reply in the required thread, please try again later",
  COULD_NOT_UPDATE_REPLY:
    "Couldn't update the reply information with your data, please try again later",
  COULD_NOT_DELETE_THREAD:
    "We couldn't delete the thread you needed, please try again later",
  COULD_NOT_FIND_THREAD:
    "We couldn't find the thread you wanted to make your operation, please try again later",
  COULD_NOT_FIND_ID_THREAD:
    "The ID thread you introduce don't exist, revise that your ID is correct or exist",
  COULD_NOT_SAVE_THREAD:
    "Couldn't save the new thread in the required board, please try again later",
  COULD_NOT_UPDATE_THREAD:
    "Couldn't update the thread information with your data, please try again later",
  EMPTY_BOARD:
    "There is not a board with the name you introduce, please post in a existent board or create a new one posting a thread on it",
  INCORRECT_PASSWORD:
    "The password you introduce to delete is incorrect, please revise if your password is the correct one",
};
const REPORT_THREAD_SUCCESS =
  "Your thread report was sucessfully sent to our servers";
const DELETE_THREAD_SUCCESS = "Your thread was sucessfully deleted";
const REPORT_REPLY_SUCCESS =
  "Your reply report was sucessfully sent to our servers";
const DELETE_REPLY_SUCCESS = "Your reply was sucessfully deleted";

/** Function that gets the top 10 most recent threads and their 3 most
 * recent replies, if nothing is found, return an empty array */
export async function getTopThreads(_id: string) {
  // First we find the board that user want to see
  const userBoard = await Board.findById({ _id })
    .populate({
      path: "threads",
      populate: { path: "replies" },
    })
    .exec()
    .catch(err => {
      console.error(err);
      return { error: ERROR_BOARD.COULD_NOT_FIND_BOARD };
    });
  // If we got an error while finding or we don't found a board, end function
  if (userBoard === null) return { error: ERROR_BOARD.EMPTY_BOARD };
  if ("error" in userBoard) return userBoard;
  else {
    // If we got a board, we need to order the threads by bumped_on time
    let orderThread = userBoard.threads.slice();
    if (orderThread.length > 1) {
      orderThread.sort((a, b) => {
        // Get 2 threads and start to order in Descendent
        if (a.bumped_on > b.bumped_on) return -1;
        if (a.bumped_on < b.bumped_on) return 1;
        return 0;
      });
      // If board has more than 10 threads, only get the first 10
      if (orderThread.length > 10) orderThread = orderThread.slice(0, 10);
    }

    /** Then we filter the keys we want to send to user and will order
     * the most 3 recent reply if thread has those, so for each thread */
    const displayInfo = orderThread.map(thread => {
      // Start an auxiliar with only the info needed
      const infoFiltered: IThreadFiltered = {
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: [],
        replycount: thread.replies.length,
      };
      let replySort = thread.replies.slice(); // Get replies and sort
      if (replySort.length > 1) {
        replySort.sort((a, b) => {
          // Get 2 replies and start to order in Descendent
          if (a.created_on > b.created_on) return -1;
          if (a.created_on < b.created_on) return 1;
          return 0;
        });
        // Only get the most 3 recent replies if there are more
        if (replySort.length > 3) replySort = replySort.slice(0, 3);
      }
      // Filter the info of each reply
      const replyInfo: IReplyFiltered[] = replySort.map(reply => ({
        _id: reply._id,
        created_on: reply.created_on,
        text: reply.text,
      }));
      // Assign the replies filtered to the thread and return the clean info
      infoFiltered.replies = replyInfo;
      return infoFiltered;
    });
    return displayInfo;
  }
}

export async function createNewThread({
  _id,
  text,
  deletePassword,
}: UserDataCreate) {
  // First we will get the board we are posting a thread for
  const userBoard = await Board.findById({ _id })
    .populate("threads")
    .exec()
    .catch(err => {
      console.error(err);
      return { error: ERROR_BOARD.COULD_NOT_FIND_BOARD };
    });

  let resultSaveThread; // Auxiliar to save the new thread
  // If the board don't exist, we will create it
  if (userBoard === null) {
    const newBoard = new Board({
      _id,
      threads: [],
    });
    resultSaveThread = await createThread({
      board: newBoard,
      text,
      deletePassword,
    });
    if ("error" in resultSaveThread) return resultSaveThread;
  } else {
    // If we had an error while finding the user board, return the error
    if ("error" in userBoard) return userBoard;
    // If it's a valid board, we create the thread
    resultSaveThread = await createThread({
      board: userBoard,
      text,
      deletePassword,
    });
    if ("error" in resultSaveThread) return resultSaveThread;
  }
  return resultSaveThread;
}

export async function reportThread(_id: string) {
  // First we get the thread by its ID to report it
  const thread = await Thread.findById({ _id }).catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_FIND_THREAD };
  });
  // If we got an error while finding or the thread don't exist, end the function
  if (thread === null) return { error: ERROR_BOARD.COULD_NOT_FIND_ID_THREAD };
  if ("error" in thread) return thread;
  // If we found it and it's valid, then report it
  thread.reported = true;
  const resultUpdate = await thread.save().catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_UPDATE_THREAD };
  });
  if ("error" in resultUpdate) return resultUpdate;
  return { action: REPORT_THREAD_SUCCESS };
}

export async function deleteThread({ _id, password }: DeleteElementBoard) {
  // First we get the thread by its ID to delete it
  const thread = await Thread.findById({ _id }).catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_FIND_THREAD };
  });
  // If we got an error while finding or the thread don't exist, end the function
  if (thread === null) return { error: ERROR_BOARD.COULD_NOT_FIND_ID_THREAD };
  if ("error" in thread) return thread;
  // If user gave the correct password, we delete it
  if (password === thread.delete_password) {
    // But 1st we need to delete all the replies of it
    if (thread.replies.length > 0) {
      const deleteReplies = await Reply.deleteMany({ thread_id: _id }).catch(
        err => {
          console.error(err);
          return { error: ERROR_BOARD.COULD_NOT_DELETE_REPLY };
        },
      );
      if ("error" in deleteReplies) return deleteReplies;
    }
    // Then we can delete the thread
    const deleteResult = await Thread.deleteOne({ _id }).catch(err => {
      console.error(err);
      return { error: ERROR_BOARD.COULD_NOT_DELETE_THREAD };
    });
    // If there was an error in deleting the thread, send it
    if ("error" in deleteResult) return deleteResult;
    // If it was successful, return the action
    return { action: DELETE_THREAD_SUCCESS };
  } else {
    // If password is incorrect, return an error
    return { error: ERROR_BOARD.INCORRECT_PASSWORD };
  }
}

export async function getAllReplies({ _idBoard, _idThread }: GetReplies) {
  // First, we find the board by its name
  const userBoard = await Board.findById({ _id: _idBoard })
    .populate({
      path: "threads", // Populate its thread
      select: {
        _id: 1, // Filtered
        text: 1,
        created_on: 1,
        bumped_on: 1,
        replies: 1,
      },
      populate: {
        path: "replies", // And populate the replies of the thread
        select: {
          _id: 1, // Filered
          text: 1,
          created_on: 1,
        },
      },
    })
    .exec()
    .catch(err => {
      console.error(err);
      return { error: ERROR_BOARD.COULD_NOT_FIND_BOARD };
    });
  // If the board wasn't found or it had an error while finding, end function
  if (userBoard === null) return { error: ERROR_BOARD.EMPTY_BOARD };
  if ("error" in userBoard) return userBoard;
  // If we have a valid board, we need to find the user thread
  const userThread = userBoard.threads.filter(
    thread => thread._id.toString() === _idThread,
  );
  // If the thread don't exist, return an error
  if (userThread.length === 0)
    return { error: ERROR_BOARD.COULD_NOT_FIND_ID_THREAD };
  const currentThread = userThread[0]; // Get user thread
  // We need to sort its replies if it has at least 2
  if (currentThread.replies.length > 1) {
    currentThread.replies.sort((a, b) => {
      // Get 2 replies and start to order in Descendent
      if (a.created_on > b.created_on) return -1;
      if (a.created_on < b.created_on) return 1;
      return 0;
    });
  }
  return currentThread;
}

export async function createNewReply({
  _id,
  text,
  deletePassword,
}: UserDataCreate) {
  // Find the thread by its ID to add a reply
  const userThread = await Thread.findById({ _id })
    .populate("replies")
    .exec()
    .catch(err => {
      console.error(err);
      return { error: ERROR_BOARD.COULD_NOT_FIND_THREAD };
    });
  // If the thread don't exist or we had an error while finding, return the error
  if (userThread === null)
    return { error: ERROR_BOARD.COULD_NOT_FIND_ID_THREAD };
  if ("error" in userThread) return userThread;
  // If the thread exist, create the reply and save it
  const newReply = new Reply({
    _id: new mongoose.Types.ObjectId(),
    thread_id: _id,
    text,
    delete_password: deletePassword,
    created_on: new Date().toISOString(),
  });
  const saveReply = await newReply.save().catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_SAVE_REPLY };
  });
  // If an error happened while saving, end function
  if ("error" in saveReply) return saveReply;
  userThread.replies.push(newReply); // Put the reply in the thread
  userThread.bumped_on = newReply.created_on; // And update the bumped_on info in thread
  // And save it, if an error happened, return the error
  const saveThread = await userThread.save().catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_SAVE_THREAD };
  });
  if ("error" in saveThread) return saveThread;
  // If all was successful, return the new reply
  return newReply;
}

export async function reportReply(_id: string) {
  // First we need to find the user reply that they want to report
  const userReply = await Reply.findById({ _id }).catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_FIND_REPLY };
  });
  // If reply don't exist or there was an error while finding, return the error
  if (userReply === null) return { error: ERROR_BOARD.COULD_NOT_FIND_ID_REPLY };
  if ("error" in userReply) return userReply;
  // If the reply exist, then update it and save it
  userReply.reported = true;
  const updateResult = await userReply.save().catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_UPDATE_REPLY };
  });
  // If there was an error while updating, return the error
  if ("error" in updateResult) return updateResult;
  return { action: REPORT_REPLY_SUCCESS }; // Return the success message
}

export async function deleteReply({ _id, password }: DeleteElementBoard) {
  // First we need to find the user reply that they want to delete
  const userReply = await Reply.findById({ _id }).catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_FIND_REPLY };
  });
  // If reply don't exist or there was an error while finding, return the error
  if (userReply === null) return { error: ERROR_BOARD.COULD_NOT_FIND_ID_REPLY };
  if ("error" in userReply) return userReply;
  // If the reply exist, verify if the password is correct
  if (userReply.delete_password === password) {
    // If it's the same then update the text and save it
    userReply.text = "[Deleted]";
    const deleteResult = await userReply.save().catch(err => {
      console.error(err);
      return { error: ERROR_BOARD.COULD_NOT_UPDATE_REPLY };
    });
    // If there was an error while deleting, return the error
    if ("error" in deleteResult) return deleteResult;
    return { action: DELETE_REPLY_SUCCESS }; // Return the success message
  } else {
    // If password is wrong, then return an error
    return { error: ERROR_BOARD.INCORRECT_PASSWORD };
  }
}

/** Function that creates threads for boards */
async function createThread({ board, text, deletePassword }: CreateThread) {
  const _id = new mongoose.Types.ObjectId(); // Create new id
  // Create the new thread with the data that user sent
  const newThread = new Thread({
    _id,
    text,
    delete_password: deletePassword,
    replies: [],
    created_on: new Date().toISOString(),
    bumped_on: new Date().toISOString(),
  });
  // Save the thread, if an error happened, return the error
  const saveThread = await newThread.save().catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_SAVE_THREAD };
  });
  if ("error" in saveThread) return saveThread;

  // We add the thread to the board if save was successful
  board.threads.push(saveThread);
  // Save the board and return the result of the thread
  const saveBoard = await board.save().catch(err => {
    console.error(err);
    return { error: ERROR_BOARD.COULD_NOT_SAVE_BOARD };
  });
  if ("error" in saveBoard) return saveBoard;
  // If both elements were successful at saving, return the thread
  return saveThread;
}
