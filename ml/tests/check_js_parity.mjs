// Checks that the JS explanation templates match the Python ones, case by case.
// Run order (from the repo root):
//   python ml\tests\dump_explain_cases.py     (writes ml/tests/fixtures/explain_cases.json)
//   node ml\tests\check_js_parity.mjs
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { assessFreshness } from "../../src/lib/freshnessRules.js"
import { explainResult } from "../../src/lib/freshnessExplain.js"

const here = path.dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(path.join(here, "fixtures", "explain_cases.json"), "utf8"))
const checked = new Date(data.checked_at)

let failed = 0
for (const c of data.cases) {
  const inputs = {
    storageCondition: c.storage_condition,
    isCovered: c.is_covered,
    measuredTempC: c.measured_temp_c,
    foodCategory: c.food_category,
  }
  const cookedAt = new Date(checked.getTime() - c.hours_ago * 3600000)
  const result = assessFreshness({ cookedAt, ...inputs, checkedAt: checked })
  const got = explainResult(result, inputs)
  const same = JSON.stringify(got) === JSON.stringify(c.expected) && result.freshnessLabel === c.label
  if (!same) {
    failed += 1
    console.log(`MISMATCH: ${c.name}`)
    console.log("  python:", JSON.stringify(c.expected))
    console.log("  js:    ", JSON.stringify(got))
  }
}
console.log(failed === 0 ? `OK: JS matches Python on all ${data.cases.length} cases` : `${failed} case(s) differ`)
process.exit(failed === 0 ? 0 : 1)
