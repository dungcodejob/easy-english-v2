import { SetMetadata } from '@nestjs/common';

import { METADATA_KEY } from '@shared/constants';

export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);
