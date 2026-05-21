import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any) {
    // Return the user if authentication succeeds.
    // If it fails (e.g., token missing, expired, or invalid), return null instead of throwing.
    if (err || !user) {
      return null;
    }

    return user;
  }
}
