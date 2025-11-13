ALTER TABLE "orders" DROP CONSTRAINT "orders_showtime_id_showtimes_id_fk";
--> statement-breakpoint
ALTER TABLE "showtimes" DROP CONSTRAINT "showtimes_movie_id_movies_id_fk";
--> statement-breakpoint
ALTER TABLE "showtimes" DROP CONSTRAINT "showtimes_theater_id_theaters_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_showtime_id_showtimes_id_fk" FOREIGN KEY ("showtime_id") REFERENCES "public"."showtimes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_theater_id_theaters_id_fk" FOREIGN KEY ("theater_id") REFERENCES "public"."theaters"("id") ON DELETE cascade ON UPDATE no action;