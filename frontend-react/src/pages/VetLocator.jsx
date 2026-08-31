import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Phone, MapPin, Navigation, ExternalLink } from 'lucide-react'
import { api } from '../api/client.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { distanceKm } from '../utils/geo.js'

// Geographic center of India — a sane default before we know the user's
// location, instead of an arbitrary region that looks like a bug.
const INDIA_CENTER = [22.9734, 78.6569]
const INDIA_DEFAULT_ZOOM = 5

const userIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#E8871E;border:3px solid white;box-shadow:0 0 0 2px #E8871E;"></div>',
  iconSize: [16, 16],
})

const googleVetIcon = new L.DivIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#4285F4;border:2px solid white;"></div>',
  iconSize: [14, 14],
})

// Leaflet renders patchy/half-loaded tiles when its container's real size
// isn't known at the moment it first mounts (very common inside a flex/grid
// layout like ours). invalidateSize() forces it to remeasure and repaint
// properly. We also fit the view to every marker so the whole set of vets
// is visible without the user having to manually zoom/pan.
function MapController({ points }) {
  const map = useMap()

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150)
    return () => clearTimeout(t)
  }, [map])

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 12)
      return
    }
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [map, points])

  return null
}

export default function VetLocator() {
  const { t } = useLanguage()
  const [registeredVets, setRegisteredVets] = useState([])
  const [googleVets, setGoogleVets] = useState([])
  const [placesConfigured, setPlacesConfigured] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    api.listVets().then(setRegisteredVets).catch((err) => setError(err.message))
    // Ask for location automatically on load; the browser still shows its
    // own permission prompt, this just skips requiring an extra click.
    shareLocation()
  }, [])

  useEffect(() => {
    if (!userLocation) return
    api.nearbyVets(userLocation.latitude, userLocation.longitude)
      .then((res) => {
        setPlacesConfigured(res.configured)
        setGoogleVets(res.vets || [])
      })
      .catch((err) => setError(err.message))
  }, [userLocation])

  const shareLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  const registeredGeo = registeredVets.filter((v) => v.latitude && v.longitude)

  // Merge both sources into one shape for the "closest to you" list.
  const allVets = useMemo(() => {
    const fromRegistry = registeredGeo.map((v) => ({
      key: `reg-${v.id}`,
      name: v.name,
      subtitle: v.assignedRegion,
      latitude: v.latitude,
      longitude: v.longitude,
      phone: v.phone,
      mapsUrl: null,
      source: 'registered',
    }))
    const fromGoogle = googleVets.map((v) => ({
      key: `g-${v.placeId}`,
      name: v.name,
      subtitle: v.address,
      latitude: v.latitude,
      longitude: v.longitude,
      phone: null,
      mapsUrl: v.mapsUrl,
      source: 'google',
    }))
    return [...fromRegistry, ...fromGoogle]
  }, [registeredGeo, googleVets])

  const sortedByDistance = useMemo(() => {
    if (!userLocation) return []
    return allVets
      .map((v) => ({ ...v, distanceKm: distanceKm(userLocation.latitude, userLocation.longitude, v.latitude, v.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [allVets, userLocation])

  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : allVets.length > 0
      ? [allVets[0].latitude, allVets[0].longitude]
      : INDIA_CENTER

  const zoom = userLocation || allVets.length > 0 ? 11 : INDIA_DEFAULT_ZOOM

  const mapPoints = useMemo(() => {
    const pts = []
    if (userLocation) pts.push([userLocation.latitude, userLocation.longitude])
    registeredGeo.forEach((v) => pts.push([v.latitude, v.longitude]))
    googleVets.forEach((v) => pts.push([v.latitude, v.longitude]))
    return pts
  }, [userLocation, registeredGeo, googleVets])

  return (
    <section className="panel">
      <h2>{t.locator.heading}</h2>
      <p className="hint">{t.locator.hint}</p>

      {error && <p className="status-msg error">{error}</p>}

      <button className="btn-primary" onClick={shareLocation} disabled={locating} style={{ marginBottom: 16 }}>
        <Navigation size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
        {locating ? t.report.locating : userLocation ? t.locator.allow + ' ↻' : t.locator.allow}
      </button>

      {!placesConfigured && (
        <p className="status-msg" style={{ marginBottom: 12 }}>
          Live vet clinic discovery isn't turned on for this deployment yet (needs a Google Places API key in
          the backend's application.properties) — showing manually registered vets only.
        </p>
      )}

      {userLocation && sortedByDistance.length > 0 && (
        <div className="panel" style={{ background: 'var(--surface-tint)', boxShadow: 'none', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>{t.locator.nearestHeading}</h2>
          <div className="ledger">
            {sortedByDistance.slice(0, 6).map((v) => (
              <div key={v.key} className="ledger-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
                <div className="ledger-main">
                  <div className="animal">{v.name}</div>
                  <div className="meta">{v.subtitle}</div>
                </div>
                <div className="ledger-village">{v.distanceKm.toFixed(1)} km {t.locator.away}</div>
                {v.phone ? (
                  <a className="btn-secondary" href={`tel:${v.phone}`}>
                    <Phone size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                    {v.phone}
                  </a>
                ) : v.mapsUrl ? (
                  <a className="btn-secondary" href={v.mapsUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                    Maps
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {!userLocation && <p className="status-msg">{t.locator.noLocation}</p>}

      <div className="map-wrap">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <MapController points={mapPoints} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          {registeredGeo.map((v) => (
            <Marker key={`reg-${v.id}`} position={[v.latitude, v.longitude]}>
              <Popup>
                <strong>{v.name}</strong><br />
                {v.assignedRegion}<br />
                {v.phone && <a href={`tel:${v.phone}`}>{v.phone}</a>}
              </Popup>
            </Marker>
          ))}
          {googleVets.map((v) => (
            <Marker key={`g-${v.placeId}`} position={[v.latitude, v.longitude]} icon={googleVetIcon}>
              <Popup>
                <strong>{v.name}</strong><br />
                {v.address}<br />
                {v.rating && <>★ {v.rating}<br /></>}
                {v.mapsUrl && <a href={v.mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {allVets.length === 0 && (
        <p className="status-msg" style={{ marginTop: 10 }}>
          <MapPin size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
          {placesConfigured
            ? 'No veterinary clinics found nearby — try a different location, or add one from the Veterinary desk.'
            : 'No veterinarians have a saved location yet — add one from the Veterinary desk and capture its location.'}
        </p>
      )}
    </section>
  )
}
