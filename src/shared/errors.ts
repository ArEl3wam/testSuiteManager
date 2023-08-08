class HttpError extends Error {
    status?: number
}

export class NotFoundError extends HttpError {
    status: number = 404;
    constructor(msg: string) {
        super(msg)
    }
}

export class LinkingResourcesError extends HttpError {
    status = 400
    constructor(msg: string) {
        super(msg)
    }
}

export class AppError extends Error {
  status: Number;

  constructor(message: string, statusCode: Number) {
    super(message);
    this.status = statusCode;
  }
}