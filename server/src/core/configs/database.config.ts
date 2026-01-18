import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver, defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import * as dotenv from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${NODE_ENV}` });

export const databaseConfig = defineConfig({
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  entities: ['dist/core/database/entities/**/*.entity.js'],
  entitiesTs: ['src/core/database/entities/**/*.entity.ts'],
  debug: false,
  highlighter: new SqlHighlighter(),
  extensions: [Migrator, SeedManager],

  migrations: {
    path: 'dist/core/database/migrations',
    pathTs: 'src/core/database/migrations',
  },
  seeder: {
    path: 'dist/core/database/seeders',
    pathTs: 'src/core/database/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
  },
});

export default databaseConfig;
