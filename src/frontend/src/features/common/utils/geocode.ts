export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('zoom', '16');
  url.searchParams.set('addressdetails', '1');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        // Cannot set User-Agent in browser; Referer will generally be present.
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: any = await res.json();

    // Prefer a concise address composed from parts
    const a = data.address || {};
    const parts: string[] = [];
    const street = a.road || a.pedestrian || a.path || a.footway || a.cycleway;
    if (street) parts.push(street);
    const area = a.neighbourhood || a.suburb || a.quarter || a.residential;
    if (area) parts.push(area);
    const city = a.city || a.town || a.village || a.hamlet;
    if (city) parts.push(city);
    const state = a.state || a.region;
    const country = a.country;
    if (state) parts.push(state);
    if (country) parts.push(country);

    const label = (parts.length ? parts.join(', ') : data.display_name || '').trim();

    // Truncate very long labels for UI
    return label.length > 90 ? `${label.slice(0, 87)}...` : label;
  } catch (e) {
    // On failure, return empty string so caller can fallback to coordinates
    return '';
  }
}

