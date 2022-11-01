import { Request } from "express";

export interface AuthentifiedRequest extends Request {
  user: {
    email: string;
    userId: string;
    firstName: string;
    lastName: string;
  };
}
