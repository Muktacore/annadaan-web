import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { Info, TrendingUp, CalendarDays, Utensils } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { cn } from "@/lib/utils"
import { listItem, tween, DURATION } from "@/lib/motion"
import report from "@/data/forecast_report.json"

// Forecast insights for organisations that collect donated food and serve
// people in need. Everything on this page is read from the saved report
// (ml/reports/forecast_report.json copied to src/data). It is SIMULATED data
// and the page says so at the top.

const ALL = "All zones"
const zones = Object.keys(report.forecast_7day)

const FEATURE_LABELS = {
  roll_mean_28: "Typical daily donations over the last 28 days",
  roll_mean_7: "Average of the last 7 days",
  roll_std_7: "How much donations varied in the last week",
  is_festival: "Festival days",
  is_weekend: "Weekend or weekday",
  dow: "Day of the week",
  zone_Vasai: "Zone: Vasai",
  zone_Virar: "Zone: Virar",
  zone_Nalasopara: "Zone: Nalasopara",
}
const featureLabel = (f) => FEATURE_LABELS[f] ?? f.replace(/_/g, " ")

const MODEL_LABELS = {
  naive_yesterday: "Naive: same as yesterday",
  naive_last_week: "Naive: same as last week",
  random_forest: "Random forest",
  xgboost: "XGBoost",
  lstm: "LSTM (neural network)",
}

