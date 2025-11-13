import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Simple placeholder settings page showcasing the global form style.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure your application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Brand Name</span>
              <input
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                defaultValue="Santix"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Currency</span>
              <select className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                <option>IDR</option>
                <option>USD</option>
              </select>
            </label>
          </div>
          <div>
            <Button variant="primary">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
