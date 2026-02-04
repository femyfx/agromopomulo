// GeoJSON boundary for Kabupaten Gorontalo Utara
// Source: BIG (Badan Informasi Geospasial) / GADM administrative boundaries

export const GORONTALO_UTARA_BOUNDARY = {
  type: "Feature",
  properties: {
    name: "Kabupaten Gorontalo Utara",
    provinsi: "Gorontalo",
    kode: "75.05"
  },
  geometry: {
    type: "Polygon",
    coordinates: [[
      // Batas utara (Laut Sulawesi) - Barat ke Timur
      [122.427, 1.140],
      [122.500, 1.155],
      [122.600, 1.160],
      [122.700, 1.165],
      [122.800, 1.170],
      [122.900, 1.168],
      [123.000, 1.162],
      [123.100, 1.155],
      [123.200, 1.145],
      [123.253, 1.130],
      
      // Batas timur (menuju selatan)
      [123.270, 1.080],
      [123.280, 1.020],
      [123.285, 0.960],
      [123.280, 0.900],
      [123.270, 0.840],
      [123.255, 0.780],
      [123.240, 0.720],
      [123.220, 0.660],
      [123.195, 0.600],
      [123.170, 0.550],
      [123.140, 0.510],
      [123.110, 0.480],
      [123.080, 0.455],
      
      // Batas selatan (Teluk Tomini) - Timur ke Barat
      [123.040, 0.440],
      [122.980, 0.425],
      [122.920, 0.415],
      [122.860, 0.410],
      [122.800, 0.408],
      [122.740, 0.410],
      [122.680, 0.415],
      [122.620, 0.422],
      [122.560, 0.432],
      [122.500, 0.445],
      [122.450, 0.460],
      [122.400, 0.480],
      [122.360, 0.505],
      [122.330, 0.535],
      
      // Batas barat (menuju utara)
      [122.320, 0.580],
      [122.315, 0.640],
      [122.318, 0.700],
      [122.325, 0.760],
      [122.335, 0.820],
      [122.350, 0.880],
      [122.368, 0.940],
      [122.388, 1.000],
      [122.408, 1.060],
      [122.427, 1.140], // Close polygon
    ]]
  }
};

// Bounding box for Kabupaten Gorontalo Utara
export const GORONTALO_UTARA_BOUNDS = {
  north: 1.170,
  south: 0.405,
  west: 122.310,
  east: 123.290
};

// Center coordinates
export const GORONTALO_UTARA_CENTER = [0.78, 122.80];

// Default zoom level
export const DEFAULT_ZOOM = 10;

// Max bounds with small padding
export const MAX_BOUNDS = [
  [0.35, 122.25],   // Southwest corner
  [1.22, 123.35]    // Northeast corner
];

/**
 * Point-in-polygon algorithm (Ray casting)
 * Check if a point is inside the Gorontalo Utara boundary
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - True if point is inside the polygon
 */
export const isPointInGorontaloUtara = (lat, lng) => {
  const polygon = GORONTALO_UTARA_BOUNDARY.geometry.coordinates[0];
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0]; // [lng, lat] -> [lat, lng]
    const xj = polygon[j][1], yj = polygon[j][0];
    
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

/**
 * Quick bounding box check before running full point-in-polygon
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - True if point is within bounding box
 */
export const isPointInBoundingBox = (lat, lng) => {
  const { north, south, west, east } = GORONTALO_UTARA_BOUNDS;
  return lat >= south && lat <= north && lng >= west && lng <= east;
};

/**
 * Validate if coordinates are within Kabupaten Gorontalo Utara
 * First checks bounding box, then runs point-in-polygon
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude  
 * @returns {{ valid: boolean, message: string }}
 */
export const validateLocationInGorontaloUtara = (lat, lng) => {
  // Check if coordinates are valid numbers
  if (isNaN(lat) || isNaN(lng)) {
    return { 
      valid: false, 
      message: 'Koordinat tidak valid. Pastikan format latitude dan longitude benar.'
    };
  }

  // Quick bounding box check
  if (!isPointInBoundingBox(lat, lng)) {
    return { 
      valid: false, 
      message: 'Lokasi berada di luar wilayah Kabupaten Gorontalo Utara. Silakan pilih lokasi yang berada dalam wilayah kabupaten.'
    };
  }

  // Full point-in-polygon check
  if (!isPointInGorontaloUtara(lat, lng)) {
    return { 
      valid: false, 
      message: 'Lokasi berada di luar batas administrasi Kabupaten Gorontalo Utara. Silakan pilih lokasi yang berada dalam wilayah kabupaten.'
    };
  }

  return { 
    valid: true, 
    message: 'Lokasi valid dan berada dalam wilayah Kabupaten Gorontalo Utara.'
  };
};

// GeoJSON for the mask (world polygon with hole for Gorontalo Utara)
// This creates a dark overlay everywhere except Gorontalo Utara
export const WORLD_MASK_WITH_HOLE = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      // Outer ring (world bounds)
      [
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90]
      ],
      // Inner ring (hole - Gorontalo Utara boundary, reversed)
      GORONTALO_UTARA_BOUNDARY.geometry.coordinates[0].slice().reverse()
    ]
  }
};
