import * as AdvancedMiscModel from "../models/advancedMisc";
import type { Request, Response } from "express";
import type {
  ReqParamBoard,
  ReqReportThread,
  ReqThreadBody,
  ReqDeleteThread,
  ReqStockQuery,
  ReqQueryReply,
  ReqCreateReplyBody,
  ReqReportReply,
  ReqDeleteReply,
} from "../types/advancedMisc";
import { ERROR_STOCK, ERROR_BOARD } from "../schemas/advancedMisc";
import { miscError } from "./error";
import { ERROR_GUSER } from "../schemas/global";

export async function consultStock(
  req: Request<{}, {}, {}, ReqStockQuery>,
  res: Response,
) {
  const _id = req._id;
  const { stock, like } = req.query;
  if (stock === undefined || like === undefined)
    return res.status(400).json({ error: ERROR_STOCK.MISSING_ELEMENTS });
  const resultStock = await AdvancedMiscModel.consultStock({
    stock,
    like,
    _id,
  });
  if ("error" in resultStock) {
    const status = miscError(resultStock);
    return res.status(status).json(resultStock);
  }
  return res.status(200).json(resultStock);
}

/** ------------------------------------------------------------------------ */

export async function getAllBoards(req: Request, res: Response) {
  const resultQuery = await AdvancedMiscModel.getAllBoards();
  if ("error" in resultQuery) {
    const status = miscError(resultQuery);
    return res.status(status).json(resultQuery);
  }
  return res.status(200).json(resultQuery);
}

export async function deleteBoard(
  req: Request<ReqParamBoard, {}, {}, {}>,
  res: Response,
) {
  const { _id } = req;
  if (_id !== process.env.ADMIN)
    return res
      .status(401)
      .json({ error: ERROR_GUSER.NOT_ADMIN, category: "guser" });
  const { board } = req.params;
  const resultDelete = await AdvancedMiscModel.deleteBoard(board);
  if ("error" in resultDelete && resultDelete.action === undefined) {
    const status = miscError(resultDelete);
    return res.status(status).json(resultDelete);
  }
  return res.status(200).json(resultDelete);
}

export async function getTopThreads(req: Request, res: Response) {
  const _id = req.params.board.toLowerCase();
  const resultThreads = await AdvancedMiscModel.getTopThreads(_id);
  if ("error" in resultThreads) {
    const status = miscError(resultThreads);
    return res.status(status).json(resultThreads);
  }
  return res.status(200).json(resultThreads);
}

export async function createNewThread(
  req: Request<ReqParamBoard, {}, ReqThreadBody, {}>,
  res: Response,
) {
  const _id = req.body.board ?? req.params.board;
  const text = req.body.text;
  const deletePassword = req.body.delete_password;
  if (text == null || deletePassword == null)
    return res.status(400).json({ error: ERROR_BOARD.MISSING_ELEMENT });
  else {
    const resultCreate = await AdvancedMiscModel.createNewThread({
      _id: _id.toLowerCase(),
      text,
      deletePassword,
    });
    if ("error" in resultCreate) {
      const status = miscError(resultCreate);
      return res.status(status).json(resultCreate);
    }
    return res.status(200).json(resultCreate);
  }
}

export async function reportThread(
  req: Request<ReqParamBoard, {}, ReqReportThread, {}>,
  res: Response,
) {
  const _id = req.body.thread_id;
  if (_id == null)
    return res.status(400).json({ error: ERROR_BOARD.MISSING_ELEMENT });
  else if (_id.length !== 24)
    return res.status(400).json({ error: ERROR_BOARD.INVALID_FORMAT });
  else {
    const resultReport = await AdvancedMiscModel.reportThread(_id);
    if ("error" in resultReport) {
      const status = miscError(resultReport);
      return res.status(status).json(resultReport);
    }
    return res.status(200).json(resultReport);
  }
}

export async function deleteThread(
  req: Request<ReqParamBoard, {}, {}, ReqDeleteThread>,
  res: Response,
) {
  const { board } = req.params;
  const deletePassword = req.query.password;
  const _id = req.query.thread_id;
  if (_id == null || deletePassword == null)
    return res.status(400).json({ error: ERROR_BOARD.MISSING_ELEMENT });
  else if (_id.length !== 24)
    return res.status(400).json({ error: ERROR_BOARD.INVALID_FORMAT });
  else {
    const resultDelete = await AdvancedMiscModel.deleteThread({
      board,
      _id,
      password: deletePassword,
    });
    if ("error" in resultDelete) {
      const status = miscError(resultDelete);
      return res.status(status).json(resultDelete);
    }
    return res.status(200).json(resultDelete);
  }
}

export async function getAllReplies(
  req: Request<ReqParamBoard, {}, {}, ReqQueryReply>,
  res: Response,
) {
  const _idBoard = req.params.board;
  const _idThread = req.query.thread_id;
  if (_idThread == null)
    return res.status(400).json({ error: ERROR_BOARD.MISSING_ELEMENT });
  else if (_idThread.length !== 24)
    return res.status(400).json({ error: ERROR_BOARD.INVALID_FORMAT });
  else {
    const resultQuery = await AdvancedMiscModel.getAllReplies({
      _idBoard,
      _idThread,
    });
    if ("error" in resultQuery) {
      const status = miscError(resultQuery);
      return res.status(status).json(resultQuery);
    }
    return res.status(200).json(resultQuery);
  }
}

export async function createNewReply(
  req: Request<ReqParamBoard, {}, ReqCreateReplyBody, {}>,
  res: Response,
) {
  const _id = req.body.id_thread;
  const text = req.body.text;
  const deletePassword = req.body.delete_password;
  if (_id == null || text == null || deletePassword == null)
    return res.status(400).json({ error: ERROR_BOARD.MISSING_ELEMENT });
  else if (_id.length !== 24)
    return res.status(40).json({ error: ERROR_BOARD.INVALID_FORMAT });
  else {
    const resultCreate = await AdvancedMiscModel.createNewReply({
      _id,
      text,
      deletePassword,
    });
    if ("error" in resultCreate) {
      const status = miscError(resultCreate);
      return res.status(status).json(resultCreate);
    }
    return res.status(200).json(resultCreate);
  }
}

export async function reportReply(
  req: Request<ReqParamBoard, {}, ReqReportReply, {}>,
  res: Response,
) {
  const _id = req.body.reply_id;
  if (_id == null)
    return res.status(400).json({ error: ERROR_BOARD.MISSING_ELEMENT });
  else if (_id.length !== 24)
    return res.status(400).json({ error: ERROR_BOARD.INVALID_FORMAT });
  else {
    const resultReport = await AdvancedMiscModel.reportReply(_id);
    if ("error" in resultReport) {
      const status = miscError(resultReport);
      return res.status(status).json(resultReport);
    }
    return res.status(200).json(resultReport);
  }
}

export async function deleteReply(
  req: Request<ReqParamBoard, {}, {}, ReqDeleteReply>,
  res: Response,
) {
  const { board } = req.params;
  const deletePassword = req.query.password;
  const _id = req.query.reply_id;
  if (_id == null || deletePassword == null)
    return res.status(400).json({ error: ERROR_BOARD.MISSING_ELEMENT });
  else if (_id.length !== 24)
    return res.status(400).json({ error: ERROR_BOARD.INVALID_FORMAT });
  else {
    const resultDelete = await AdvancedMiscModel.deleteReply({
      board,
      _id,
      password: deletePassword,
    });
    if ("error" in resultDelete) {
      const status = miscError(resultDelete);
      return res.status(status).json(resultDelete);
    }
    return res.status(200).json(resultDelete);
  }
}
