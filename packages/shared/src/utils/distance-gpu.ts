import { GPU } from 'gpu.js'
import { AddressDto } from '../schemas/delivery'

export function calculateDistancesGPU(addresses: AddressDto[]): number[][] {
  const n = addresses.length
  const lats = addresses.map(function (a) {
    return a.coordinates.lat
  })
  const lngs = addresses.map(function (a) {
    return a.coordinates.lng
  })

  const gpu = new GPU()
  const distanceMatrix = gpu.createKernel(
    function (lats, lngs) {
      var i = this.thread.y
      var j = this.thread.x
      var R = 6371.0
      var PI = 3.141592653589793
      var toRad_i = (lats[i] * PI) / 180.0
      var toRad_j = (lats[j] * PI) / 180.0
      var dLat = ((lats[j] - lats[i]) * PI) / 180.0
      var dLng = ((lngs[j] - lngs[i]) * PI) / 180.0
      var a =
        Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
        Math.cos(toRad_i) * Math.cos(toRad_j) * Math.sin(dLng / 2.0) * Math.sin(dLng / 2.0)
      var c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a))
      return R * c
    },
    {
      output: [n, n],
      pipeline: false,
      immutable: true
    }
  )

  var result = distanceMatrix(lats, lngs)
  gpu.destroy()
  return result
}
