import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Camera, MapPin, Check, Loader2, ImagePlus } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CATEGORY_LABELS, STORAGE_LABELS, COVERED_LABELS, UNITS, toOptions,
} from "@/lib/mockData"
import FoodBoxCharacter from "@/components/FoodBoxCharacter"
import { createDonation } from "@/lib/donations"
import { EASE_OUT, staggerParent, staggerItem, popIn } from "@/lib/motion"

const FALLBACK_LOCATION = { lat: 19.3919, lng: 72.8397 }
const nowLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

function SelectField({ label, value, onChange, options, placeholder = "Select" }) {
  return (
    <motion.div variants={staggerItem} className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  )
}

// What is still missing before the button unlocks (shown as a gentle hint).
function missingFields(form, location) {
  const out = []
  if (!form.foodCategory) out.push("a category")
  if (!(Number(form.quantity) > 0)) out.push("a quantity")
  if (!form.cookedAt) out.push("when it was cooked")
  if (!location) out.push("your pickup location")
  return out
}

export default function AddDonation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    foodCategory: "",
    cookedAt: nowLocal(),
    quantity: "",
    unit: "plates",
    storageCondition: "room_temp",
    isCovered: "covered",
    measuredTempC: "",
  })
  const [photo, setPhoto] = useState(null)
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  // free the old preview blob whenever the photo changes / the page closes
  const previewRef = useRef(null)
  useEffect(() => () => previewRef.current && URL.revokeObjectURL(previewRef.current), [])

  const onPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const preview = URL.createObjectURL(file)
    previewRef.current = preview
    setPhoto({ file, preview })
  }

  const getLocation = () => {
    setLocating(true)
    const fallback = () => { setLocation({ ...FALLBACK_LOCATION, approx: true }); setLocating(false) }
    if (!navigator.geolocation) return fallback()
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, approx: false })
        setLocating(false)
      },
      fallback,
      { timeout: 8000 }
    )
  }

  const canSubmit = form.foodCategory && Number(form.quantity) > 0 && form.cookedAt && location

  const submit = async (e) => {
    e.preventDefault()
    if (!user || saving) return
    setSaving(true)
    setError("")
    try {
      await createDonation({ user, form, photoFile: photo?.file ?? null, location })
      setDone(true)
      toast.success("Donation posted", { description: "Nearby recipients can now see it." })
      setTimeout(() => navigate("/home"), 1400)
    } catch (err) {
      console.error("Posting donation failed:", err)
      setError(err?.message || "Could not post the donation. Please try again.")
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="relative flex items-center justify-center">
          {/* two soft rings ripple out once behind the mascot */}
          {[0, 0.25].map((d) => (
            <motion.span
              key={d}
              aria-hidden="true"
              className="absolute size-40 rounded-full border-2 border-primary/40"
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 1.1, delay: d, ease: EASE_OUT }}
            />
          ))}
          <motion.div variants={popIn} initial="hidden" animate="visible">
            <FoodBoxCharacter type="celebrating" />
          </motion.div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: EASE_OUT }}
          className="text-2xl font-bold"
        >
          Donation posted
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: EASE_OUT }}
          className="text-muted-foreground"
        >
          Thank you. Nearby recipients can now see it.
        </motion.p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh md:mx-auto md:min-h-0 md:max-w-2xl">
      <PageHeader title="Donate food" />
      <motion.form
        variants={staggerParent(0.05, 0.05)}
        initial="hidden"
        animate="visible"
        onSubmit={submit}
        className="space-y-5 px-5 pt-2 pb-10 md:mb-10 md:rounded-3xl md:border md:bg-card md:p-8 md:shadow-sm"
      >
        <motion.label
          variants={staggerItem}
          whileTap={{ scale: 0.985 }}
          className="group relative flex h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed bg-card text-muted-foreground transition-colors hover:border-primary/50 md:bg-background"
        >
          <AnimatePresence mode="wait" initial={false}>
            {photo ? (
              <motion.div
                key={photo.preview}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img src={photo.preview} alt="Food preview" className="h-full w-full object-cover" />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                  <ImagePlus className="size-3.5" /> Change photo
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Camera className="size-8 text-primary transition-transform duration-200 group-hover:scale-110" />
                <span className="text-sm font-medium">Add a clear photo of the food</span>
              </motion.div>
            )}
          </AnimatePresence>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
        </motion.label>

        <SelectField
          label="Food category"
          value={form.foodCategory}
          onChange={set("foodCategory")}
          options={toOptions(CATEGORY_LABELS)}
          placeholder="Choose a category"
        />

        <motion.div variants={staggerItem} className="space-y-2">
          <Label htmlFor="cookedAt">Cooked at</Label>
          <Input id="cookedAt" type="datetime-local" max={nowLocal()} value={form.cookedAt}
            onChange={(e) => set("cookedAt")(e.target.value)} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-[1fr_9rem] gap-3">
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" min="1" placeholder="e.g. 10" value={form.quantity}
              onChange={(e) => set("quantity")(e.target.value)} />
          </div>
          <SelectField label="Unit" value={form.unit} onChange={set("unit")} options={UNITS} />
        </motion.div>

        <SelectField label="Storage condition" value={form.storageCondition}
          onChange={set("storageCondition")} options={toOptions(STORAGE_LABELS)} />
        <SelectField label="Is the food covered?" value={form.isCovered}
          onChange={set("isCovered")} options={toOptions(COVERED_LABELS)} />

        <motion.div variants={staggerItem} className="space-y-2">
          <Label htmlFor="temp">Food temperature in C (optional)</Label>
          <Input id="temp" type="number" inputMode="decimal" step="0.1" min="-40" max="200"
            placeholder="e.g. 65 if kept hot, 4 if chilled" value={form.measuredTempC}
            onChange={(e) => set("measuredTempC")(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            A thermometer reading makes the safety check more accurate.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-2">
          <Label>Pickup location</Label>
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-start transition-colors ${location ? "border-primary/40 bg-primary/5" : ""}`}
            onClick={getLocation}
            disabled={locating}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={locating ? "loading" : location ? "done" : "idle"}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
                className="inline-flex"
              >
                {locating ? (
                  <Loader2 className="animate-spin" />
                ) : location ? (
                  <Check className="text-primary" />
                ) : (
                  <MapPin />
                )}
              </motion.span>
            </AnimatePresence>
            {locating ? "Getting location..." : location
              ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}${location.approx ? " (default)" : ""}`
              : "Use my current location"}
          </Button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 0] }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, x: { duration: 0.35, delay: 0.1 } }}
              className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div variants={staggerItem} className="space-y-2">
          {/* small "unlocked" pop the moment the form becomes valid */}
          <motion.div
            animate={canSubmit ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Posting..." : "Post donation"}
            </Button>
          </motion.div>

          <AnimatePresence initial={false}>
            {!canSubmit && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center text-xs text-muted-foreground"
              >
                Still needed: {missingFields(form, location).join(", ")}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.form>
    </div>
  )
}
