import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import 'dotenv/config';

export default defineConfig({
  driver: PostgreSqlDriver,
  dbName: process.env.DB_NAME || 'easy_english',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  entities: ['./dist/**/*.orm-entity.js'],
  entitiesTs: ['./src/**/*.orm-entity.ts'],
  migrations: {
    path: './src/migrations',
    glob: '!(*.d).{js,ts}',
  },
  metadataProvider: TsMorphMetadataProvider,
});
