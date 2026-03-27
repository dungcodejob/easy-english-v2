import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsInt, Min } from 'class-validator';

export class ReviewCardRequestDto {
  @ApiProperty({
    enum: [1, 2, 3, 4],
    description: 'Again=1, Hard=2, Good=3, Easy=4',
  })
  @IsEnum([1, 2, 3, 4])
  rating!: 1 | 2 | 3 | 4;

  @ApiProperty({ description: 'Review duration in milliseconds' })
  @IsInt()
  @Min(0)
  reviewDurationMs!: number;
}
