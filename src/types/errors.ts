export enum Responses {
    OK = 200,
    NOT_VERIFIED = 201,
    INVALID_CREDENTIALS = 202,
    DUPLICATED_ACCOUNT = 203,
    TOKEN_EXPIRED = 204,
    WAITING_TO_ACCEPT = 205,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
};

export class ErrorResponse extends Error {
    status: Responses;

    constructor(status: Responses, message: string) {
        super(message);
        this.name = 'ErrorResponse';
        this.status = status;
    }
}