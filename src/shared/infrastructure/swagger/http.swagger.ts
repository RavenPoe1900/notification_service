import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export interface IHttpSwagger {
  apiOperation: ApiOperationOptions;
  apiResponse: ApiResponseOptions;
}

export function createSwagger(dto: any, tag: string): IHttpSwagger {
  return {
    apiOperation: {
      summary: `Create a new ${tag}`,
      description: `Endpoint to create a new ${tag.toLowerCase()}.`,
      tags: [tag],
    },
    apiResponse: {
      status: 201,
      description: `${tag} created successfully`,
      type: dto,
    },
  };
}

export function findSwagger(dto: any, tag: string): IHttpSwagger {
  return {
    apiOperation: {
      summary: `Retrieve ${tag}`,
      description: `Endpoint to retrieve ${tag.toLowerCase()} details or list.`,
      tags: [tag],
    },
    apiResponse: {
      status: 200,
      description: `${tag} retrieved successfully`,
      type: dto,
    },
  };
}

export function updateSwagger(dto: any, tag: string): IHttpSwagger {
  return {
    apiOperation: {
      summary: `Update ${tag}`,
      description: `Endpoint to update an existing ${tag.toLowerCase()}.`,
      tags: [tag],
    },
    apiResponse: {
      status: 200,
      description: `${tag} updated successfully`,
      type: dto,
    },
  };
}

export function deleteSwagger(dto: any, tag: string): IHttpSwagger {
  return {
    apiOperation: {
      summary: `Delete ${tag}`,
      description: `Endpoint to delete an existing ${tag.toLowerCase()}.`,
      tags: [tag],
    },
    apiResponse: {
      status: 204,
      description: `${tag} deleted successfully`,
      type: dto,
    },
  };
}
