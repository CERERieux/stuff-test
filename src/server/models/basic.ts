import mongoose from "mongoose"; // Import mongoose to be able to use the models and manage our database
import dns from "node:dns"; // We need "dns" to verify if user hostname exist
import { nanoid } from "nanoid"; // NanoID to make the short URL in an easier way
import { Url, ExTracker, ERROR_EXERCISE, ERROR_URL } from "../schemas/basic";
import type {
  IShortenerUrl,
  ValidUrlReq,
  ValidExtension,
  IExTracker,
  ExerciseElements,
  LogOptions,
  UrlMaterial,
  CreateUrlMaterial,
} from "../types/basic";
import { GUser, ERROR_GUSER } from "../schemas/global";

const dnsPromises = dns.promises;

export async function createShortURL({ url, username }: UrlMaterial) {
  // If user didn't sent an URL in the form, we end the function
  if (url === "") {
    return ERROR_URL.EMPTY_URL;
  }
  // If the url don't have the format http(s)://hostname.com, we end the function
  const urlToCheck = url.split("/");
  if (urlToCheck.length < 3) {
    return ERROR_URL.INVALID_FORMAT;
  }
  // Object to configure the lookup function
  const options = {
    family: 6, // Family to search for IPv6
    hints: dns.ADDRCONFIG | dns.V4MAPPED, // And search for addresses IPv6 and IPv4
  };

  // To get our new short URL we look up if the hostname exist
  const newURL = await dnsPromises
    .lookup(urlToCheck[2], options)
    .then(async () => {
      // If there wasn't an error, we create the short URL, we need an auxiliar to do so
      let validatingURL = false;
      // We will create a new extension until is a valid one
      let newExtension = nanoid(8);
      do {
        const validExtension = await createUrlDB({
          newExtension,
          url,
          username,
        }); // Save result in DB
        // If there was an error in the process, display it
        if ("error" in validExtension) {
          return validExtension.error;
        }
        // If we had a duplicate, we need keep validating the url
        if (!validExtension.valid) {
          validatingURL = true;
          newExtension = nanoid(8);
        } else {
          // If we had a valid URL, stop verifying
          validatingURL = false;
        }
      } while (validatingURL);
      return newExtension;
    })
    .catch(err => {
      // If there was an error while looking up for the hostname, we send an error as result
      console.error(err);
      return ERROR_URL.LOOKUP;
    });

  return newURL;
}

async function createUrlDB({ newExtension, url, username }: CreateUrlMaterial) {
  // First we check if the new extension already is used
  const query = await Url.find({ shortUrl: newExtension })
    .exec()
    .then(data => {
      if (data.length === 0) return true;
      return false;
    })
    .catch(err => {
      console.error(err);
      return { error: ERROR_URL.COULD_NOT_FIND };
    });
  // If we had an error while finding, end the function
  if (typeof query !== "boolean") {
    return query;
  }
  // If it free, then we create the new short URL to save it
  if (query) {
    const newValidExtension: ValidExtension = {
      valid: true,
      newExtension,
    };
    const newUserUrl = new Url({
      username,
      shortUrl: newExtension,
      originalUrl: url,
    });
    // Save new URL
    const resultSave = await newUserUrl.save().catch(err => {
      console.error(err);
      return { error: ERROR_URL.COULD_NOT_SAVE };
    });
    if ("error" in resultSave) {
      return resultSave;
    }

    // Then we add the new url to the user if they exist
    if (username !== (process.env.DUMP_USER as string)) {
      // Return an error if user was not found or there was an error in the search
      const user = await GUser.findById(username).catch(err => {
        console.error(err);
        return { error: ERROR_GUSER.COULD_NOT_FIND };
      });
      if (user == null) {
        return {
          error: ERROR_GUSER.USER_NOT_FOUND,
        };
      }
      if ("error" in user) {
        return user;
      }
      user.shortUrl.push(newUserUrl); // Push new url to user and save user
      const userSave = await user.save().catch(err => {
        console.error(err);
        return { error: ERROR_GUSER.COULD_NOT_SAVE };
      });
      // If there was an error while saving, send it
      if ("error" in userSave) return userSave;
    }
    return newValidExtension; // Return the new extension and if it was valid
  } else {
    // If extension is used, then we send a "signal" to the model so it keeps trying
    const invalidExtension: ValidExtension = {
      valid: false,
      newExtension,
    };
    return invalidExtension;
  }
}

export async function canRedirectURL(shortUrl: string) {
  // Find the users link
  const isValidReq: ValidUrlReq = await Url.find({ shortUrl })
    .exec()
    .then((data: IShortenerUrl[]) => {
      // If the link don't exist
      if (data.length === 0) {
        const response = {
          isValid: false, // We send an error pointing this problem
          original_url: ERROR_URL.URL_NOT_EXIST,
        };
        return response;
      } else {
        // If the link exist, we send the original users url
        const response = {
          isValid: true,
          original_url: data[0].originalUrl,
        };
        return response;
      }
    })
    .catch(err => {
      console.error(err);
      return { isValid: false, original_url: ERROR_URL.COULD_NOT_FIND };
    });
  return isValidReq;
}

