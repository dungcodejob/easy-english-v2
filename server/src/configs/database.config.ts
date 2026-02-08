import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import 'dotenv/config';

const databaseConfig = defineConfig({
  driver: PostgreSqlDriver,

  clientUrl: process.env.DATABASE_URL,

  entities: ['./dist/**/*.orm-entity.js'],
  entitiesTs: ['./src/**/*.orm-entity.ts'],
  migrations: {
    path: './src/migrations',
    glob: '!(*.d).{js,ts}',
  },
  metadataProvider: TsMorphMetadataProvider,
});

export default databaseConfig;
