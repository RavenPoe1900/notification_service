import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export interface IHttpSwagger {
  apiOperation: ApiOperationOptions;
  apiResponse: ApiResponseOptions;
}