/** ---------------------------------------------------------------- */

export async function createNewExercise({
  _id,
  description,
  duration,
  date,
}: ExerciseElements) {
  // Find user by Id, if not found, we send an error
  const user = await GUser.findById(_id).catch(err => {
    console.error(err);
    return { error: ERROR_GUSER.COULD_NOT_FIND };
  });
  if (user == null) {
    return {
      error: ERROR_GUSER.USER_NOT_FOUND,
    };
  }
  if ("error" in user) {
    return user;
  }
  // If we found the user, create a new exercise with the elements needed
  const newExercise = new ExTracker({
    _id: new mongoose.Types.ObjectId(),
    username: user._id,
    description,
    duration,
    date,
  });

  const resultSave = await newExercise.save().catch(err => {
    console.error(err);
    return { error: ERROR_EXERCISE.PROBLEM_POST };
  }); // Save it
  if ("error" in resultSave) {
    return resultSave;
  }
  user.exercises.push(newExercise); // Push it to the user's log
  // Save the modifications, then we return an object that display the new info
  const result = await user
    .save()
    .then(u => {
      return {
        username: u._id,
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date,
        _id: newExercise._id,
      };
    })
    .catch(err => {
      console.error(err);
      return { error: ERROR_EXERCISE.PROBLEM_UPDATE_USER };
    });

  return result;
}

export async function displayUserLog({ from, to, limit, _id }: LogOptions) {
  // Find user by it's ID and populate the user's log, if doesn't exist, send an error
  const user = await GUser.findById(_id)
    .populate({ path: "exercises", select: "description duration date _id" })
    .exec()
    .catch(err => {
      console.error(err);
      return { error: ERROR_GUSER.COULD_NOT_FIND };
    });
  if (user == null) {
    return {
      error: ERROR_GUSER.USER_NOT_FOUND,
    };
  }
  if ("error" in user) {
    return user;
  }
  // If we found the user, we filter the info from the logs, we only filter the ID of each activity
  let orderLog: Array<Partial<IExTracker>> = user.exercises.map(exercise => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id: exercise._id,
    };
  });
  // Once we get our logs clean, we filter in case user sent queries in the request
  // Do the next 2 filters if there is at least 1 exercise
  if (orderLog.length > 0) {
    // Filter after a specific date
    if (from !== undefined) {
      orderLog = orderLog.filter(log => {
        const date = new Date(log.date as string).getTime();
        const filter = new Date(from).getTime();
        if (date > filter) return true;
        return false;
      });
    }
    // Filter before a specific date
    if (to !== undefined) {
      orderLog = orderLog.filter(log => {
        const date = new Date(log.date as string).getTime();
        const filter = new Date(to).getTime();
        if (date < filter) return true;
        return false;
      });
    }
  }

  // Filter the number of activities in log
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    orderLog = orderLog.slice(0, limitNum);
  }

  // Create the result in order
  const orderResult = {
    username: user._id,
    count: user.exercises.length,
    log: orderLog,
  };
  return orderResult;
}

export async function deleteExercise(_id: string) {
  // If id isn't valid or exercise isn't found, return an error
  if (_id.length !== 24) {
    return { error: ERROR_EXERCISE.ID_FORMAT };
  }

  const exercise = await ExTracker.findById(_id).catch(err => {
    console.error(err);
    return { error: ERROR_EXERCISE.COULD_NOT_FIND_EX };
  });
  if (exercise == null) {
    return { error: ERROR_EXERCISE.EXERCISE_NOT_FOUND };
  }
  if ("error" in exercise) {
    return exercise;
  }

  // Get the user because later we need to decrement the count of their exercises
  const user = await GUser.findById(exercise.username).catch(err => {
    console.error(err);
    return { error: ERROR_GUSER.COULD_NOT_FIND };
  });
  if (user == null) {
    return { error: ERROR_GUSER.USER_NOT_FOUND };
  }
  if ("error" in user) {
    return user;
  }

  // Delete the exercise
  const deletedExercises = await ExTracker.deleteOne({ _id })
    .then(deleted => {
      return deleted.deletedCount;
    })
    .catch(err => {
      console.error(err);
      return -1;
    });
  if (deletedExercises === -1) {
    return { error: ERROR_EXERCISE.PROBLEM_DELETE };
  }

  // Remove the exercise from the user
  user.exercises = user.exercises.filter(ex => ex._id.toString() !== _id);
  user.save().catch(err => {
    console.error(err);
    return { error: ERROR_EXERCISE.PROBLEM_DELETE };
  });
  const resultAction = {
    action: `The exercise ${_id} was sucessfully deleted.`,
  };
  // Return an object with the confirmation that exercise was deleted
  return resultAction;
}
