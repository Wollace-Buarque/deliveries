import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

async function handleAddressLookup(params: {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}) {
  const fullAddress = `${params.street}, ${params.number || ''}, ${params.neighborhood}, ${params.city}, ${params.state}, ${params.zipCode}, Brasil`

  try {
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`,
      {
        next: {
          revalidate: 60 * 30
        }
      }
    )

    if (!geoResponse.ok) throw new Error('Failed to fetch geolocation data')

    const geoResponseData = await geoResponse.json()
    if (!geoResponseData || geoResponseData.length === 0) throw new Error('No geolocation data found')

    return {
      lat: geoResponseData[0].lat,
      lng: geoResponseData[0].lon
    }
  } catch {
    return { lat: null, lng: null }
  }
}

export { cn, handleAddressLookup }
