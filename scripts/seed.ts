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

function addHoursISO(hours: number) {
  const now = new Date();
  return new Date(now.getTime() + hours * 3600_000).toISOString();
}

async function main() {
  // Clean tables in FK-safe order
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
    { title: 'Dune: Part Two', genre: 'Sci‑Fi', duration_min: 166, rating: 'PG-13', status: 'now_showing' },
    { title: 'Inside Out 2', genre: 'Animation', duration_min: 96, rating: 'PG', status: 'now_showing' },
    { title: 'Gladiator II', genre: 'Action', duration_min: 148, rating: 'R', status: 'coming_soon' },
    { title: 'Oppenheimer', genre: 'Drama', duration_min: 180, rating: 'R', status: 'now_showing' },
    { title: 'Spider‑Verse', genre: 'Animation', duration_min: 140, rating: 'PG', status: 'coming_soon' },
    { title: 'Inside Man', genre: 'Thriller', duration_min: 128, rating: 'PG-13', status: 'archived' },
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
    { name: 'Santix Central Park', location: 'Jakarta', rooms: 6, seats: 756 },
    { name: 'Santix Galaxy Mall', location: 'Surabaya', rooms: 5, seats: 620 },
    { name: 'Santix Margo City', location: 'Depok', rooms: 7, seats: 820 },
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

  // Showtimes — a few in the next days
  const showtimes = [
    { movie_id: movieIds[0], theater_id: theaterIds[0], starts_at: addHoursISO(6), lang: 'EN', type: 'IMAX', status: 'scheduled' },
    { movie_id: movieIds[1], theater_id: theaterIds[0], starts_at: addHoursISO(9), lang: 'ID', type: '2D', status: 'scheduled' },
    { movie_id: movieIds[2], theater_id: theaterIds[1], starts_at: addHoursISO(24), lang: 'EN', type: '3D', status: 'scheduled' },
    { movie_id: movieIds[0], theater_id: theaterIds[2], starts_at: addHoursISO(30), lang: 'EN', type: '2D', status: 'scheduled' },
  ] as const;
  for (const s of showtimes) {
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
    showtimes: showtimes.length,
    users: 1,
    fun: funItems.length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
