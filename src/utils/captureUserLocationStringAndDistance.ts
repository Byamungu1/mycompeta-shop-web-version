import * as turf from '@turf/turf';
import kakumaMapJsonData from '../../assets/maps/kakuma_map.json';

function normalizeCoord(coord) {
  console.log('the coords', coord)
  if (Array.isArray(coord) && coord.length >= 2) {
    return [Number(coord[0]), Number(coord[1])];
  }
  if (coord && typeof coord === 'object') {
    const lng = coord.longitude ?? coord.lng ?? coord.x;
    const lat = coord.latitude ?? coord.lat ?? coord.y;
    if (lng !== undefined && lat !== undefined) {
      return [Number(lng), Number(lat)];
    }
  }
  throw new Error("Invalid coordinate format. Expected [lng, lat] or { longitude, latitude }.");
}

/**
 * Accurate location lookup inside Kakuma GeoJSON map
 */
export function getLocationName(userCoord: {longitude: number, latitude: number}) {
  if (!userCoord || !kakumaMapJsonData?.features) {
    return { found: false, formattedName: "Invalid input or missing map data", details: null };
  }

  const [lng, lat] = normalizeCoord(userCoord);


  if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { found: false, formattedName: "Invalid coordinates", details: null };
  }

  const point = turf.point([lng, lat]);

  // Find ALL matching polygons that contain the point
  const matchingFeatures = kakumaMapJsonData.features.filter((feature) => {
    const geomType = feature.geometry?.type;
    if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
      return turf.booleanPointInPolygon(point, feature);
    }
    return false;
  });

  let selectedFeature = null;

  if (matchingFeatures.length === 1) {
    selectedFeature = matchingFeatures[0];
  } else if (matchingFeatures.length > 1) {
    // IF MULTIPLE MATCHES: Pick the polygon with the SMALLEST area (e.g., specific block/facility over a whole zone)
    selectedFeature = matchingFeatures.reduce((smallest, current) => {
      const smallestArea = turf.area(smallest);
      const currentArea = turf.area(current);
      return currentArea < smallestArea ? current : smallest;
    });
  }

  // FALLBACK: If point is on a road or boundary between blocks (within 20 meters)
  if (!selectedFeature) {
    let closestFeature = null;
    let minDistance = Infinity;

    for (const feature of kakumaMapJsonData.features) {
      if (feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon') {
        const boundary = turf.polygonToLine(feature as any);
        const distance = turf.pointToLineDistance(point, boundary as any, { units: 'meters' });
        if (distance < minDistance) {
          minDistance = distance;
          closestFeature = feature;
        }
      }
    }

    // Only accept fallback if within 25 meters of a block center/edge
    if (closestFeature && minDistance <= 25) {
      selectedFeature = closestFeature;
    }
  }

  if (!selectedFeature) {
    return {
      found: false,
      formattedName: "Outside Mapped Coverage",
      details: null,
    };
  }

  const props = selectedFeature.properties || {};
  const camp = props.kakuma || props.camp || "Unknown Camp";
  const zone = props.zone || "Unknown Zone";
  const block = props.block || "Unknown Block";

  return {
    found: true,
    formattedName: `${camp}, ${zone}, ${block}`,
    details: {
      camp,
      zone,
      block,
      properties: props,
    },
  };
}

/**
 * Calculate distance between two coordinate points.
 * 
 * @param {Array<number>} startCoord - [longitude, latitude]
 * @param {Array<number>} endCoord - [longitude, latitude]
 * @param {string} [units='kilometers'] - 'kilometers', 'meters', 'miles'
 * @returns {number} Distance in chosen units (rounded to 2 decimal places)
 */
export function calculateDistance(startCoord, endCoord, units = 'kilometers') {
  const from = turf.point(startCoord);
  const to = turf.point(endCoord);

  const rawDistance = turf.distance(from, to, { units });

  // Return rounded result for clean UI output
  return Number(rawDistance.toFixed(2));
}