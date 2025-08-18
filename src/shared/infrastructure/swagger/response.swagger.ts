import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { type IHttpSwagger } from 'src/shared/domain/interfaces/http-swagger.interface';

export const ApiResponseSwagger = (httpSwagger: IHttpSwagger) => {
  return applyDecorators(
    ApiOperation(httpSwagger.apiOperation),
    ApiResponse(httpSwagger.apiResponse),
    ApiResponse({
      status: 400,
      description: 'Bad Request: Request was malformed',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized: Credentials missing or invalid',
    }),
    ApiResponse({
      status: 500,
      description:
        'Server Error: An internal server error occurred processing the request',
    }),
  );
};
