// GeoJSON boundary for Kabupaten Gorontalo Utara
// More accurate boundary focusing on actual administrative area
// Kecamatan: Kwandang, Anggrek, Sumalata, Tolinggula, Atinggola, Ponelo Kepulauan

export const GORONTALO_UTARA_BOUNDARY = {
  type: "Feature",
  properties: {
    name: "Kabupaten Gorontalo Utara",
    provinsi: "Gorontalo",
    kode: "75.05",
    ibukota: "Kwandang"
  },
  geometry: {
    type: "Polygon",
    coordinates: [[
      // Batas barat - Kec. Atinggola (berbatasan dengan Kab. Pohuwato)
      [122.295, 0.950],
      [122.320, 0.990],
      [122.350, 1.030],
      [122.380, 1.060],
      [122.420, 1.085],
      
      // Batas utara - Pantai Laut Sulawesi (Barat ke Timur)
      [122.480, 1.100],
      [122.550, 1.108],
      [122.620, 1.112],
      [122.700, 1.115],
      [122.780, 1.112],
      [122.860, 1.105],
      [122.940, 1.095],
      [123.020, 1.082],
      [123.100, 1.065],
      [123.160, 1.045],
      
      // Batas timur - berbatasan dengan Kab. Bolaang Mongondow (Sulawesi Utara)
      [123.180, 1.010],
      [123.195, 0.960],
      [123.200, 0.910],
      [123.195, 0.860],
      [123.185, 0.810],
      [123.170, 0.765],
      
      // Batas selatan-timur (Kec. Sumalata - Tolinggula)
      [123.150, 0.730],
      [123.110, 0.700],
      [123.060, 0.680],
      [123.000, 0.670],
      
      // Batas selatan (berbatasan dengan Kab. Gorontalo dan Bone Bolango)
      [122.940, 0.665],
      [122.880, 0.668],
      [122.820, 0.675],
      [122.760, 0.688],
      [122.700, 0.705],
      [122.640, 0.725],
      [122.580, 0.750],
      [122.520, 0.778],
      [122.460, 0.810],
      [122.400, 0.845],
      [122.350, 0.880],
      [122.310, 0.915],
      
      // Kembali ke titik awal
      [122.295, 0.950]
    ]]
  }
};

// Bounding box for Kabupaten Gorontalo Utara (more accurate)
export const GORONTALO_UTARA_BOUNDS = {
  north: 1.115,
  south: 0.665,
  west: 122.295,
  east: 123.200
};

// Center coordinates (Kwandang area)
export const GORONTALO_UTARA_CENTER = [0.85, 122.78];

// Default zoom level
export const DEFAULT_ZOOM = 10;

// Max bounds with small padding
export const MAX_BOUNDS = [
  [0.60, 122.20],   // Southwest corner
  [1.18, 123.28]    // Northeast corner
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
