import  { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../../constants/httpConstants";
import * as loanServices from "../services/loanServices";
import type { Loan } from "../models/loanModel";
import { successResponse } from "../models/responseModel";