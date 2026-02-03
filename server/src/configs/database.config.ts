import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ENV_KEY } from '@shared/constants';
import 'dotenv/config';

const databaseConfig = defineConfig({
  driver: PostgreSqlDriver,

  clientUrl: process.env[ENV_KEY.DATABASE_URL],

  entities: ['./dist/**/*.orm-entity.js'],
  entitiesTs: ['./src/**/*.orm-entity.ts'],
  migrations: {
    path: './src/migrations',
    glob: '!(*.d).{js,ts}',
  },
  metadataProvider: TsMorphMetadataProvider,
});

export default databaseConfig;
