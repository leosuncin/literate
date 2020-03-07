export type HttpError =
  | {
      statusCode: number;
      message: string;
    }
  | {
      statusCode: 422;
      message: string;
      errors: string[];
    };
