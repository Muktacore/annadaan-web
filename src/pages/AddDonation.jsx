import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, MapPin, Check } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CATEGORY_LABELS, STORAGE_LABELS, COVERED_LABELS, UNITS, toOptions, currentUser,
} from "@/lib/mockData"

const FALLBACK_LOCATION = { lat: 19.3919, lng: 72.8397 }
const nowLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

function SelectField({ label, value, onChange, options, placeholder = "Select" }) {
  return (
    <div className="space-y-2">
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
    </div>
  )
}

export default function AddDonation() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    foodCategory: "",
    cookedAt: nowLocal(),
    quantity: "",
    unit: "plates",
    storageCondition: "room_temp",
    isCovered: "covered",
  })
  const [photo, setPhoto] = useState(null)
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const onPhoto = (e) => {
    const file = e.target.files?.[0]
    if (file) setPhoto({ file, preview: URL.createObjectURL(file) })
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

  const submit = (e) => {
    e.preventDefault()
    const donation = {
      donorId: currentUser.id,
      donorName: currentUser.name,
      foodCategory: form.foodCategory,
      foodPhotoUrl: null, // TODO Step 4/20: upload photo to Firebase Storage, store URL
      cookedAt: new Date(form.cookedAt),
      quantity: Number(form.quantity),
      unit: form.unit,
      storageCondition: form.storageCondition,
      isCovered: form.isCovered,
      location: { lat: location.lat, lng: location.lng },
      createdAt: new Date(),
      status: "available",
    }
    console.log("New donation (goes to Firestore later):", donation)
    setDone(true)
    setTimeout(() => navigate("/home"), 1400)
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-10" />
        </div>
        <h2 className="text-2xl font-bold">Donation posted</h2>
        <p className="text-muted-foreground">Thank you. Nearby recipients can now see it.</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh md:mx-auto md:min-h-0 md:max-w-2xl">
      <PageHeader title="Donate food" />
      <form
        onSubmit={submit}
        className="space-y-5 px-5 pt-2 pb-10 md:mb-10 md:rounded-3xl md:border md:bg-card md:p-8 md:shadow-sm"
      >
        <label className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed bg-card text-muted-foreground md:bg-background">
          {photo ? (
            <img src={photo.preview} alt="Food preview" className="h-full w-full object-cover" />
          ) : (
            <>
              <Camera className="size-8 text-primary" />
              <span className="text-sm font-medium">Add a clear photo of the food</span>
            </>
          )}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
        </label>

        <SelectField
          label="Food category"
          value={form.foodCategory}
          onChange={set("foodCategory")}
          options={toOptions(CATEGORY_LABELS)}
          placeholder="Choose a category"
        />

        <div className="space-y-2">
          <Label htmlFor="cookedAt">Cooked at</Label>
          <Input id="cookedAt" type="datetime-local" max={nowLocal()} value={form.cookedAt}
            onChange={(e) => set("cookedAt")(e.target.value)} />
        </div>

        <div className="grid grid-cols-[1fr_9rem] gap-3">
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" min="1" placeholder="e.g. 10" value={form.quantity}
              onChange={(e) => set("quantity")(e.target.value)} />
          </div>
          <SelectField label="Unit" value={form.unit} onChange={set("unit")} options={UNITS} />
        </div>

        <SelectField label="Storage condition" value={form.storageCondition}
          onChange={set("storageCondition")} options={toOptions(STORAGE_LABELS)} />
        <SelectField label="Is the food covered?" value={form.isCovered}
          onChange={set("isCovered")} options={toOptions(COVERED_LABELS)} />

        <div className="space-y-2">
          <Label>Pickup location</Label>
          <Button type="button" variant="outline" className="w-full justify-start" onClick={getLocation} disabled={locating}>
            <MapPin />
            {locating ? "Getting location…" : location
              ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}${location.approx ? " (default)" : ""}`
              : "Use my current location"}
          </Button>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
          Post donation
        </Button>
      </form>
    </div>
  )
}