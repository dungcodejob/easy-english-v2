import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsIn, Min, Max } from 'class-validator';

export class ReviewWordRequestDto {
  @ApiProperty({
    description: 'Review rating: 1=Again, 2=Hard, 3=Good, 4=Easy',
    example: 3,
    minimum: 1,
    maximum: 4,
  })
  @IsInt()
  @IsIn([1, 2, 3, 4])
  rating!: 1 | 2 | 3 | 4;

  @ApiProperty({
    description: 'Time spent on this review in milliseconds',
    example: 3500,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Max(60000)
  reviewDurationMs!: number;
}
