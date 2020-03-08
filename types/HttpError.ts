export type HttpError =
  | {
      statusCode: number;
      message: string;
    }
  | {
      statusCode: 422 | 400;
      message: string;
      errors: string[];
    };
