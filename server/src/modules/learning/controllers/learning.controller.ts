import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { ITokenPayload } from '../../auth/domain/ports/token-generator.interface';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { AddToLearningCommand } from '../application/commands/add-to-learning.command';
import { RemoveFromLearningCommand } from '../application/commands/remove-from-learning.command';
import { AddToLearningRequestDto } from '../dto/requests/add-to-learning.request.dto';

@ApiTags('Learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'learning' })
export class LearningController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('senses')
  @ApiOperation({ summary: 'Add a WordSense to the learning list' })
  @ApiResponse({
    status: 201,
    description: 'WordSense added to learning list successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addToLearning(
    @Body() dto: AddToLearningRequestDto,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new AddToLearningCommand(user.userId, dto.wordSenseId);

    const result = await this.commandBus.execute<
      AddToLearningCommand,
      { id: string; alreadyLearning: boolean }
    >(command);

    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Delete('senses/:senseId')
  @ApiOperation({ summary: 'Remove a WordSense from the learning list' })
  @ApiParam({
    name: 'senseId',
    required: true,
    description: 'ID of the WordSense to remove',
  })
  @ApiResponse({
    status: 200,
    description: 'WordSense removed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeFromLearning(
    @Param('senseId') senseId: string,
    @CurrentUser() user: ITokenPayload,
  ) {
    const command = new RemoveFromLearningCommand(user.userId, senseId);

    const result = await this.commandBus.execute<
      RemoveFromLearningCommand,
      { success: boolean; wasLearning: boolean }
    >(command);

    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
