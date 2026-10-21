import { Wheat, Soup, Cookie } from "lucide-react"

const ICONS = { rice: Wheat, dal_gravy: Soup, roti_bread: Cookie }

export default function CategoryIcon({ category, className }) {
  const Icon = ICONS[category] ?? Wheat
  return <Icon className={className} />
}