import { Migration } from '@mikro-orm/migrations';

export class Migration20260208163738 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "workspaces" ("id" uuid not null, "tenant_id" text not null, "user_id" text not null, "name" text not null, "description" text null, "type" text check ("type" in ('Personal', 'Team', 'Classroom')) not null default 'Personal', "language" text check ("language" in ('EN', 'VI', 'ES', 'FR', 'DE', 'JA', 'KO', 'ZH')) not null, "learning_goal" text check ("learning_goal" in ('Vocabulary', 'ExamPrep', 'DailyPractice')) not null default 'Vocabulary', "level" text check ("level" in ('Beginner', 'Intermediate', 'Advanced')) not null default 'Beginner', "daily_target" int not null default 10, "study_reminder" boolean not null default false, "default_learning_mode" text check ("default_learning_mode" in ('Flashcard', 'Quiz', 'SpacedRepetition')) not null default 'Flashcard', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "workspaces_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "workspaces" cascade;`);
  }

}
