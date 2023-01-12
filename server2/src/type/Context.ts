import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface Context {
  req: Request;
  res: Response;
  user?: JwtPayload;
}
