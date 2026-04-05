import { ApiProperty } from '@nestjs/swagger';

export class CompleteStudySessionRequestDto {
  @ApiProperty({
    description: 'Placeholder — sessionId comes from route param',
  })
  readonly _?: never;
}
