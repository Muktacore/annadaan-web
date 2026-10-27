// Checks that src/lib/urgency.js gives exactly the same results as the Python version.
// Run from the repo root after:  (in ml)  python tests\dump_urgency_cases.py
//   node ml\tests\check_urgency_parity.mjs
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { urgencyScore, urgencyForRequest } from "../../src/lib/urgency.js"

const here = dirname(fileURLToPath(import.meta.url))
const cases = JSON.parse(readFileSync(join(here, "fixtures", "urgency_cases.json"), "utf8"))

let bad = 0
for (const [i, c] of cases.entries()) {
  const got =
    c.kind === "score"
      ? urgencyScore(c.input)
      : urgencyForRequest({
          donation: {
            cookedAt: new Date(c.input.cookedAt),
            storageCondition: c.input.storageCondition,
            isCovered: c.input.isCovered,
            measuredTempC: c.input.measuredTempC,
            foodCategory: c.input.foodCategory,
          },
          distanceKm: c.input.distanceKm,
          peopleToFeed: c.input.peopleToFeed,
          now: new Date(c.input.checkedAt),
        })
  if (JSON.stringify(got) !== JSON.stringify(c.expected)) {
    bad++
    if (bad <= 5) console.log(`MISMATCH #${i}`, JSON.stringify(c.input), "\n js:", JSON.stringify(got), "\n py:", JSON.stringify(c.expected))
  }
}
console.log(bad === 0 ? `PARITY OK: ${cases.length} cases identical` : `PARITY FAILED: ${bad} of ${cases.length} differ`)
process.exit(bad === 0 ? 0 : 1)
