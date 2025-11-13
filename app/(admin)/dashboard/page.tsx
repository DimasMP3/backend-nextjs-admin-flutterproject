import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type KPI = {
  label: string;
  value: string;
  delta?: { label: string; variant: "success" | "warning" | "error" };
};

const kpis: KPI[] = [
  { label: "Total Movies", value: "128" },
  { label: "Upcoming Showtimes", value: "57" },
  { label: "Tickets Sold (7d)", value: "8,214", delta: { label: "+12.3%", variant: "success" } },
  { label: "Revenue (7d)", value: "$42,870", delta: { label: "+8.1%", variant: "success" } },
];

const topMovies = [
  { title: "Dune: Part Two", tickets: "1,240" },
  { title: "Oppenheimer", tickets: "1,112" },
  { title: "Inside Out 2", tickets: "963" },
];

/**
 * Renders the admin dashboard overview with KPIs and placeholder widgets.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Key metrics for your cinema operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary">Add Movie</Button>
          <Button>Create Showtime</Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader>
              <CardTitle>{k.label}</CardTitle>
              {k.delta && <Badge variant={k.delta.variant}>{k.delta.label}</Badge>}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-500">No recent orders yet.</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Movies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topMovies.map((movie) => (
              <div key={movie.title} className="flex items-center justify-between text-sm">
                <span>{movie.title}</span>
                <span className="font-medium">{movie.tickets}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