// Dates in the report are plain YYYY-MM-DD; parse them as local days.
const parseDay = (iso) => new Date(`${iso}T00:00:00`)
const fmtDay = (iso) =>
  parseDay(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
const fmtWeekday = (iso) => parseDay(iso).toLocaleDateString("en-IN", { weekday: "short" })
const fmtFull = (iso) =>
  parseDay(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
const round = (n) => Math.round(n)

// One zone's 7 days, or the three zones added up day by day.
function buildSeries(zone) {
  if (zone !== ALL) return report.forecast_7day[zone]
  return report.forecast_7day[zones[0]].map((row, i) => ({
    date: row.date,
    donations: zones.reduce((s, z) => s + report.forecast_7day[z][i].donations, 0),
    meals: zones.reduce((s, z) => s + report.forecast_7day[z][i].meals, 0),
  }))
}

function Card({ index = 0, className, children }) {
  return (
    <motion.section
      {...listItem(index)}
      className={cn("rounded-3xl border bg-card p-4 shadow-sm md:p-6", className)}
    >
      {children}
    </motion.section>
  )
}

function ZoneChips({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a zone">
      {[ALL, ...zones].map((z) => (
        <button
          key={z}
          type="button"
          aria-pressed={z === value}
          onClick={() => onChange(z)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors motion-safe:active:scale-95",
            z === value
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          {z}
        </button>
      ))}
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border bg-card p-3 md:p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 text-lg font-extrabold md:text-2xl">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// Bars grow with transform (scaleY) so they stay smooth on phones.
function Bars({ series, busiestDate, zoneKey }) {
  const max = Math.max(...series.map((r) => r.donations), 1)
  return (
    <div
      className="flex h-44 items-end gap-2 md:gap-3"
      role="img"
      aria-label="Expected donations for each of the next 7 days"
    >
      {series.map((r, i) => (
        <div key={`${zoneKey}-${r.date}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-semibold tabular-nums">{round(r.donations)}</span>
          <motion.div
            className={cn("w-full rounded-t-xl", r.date === busiestDate ? "bg-clay" : "bg-primary")}
            style={{ height: `${Math.max((r.donations / max) * 78, 4)}%`, originY: 1 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ ...tween(DURATION.slow), delay: i * 0.04 }}
          />
          <span className="text-[11px] text-muted-foreground">{fmtWeekday(r.date)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Insights() {
  const [zone, setZone] = useState(ALL)
  const series = useMemo(() => buildSeries(zone), [zone])

  const totalDonations = series.reduce((s, r) => s + r.donations, 0)
  const totalMeals = series.reduce((s, r) => s + r.meals, 0)
  const busiest = series.reduce((a, b) => (b.donations > a.donations ? b : a), series[0])

  const zoneTotals = zones
    .map((z) => ({
      zone: z,
      total: report.forecast_7day[z].reduce((s, r) => s + r.donations, 0),
    }))
    .sort((a, b) => b.total - a.total)

  const best = report.best_ml_model_by_val_mae
  const naiveMae = report.metrics.naive_yesterday.test.mae
  const bestMae = report.metrics[best].test.mae
  const gain = (((naiveMae - bestMae) / naiveMae) * 100).toFixed(1)
  const shap = report.shap_top_features[best] ?? report.shap_top_features.random_forest ?? []
  const shapMax = Math.max(...shap.map((s) => s.mean_abs_shap), 0.0001)

  return (
    <div className="min-h-dvh md:min-h-0">
      <PageHeader title="Forecast insights" />

      <div className="space-y-5 px-5 pt-2 pb-8 md:px-0">
        <div className="flex items-start gap-2 rounded-2xl bg-secondary p-3 text-xs md:text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>{report.disclaimer}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            For NGOs and other organisations that collect donated food and serve people in need.
            Use it to plan pickups, volunteers and vehicles for the coming week.
          </p>
          <ZoneChips value={zone} onChange={setZone} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Tile icon={TrendingUp} label="Donations" value={round(totalDonations)} sub="next 7 days" />
          <Tile icon={Utensils} label="Meals" value={round(totalMeals).toLocaleString("en-IN")} sub="estimated" />
          <Tile icon={CalendarDays} label="Busiest day" value={fmtWeekday(busiest.date)} sub={fmtDay(busiest.date)} />
        </div>

        <Card index={0} className="space-y-4">
          <div>
            <h3 className="font-semibold">Expected donations per day: {zone}</h3>
            <p className="text-xs text-muted-foreground">
              Window: {fmtDay(series[0].date)} to {fmtDay(series[series.length - 1].date)}{" "}
              {parseDay(series[0].date).getFullYear()}, the 7 days after the simulated history ends.
            </p>
          </div>

          <Bars series={series} busiestDate={busiest.date} zoneKey={zone} />

          <div className="space-y-1 rounded-2xl bg-secondary p-3 text-sm">
            <p>
              Busiest day: <span className="font-semibold">{fmtDay(busiest.date)}</span> (about{" "}
              {round(busiest.donations)} donations, roughly {round(busiest.meals).toLocaleString("en-IN")} meals).
              Plan volunteers, vehicles and storage for that day.
            </p>
            {zone === ALL && (
              <p>
                Busiest zone this week: <span className="font-semibold">{zoneTotals[0].zone}</span> (about{" "}
                {round(zoneTotals[0].total)} donations).
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Meals = donations x {report.meals_per_donation} (the average meals per donation in the simulation).
          </p>
        </Card>

        <Card index={1} className="space-y-4">
          <div>
            <h3 className="font-semibold">Why this forecast</h3>
            <p className="text-xs text-muted-foreground">
              What the {MODEL_LABELS[best] ?? best} model relied on most (SHAP importance, longer bar = bigger influence).
            </p>
          </div>

          <ul className="space-y-3">
            {shap.map((s, i) => (
              <li key={s.feature} className="space-y-1">
                <div className="flex justify-between gap-3 text-sm">
                  <span>{featureLabel(s.feature)}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{s.mean_abs_shap.toFixed(2)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-2 w-full rounded-full bg-primary"
                    style={{ originX: 0 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: s.mean_abs_shap / shapMax }}
                    transition={{ ...tween(DURATION.slow), delay: 0.1 + i * 0.05 }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-2 text-sm">
            <p>
              In plain words: the forecast starts from how busy a zone has been lately, then adjusts for
              the zone, festival days and the day of the week.
            </p>
            <p className="text-xs text-muted-foreground">
              Those effects were built into the simulated data, so seeing the model use them shows the
              pipeline can recover such patterns. It does not prove the same patterns exist in real donations.
            </p>
          </div>
        </Card>

        <Card index={2} className="space-y-4">
          <div>
            <h3 className="font-semibold">How reliable is it?</h3>
            <p className="text-xs text-muted-foreground">
              Tested on {fmtFull(report.split.test[0])} to {fmtFull(report.split.test[1])} (simulated).
              MAE is the average miss in donations per zone per day, so lower is better.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Model</th>
                  <th className="py-2 pr-3 text-right font-medium">Test MAE</th>
                  <th className="py-2 text-right font-medium">Test RMSE</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.metrics).map(([key, m]) => (
                  <tr key={key} className="border-t">
                    <td className="py-2 pr-3">
                      {MODEL_LABELS[key] ?? key}
                      {key === best && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          Best on validation
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{m.test.mae.toFixed(2)}</td>
                    <td className="py-2 text-right tabular-nums">{m.test.rmse.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm">
            {MODEL_LABELS[best] ?? best} misses by about {gain}% less than guessing "same as yesterday".
          </p>
        </Card>

        <Card index={3} className="space-y-2">
          <h3 className="font-semibold">Limits to keep in mind</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>All numbers come from simulated data (3 zones, about 3 years). No real donation history exists yet.</li>
            <li>Weather is not used as an input.</li>
            <li>The 7-day forecast is built one day at a time, so later days are less certain than earlier ones.</li>
            <li>The LSTM did not beat the tree models here. That says nothing about how it would do on real data.</li>
            <li>Meals are an estimate, not a count.</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
