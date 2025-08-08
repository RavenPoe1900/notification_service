import { Injectable } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@Injectable()
export abstract class BaseMapper<TSource, TDestination> {
  constructor(@InjectMapper() protected readonly mapper: Mapper) {}

  protected map(source: TSource): TDestination {
    return this.mapper.map(source, this.getSourceType(), this.getDestinationType());
  }

  protected mapArray(sources: TSource[]): TDestination[] {
    return this.mapper.mapArray(sources, this.getSourceType(), this.getDestinationType());
  }

  protected abstract getSourceType(): string;
  protected abstract getDestinationType(): string;
} 