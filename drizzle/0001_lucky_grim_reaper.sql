CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "poster_asset_id" integer;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_poster_asset_id_assets_id_fk" FOREIGN KEY ("poster_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;