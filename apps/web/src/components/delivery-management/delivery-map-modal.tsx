import { useState, useEffect, CSSProperties } from 'react'

import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api'
import { IconX } from '@tabler/icons-react'

import { formatMinutesToDuration } from '@/lib/utils'
import { Loading } from '../loading'

import * as Dialog from '@radix-ui/react-dialog'

interface DeliveryMapModalProps {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  open: boolean
}

const containerStyle: CSSProperties = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
}

export function DeliveryMapModal({ origin, destination, open }: DeliveryMapModalProps) {
  const [directions, setDirections] = useState<any>(null)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  })

  useEffect(() => {
    if (!isLoaded || !open || !origin || !destination) return

    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status !== window.google.maps.DirectionsStatus.OK) return

        setDirections(result)
      }
    )
  }, [isLoaded, open, origin, destination])

  const durationInMinutes = directions ? Math.ceil(directions.routes[0].legs[0].duration.value / 60) : null

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 z-50 bg-black/50" />

      <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Dialog.Title className="text-xl font-semibold text-zinc-800">Trajeto</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-zinc-600">
              Trajeto cálculado entre origem e destino
            </Dialog.Description>
          </div>

          <Dialog.Close asChild>
            <button className="cursor-pointer text-zinc-500 transition-colors hover:text-zinc-700">
              <IconX size={20} />
            </button>
          </Dialog.Close>
        </div>

        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={origin}
            zoom={10}
            options={{
              streetViewControl: false
            }}
          >
            <Marker position={origin} label="Origem" />
            <Marker position={destination} label="Destino" />
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center" style={{ height: containerStyle.height }}>
            <Loading size={40} />
          </div>
        )}

        {directions && (
          <div className="mt-6">
            <div className="mb-2 flex justify-between rounded-md bg-zinc-50 p-2">
              <span className="font-bold">Distancia</span>
              <span className="font-medium">{directions.routes[0].legs[0].distance.text}</span>
            </div>

            <div className="flex justify-between rounded-md bg-zinc-50 p-2">
              <span className="font-bold">Tempo estimado</span>
              <span className="font-medium">{formatMinutesToDuration(durationInMinutes!)}</span>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  )
}
