import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

export abstract class BaseMapper<S, D> {
  constructor(@InjectMapper() protected readonly mapper: Mapper) {}

  protected abstract getSourceType(): string;
  protected abstract getDestinationType(): string;

  protected map(entity: S): D {
    return this.mapper.map(
      entity,
      this.getSourceType(),        
      this.getDestinationType(),
    );
  }

  protected mapArray(entities: S[]): D[] {
    return this.mapper.mapArray(
      entities,
      this.getSourceType(),
      this.getDestinationType(),     
    );
  }
}