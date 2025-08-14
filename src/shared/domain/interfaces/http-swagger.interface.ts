import { type ApiOperationOptions, type ApiResponseOptions } from '@nestjs/swagger';

export interface IHttpSwagger {
  apiOperation: ApiOperationOptions;
  apiResponse: ApiResponseOptions;
}
