import { NextFunction, Request, Response } from "express";

declare type RuidOptions = {
  /**
   * To add or not the response header. Default: true
   */
  setHeader?: Boolean;

  /**
   * Specify the response header name. Default: 'request-id'
   */
  header?: string;

  /**
   * Specify the attribute name to set the request id into to Express req object. Default: 'rid'
   */
  attribute?: string;

  /**
   * To set or not the request id into the Http Context. Default: false
   */
  setInContext?: Boolean;

  /**
   * To specify custom prefix part of the request id string.
   * Can be a const string or a no-param function returning string.
   * Default: '<process-pid>@<machine-hostname>'
   */
  prefixRoot?: string | (() => string);

  /**
   * To set custom separator between prefix and unique part of the request id string. Default: '/'
   */
  prefixSeparator?: string;

  /**
   * Number of bytes to generate the unique part of the riquest id. Default: 12
   */
  upBytes?: integer;

  /**
   * To set custom separator between the unique part and the sequene number of the request id string. Default: '-'
   */
  idSeparator?: string;

  /**
   * The max number for the sequence number in the request id string. Default: Number.MAX_SAFE_INTEGER
   */
  idMax?: number;
}

/**
 * 
 * @param {RuidOptions} opts options for ruid middleware generation.
 */
declare function _exports({
  setHeader = true,
  header = 'request-id',
  attribute = 'rid',
  setInContext = false,
  prefixRoot = `${pid}@${hostname}`,
  prefixSeparator = '/',
  upBytes = 12,
  idSeparator = '-',
  idMax = Number.MAX_SAFE_INTEGER,
}: RuidOptions): (req: Request, res: Response, next: NextFunction) => void;

export = _exports;
export { RuidOptions };

