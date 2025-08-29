import Panel from "@/components/ui/panel/panelBox"
import Image from "next/image"

export default function MapPanel() {
  return (
    <Panel title="Stations géolocalisées">
      <div className="h-full w-full relative">
        <Image
          src="/assets/images/Map_dark2.png"
          alt="Carte des stations géolocalisées"
          fill
          style={{ objectFit: "cover" }}
          className="absolute inset-0"
        />
      </div>
    </Panel>
  )
}