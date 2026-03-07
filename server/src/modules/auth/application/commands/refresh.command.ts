import { ICommand } from '@nestjs/cqrs';

export interface RefreshCommandProps {
  readonly refreshToken: string;
}

export class RefreshCommand implements ICommand {
  constructor(public readonly props: RefreshCommandProps) {}
}
