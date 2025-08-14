import { type Type } from '@nestjs/common';

export function createSwagger<TModel extends Type<any>>(
  model: TModel,
  text: string,
) {
  return {
    apiOperation: { summary: `Create ${text}` },
    apiResponse: {
      status: 200,
      description: `Return ${text}`,
      type: model,
    },
  };
}

export function findSwagger<TModel extends Type<any>>(
  model: TModel,
  text: string,
) {
  return {
    apiOperation: { summary: `List ${text}` },
    apiResponse: {
      status: 200,
      description: `Returns a ${text} List`,
      type: model,
      isArray: true,
    },
  };
}

export function findOneSwagger<TModel extends Type<any>>(
  model: TModel,
  text: string,
) {
  return {
    apiOperation: {
      summary: text === 'verify' || text === 'otp' ? `Find One ${text}` : text,
    },
    apiResponse: {
      status: 200,
      description: `Return ${text}`,
      type: model,
    },
  };
}

export function updateSwagger<TModel extends Type<any>>(
  model: TModel,
  text: string,
) {
  return {
    apiOperation: { summary: `Update ${text}` },
    apiResponse: {
      status: 200,
      description: `Return ${text}`,
      type: model,
    },
  };
}

export function deleteSwagger<TModel extends Type<any>>(
  model: TModel,
  text: string,
) {
  return {
    apiOperation: { summary: `Delete ${text}` },
    apiResponse: {
      status: 200,
      description: `Return ${text}`,
      type: model,
    },
  };
}

export function averageSwagger<TModel extends Type<any>>(
  model: TModel,
  text: string,
) {
  return {
    apiOperation: { summary: `Return average ${text}` },
    apiResponse: {
      status: 200,
      description: `Return ${text}`,
      type: model,
    },
  };
}

export function genericSwagger<TModel extends Type<any>>(
  model: TModel,
  summary: string,
  description: string,
) {
  return {
    apiOperation: { summary: summary },
    apiResponse: {
      status: 200,
      description: description,
      type: model,
    },
  };
}
