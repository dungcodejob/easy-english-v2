import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';

import { ITokenHasher } from '../../application/ports/token-hasher.interface';

@Injectable()
export class Sha256TokenHasherService implements ITokenHasher {
  hash(token: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    return Promise.resolve(hash);
  }

  async compare(token: string, hashed: string): Promise<boolean> {
    const candidateHash = await this.hash(token);
    // Use timingSafeEqual to prevent timing attacks
    // But timingSafeEqual requires Buffers of equal length
    // Since we are comparing hex strings of same algorithm, length should be same.
    const candidateBuffer = Buffer.from(candidateHash);
    const targetBuffer = Buffer.from(hashed);

    if (candidateBuffer.length !== targetBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateBuffer, targetBuffer);
  }
}
