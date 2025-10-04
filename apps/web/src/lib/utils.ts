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

async function fetchAddressByZipCode(zipCode: string) {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`, {
      next: {
        revalidate: 60 * 30
      }
    })

    if (!res.ok) throw new Error('Failed to fetch address data')

    const data = await res.json()
    if (data.erro) throw new Error('Invalid ZIP code')

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || ''
    }
  } catch {
    return null
  }
}

function formatMinutesToDuration(minutes: number): string {
  if (minutes < 1) return 'Menos de 1 min'

  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = Math.floor(minutes % 60)

  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days}d`)
  }

  if (hours > 0) {
    parts.push(`${hours}h`)
  }

  if (mins > 0 && !days) {
    parts.push(`${mins} min`)
  }

  return parts.join(' ')
}

export { cn, handleAddressLookup, fetchAddressByZipCode, formatMinutesToDuration }
