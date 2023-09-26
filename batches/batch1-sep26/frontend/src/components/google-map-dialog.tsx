"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GoogleMapDialogProps {
  isOpen: boolean
  onClose: () => void
  location: string
  title: string
}

export default function GoogleMapDialog({ isOpen, onClose, location, title }: GoogleMapDialogProps) {
  const [mapError, setMapError] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="h-[400px] w-full relative">
          {mapError ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-600">Failed to load map. Please try again later.</p>
            </div>
          ) : (
            <iframe
              title={title}
              src={mapSrc}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => setMapError(true)}
            ></iframe>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
