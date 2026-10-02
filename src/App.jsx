import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function App() {
  return (
    <div className="min-h-screen bg-background p-10">
      <Card className="max-w-sm shadow-md">
        <CardHeader><CardTitle>Foundation check</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Badge>Available</Badge>
          <Button className="w-full">Primary</Button>
          <Button className="w-full bg-clay text-clay-foreground hover:bg-clay/90">Clay</Button>
          <span className="inline-block rounded-full bg-status-safe-soft px-3 py-1 text-xs font-semibold text-status-safe">Safe</span>
        </CardContent>
      </Card>
    </div>
  )
}