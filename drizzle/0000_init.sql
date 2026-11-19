CREATE TABLE "active_tests" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid NOT NULL,
	"qid" text NOT NULL,
	"correct" boolean NOT NULL,
	"answer" jsonb,
	"ms" integer DEFAULT 0 NOT NULL,
	"mode" text NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"user_id" uuid NOT NULL,
	"qid" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_user_id_qid_pk" PRIMARY KEY("user_id","qid")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"user_id" uuid NOT NULL,
	"id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"modules" jsonb NOT NULL,
	"score_rw" integer,
	"score_math" integer,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tests_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hca_sub" text NOT NULL,
	"email" text,
	"name" text,
	"slack_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_hca_sub_unique" UNIQUE("hca_sub")
);
--> statement-breakpoint
ALTER TABLE "active_tests" ADD CONSTRAINT "active_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempts_user_ts_idx" ON "attempts" USING btree ("user_id","ts");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tests_user_ts_idx" ON "tests" USING btree ("user_id","ts");