import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PageHeader({ title, right }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/90 px-4 py-3 backdrop-blur md:px-0">
      <Button variant="ghost" size="icon" className="group" onClick={() => navigate(-1)} aria-label="Back">
        <ArrowLeft className="transition-transform duration-150 group-hover:-translate-x-0.5 group-active:-translate-x-1" />
      </Button>
      <h1 className="flex-1 text-lg font-bold">{title}</h1>
      {right}
    </header>
  )
}