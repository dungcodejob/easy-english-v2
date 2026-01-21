import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T = any> {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  result?: T;

  @ApiProperty()
  timestamp!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  method!: string;

  @ApiProperty({ required: false })
  errorCode?: string;
}
