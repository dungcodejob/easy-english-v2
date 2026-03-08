import { ApiProperty } from '@nestjs/swagger';

export class MetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  itemCount!: number;

  @ApiProperty()
  pageCount!: number;

  @ApiProperty()
  hasPreviousPage!: boolean;

  @ApiProperty()
  hasNextPage!: boolean;
}

export class TopicDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date;
}

export class TopicWordDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  topicId!: string;

  @ApiProperty({ format: 'uuid' })
  wordSenseId!: string;

  @ApiProperty({ enum: ['NEW', 'LEARNING', 'MASTERED'] })
  status!: string;

  @ApiProperty({ format: 'date-time' })
  addedAt!: Date;
}
