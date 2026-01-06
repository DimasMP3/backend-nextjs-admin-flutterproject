import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

type IdRow = { id: number };

// Base date: 2026-01-06
const BASE_DATE = new Date('2026-01-06T00:00:00+07:00');

function createShowtime(dayOffset: number, hour: number, minute: number = 0): string {
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

async function main() {
  // Clean tables in FK-safe order
  await sql`DELETE FROM payments;`;
  await sql`DELETE FROM orders;`;
  await sql`DELETE FROM showtimes;`;
  await sql`DELETE FROM movies;`;
  await sql`DELETE FROM theaters;`;
  await sql`DELETE FROM users;`;
  await sql`DELETE FROM fun_items;`;
  await sql`DELETE FROM assets;`;

  // Seed assets from Flutter images (posters)
  const base = join(process.cwd(), '..', 'projek-mobile-pro', 'assets', 'images');
  const posterFiles = ['poster-1.jpg', 'poster-2.jpg', 'poster-3.jpg', 'poster-4.jpg', 'poster-5.jpg', 'poster-6.jpg'];
  const funFiles = ['Fun-Tix-1.jpg', 'Fun-Tix-2.jpg', 'Fun-Tix-3.jpg', 'Fun-Tix-4.jpg'];

  const assetIds: number[] = [];
  for (const f of [...posterFiles, ...funFiles]) {
    const p = join(base, f);
    if (!existsSync(p)) continue;
    const buf = readFileSync(p);
    const rows = (await sql`
      INSERT INTO assets (filename, content_type, size, data)
      VALUES (${f}, ${'image/jpeg'}, ${buf.byteLength}, ${buf.toString('base64')})
      RETURNING id;
    `) as unknown as IdRow[];
    assetIds.push(rows[0].id);
  }

  // Movies
  const movies = [
    { title: 'Dune: Part Two', genre: 'Sci-Fi', duration_min: 166, rating: 'PG-13', status: 'now_showing' },
    { title: 'Inside Out 2', genre: 'Animation', duration_min: 96, rating: 'PG', status: 'now_showing' },
    { title: 'Gladiator II', genre: 'Action', duration_min: 148, rating: 'R', status: 'now_showing' },
    { title: 'Oppenheimer', genre: 'Drama', duration_min: 180, rating: 'R', status: 'now_showing' },
    { title: 'Spider-Verse', genre: 'Animation', duration_min: 140, rating: 'PG', status: 'now_showing' },
    { title: 'Inside Man', genre: 'Thriller', duration_min: 128, rating: 'PG-13', status: 'now_showing' },
  ] as const;

  const movieIds: number[] = [];
  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const posterId = assetIds[i % assetIds.length] ?? null;
    const rows = (await sql`
      INSERT INTO movies (title, genre, duration_min, rating, status, poster_asset_id)
      VALUES (${m.title}, ${m.genre}, ${m.duration_min}, ${m.rating}, ${m.status}, ${posterId})
      RETURNING id;
    `) as unknown as IdRow[];
    movieIds.push(rows[0].id);
  }

  // Theaters
  const theaters = [
    { name: 'SanTix Central Park', location: 'Jakarta', rooms: 6, seats: 756 },
    { name: 'SanTix Galaxy Mall', location: 'Surabaya', rooms: 5, seats: 620 },
    { name: 'SanTix Margo City', location: 'Depok', rooms: 7, seats: 820 },
  ] as const;
  const theaterIds: number[] = [];
  for (const t of theaters) {
    const rows = (await sql`
      INSERT INTO theaters (name, location, rooms, seats)
      VALUES (${t.name}, ${t.location}, ${t.rooms}, ${t.seats})
      RETURNING id;
    `) as unknown as IdRow[];
    theaterIds.push(rows[0].id);
  }

  // Showtimes — realistic schedule for the week starting 2026-01-06
  const showtimeData: Array<{ movie_id: number; theater_id: number; starts_at: string; lang: string; type: string; status: string }> = [];

  // Daily show times (hours)
  const dailyTimes = [10, 13, 15, 17, 19, 21];
  const languages = ['ID', 'EN'];
  const types = ['2D', '3D', 'IMAX', '4DX'];

  // Create showtimes for each movie across 7 days (2026-01-06 to 2026-01-12)
  for (let m = 0; m < movieIds.length; m++) {
    const movieId = movieIds[m];

    // Each movie gets showtimes at each theater
    for (let t = 0; t < theaterIds.length; t++) {
      const theaterId = theaterIds[t];

      // 7 days of showtimes
      for (let day = 0; day < 7; day++) {
        // Pick 3-4 time slots per day based on theater
        const timesForDay = dailyTimes.slice(t, t + 3 + (day % 2));

        for (const hour of timesForDay) {
          showtimeData.push({
            movie_id: movieId,
            theater_id: theaterId,
            starts_at: createShowtime(day, hour, (m * 15) % 60), // Stagger minutes by movie
            lang: languages[m % languages.length],
            type: types[(m + t) % types.length],
            status: 'scheduled',
          });
        }
      }
    }
  }

  // Insert all showtimes
  for (const s of showtimeData) {
    await sql`
      INSERT INTO showtimes (movie_id, theater_id, starts_at, lang, type, status)
      VALUES (${s.movie_id}, ${s.theater_id}, ${s.starts_at}, ${s.lang}, ${s.type}, ${s.status});
    `;
  }

  // Seed an admin user placeholder
  await sql`INSERT INTO users (name, email, role, status) VALUES ('Admin', 'admin@santix.io', 'admin', 'active');`;

  // TIX Fun items (map the funFiles to assets by filename order)
  const funAssetMap: Record<string, number> = {};
  // Re-read assets to map filenames back to IDs (simple approach)
  const allAssets = (await sql`SELECT id, filename FROM assets;`) as unknown as { id: number; filename: string }[];
  for (const a of allAssets) funAssetMap[a.filename] = a.id;
  const funItems = [
    { title: 'Popcorn Combo Hemat', subtitle: 'Diskon 20%', desc: 'Nikmati combo popcorn + minum lebih hemat!', img: 'Fun-Tix-1.jpg', url: 'https://santix.fun/promo/popcorn' },
    { title: 'Voucher Endgame', subtitle: 'Limited!', desc: 'Dapatkan voucher nonton film favoritmu.', img: 'Fun-Tix-2.jpg', url: 'https://santix.fun/voucher' },
    { title: 'Merch Exclusive', subtitle: 'Baru Tiba', desc: 'Kaos & totebag edisi film terbaru.', img: 'Fun-Tix-3.jpg', url: 'https://santix.fun/merch' },
    { title: 'Member Rewards', subtitle: 'Double Points', desc: 'Kumpulkan poin lebih cepat minggu ini.', img: 'Fun-Tix-4.jpg', url: 'https://santix.fun/rewards' },
  ] as const;
  for (const it of funItems) {
    const imgId = funAssetMap[it.img] ?? null;
    await sql`
      INSERT INTO fun_items (title, subtitle, description, image_asset_id, link_url, status)
      VALUES (${it.title}, ${it.subtitle}, ${it.desc}, ${imgId}, ${it.url}, ${'active'});
    `;
  }

  console.log('Seed completed:', {
    assets: assetIds.length,
    movies: movieIds.length,
    theaters: theaterIds.length,
    showtimes: showtimeData.length,
    users: 1,
    fun: funItems.length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
