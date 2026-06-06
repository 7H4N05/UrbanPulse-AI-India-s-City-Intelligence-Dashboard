const fs = require('fs');
const path = require('path');

// Raw data for 100 cities with realistic coordinates and population (2011 census/recent estimates)
const baseCities = [
  { city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, pop: 16787941, aqi: 365 },
  { city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, pop: 12442373, aqi: 125 },
  { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, pop: 8443675, aqi: 68 },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, pop: 4646732, aqi: 72 },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, pop: 4496694, aqi: 155 },
  { city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, pop: 6731790, aqi: 92 },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pop: 3124458, aqi: 85 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, pop: 5577940, aqi: 138 },
  { city: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, pop: 4466826, aqi: 110 },
  { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pop: 3046163, aqi: 142 },
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, pop: 2817105, aqi: 245 },
  { city: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, pop: 2765348, aqi: 260 },
  { city: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, pop: 2405665, aqi: 78 }, // Low AQI despite higher density/pop
  { city: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, pop: 1684222, aqi: 280 },
  { city: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, pop: 1964086, aqi: 82 },
  { city: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781, pop: 1841488, aqi: 115 },
  { city: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, pop: 1798218, aqi: 98 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, pop: 1728128, aqi: 89 },
  { city: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, pop: 1670806, aqi: 95 },
  { city: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538, pop: 1648643, aqi: 310 },
  { city: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573, pop: 1618879, aqi: 172 },
  { city: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, pop: 1585704, aqi: 198 },
  { city: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898, pop: 1486053, aqi: 75 },
  { city: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178, pop: 1414050, aqi: 320 },
  { city: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064, pop: 1305429, aqi: 235 },
  { city: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, pop: 1286678, aqi: 90 },
  { city: "Kalyan-Dombivli", state: "Maharashtra", lat: 19.2354, lng: 73.1291, pop: 1247327, aqi: 122 },
  { city: "Vasai-Virar", state: "Maharashtra", lat: 19.3913, lng: 72.8397, pop: 1222390, aqi: 118 },
  { city: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, pop: 1198491, aqi: 182 },
  { city: "Srinagar", state: "Jammu and Kashmir", lat: 34.0837, lng: 74.7973, pop: 1180570, aqi: 52 },
  { city: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433, pop: 1175116, aqi: 88 },
  { city: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304, pop: 1162472, aqi: 205 },
  { city: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, pop: 1132383, aqi: 140 },
  { city: "Navi Mumbai", state: "Maharashtra", lat: 19.0330, lng: 73.0297, pop: 1120547, aqi: 84 },
  { city: "Allahabad", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, pop: 1112544, aqi: 162 },
  { city: "Howrah", state: "West Bengal", lat: 22.5769, lng: 88.3186, pop: 1077075, aqi: 168 },
  { city: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, pop: 1073427, aqi: 98 },
  { city: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, pop: 1069276, aqi: 215 },
  { city: "Jabalpur", state: "Madhya Pradesh", lat: 22.1560, lng: 79.9320, pop: 1055525, aqi: 91 },
  { city: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, pop: 1050721, aqi: 48 },
  { city: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480, pop: 1034358, aqi: 80 },
  { city: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, pop: 1033918, aqi: 152 },
  { city: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, pop: 1017865, aqi: 55 },
  { city: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, pop: 1010087, aqi: 175 },
  { city: "Kota", state: "Rajasthan", lat: 25.1825, lng: 75.8262, pop: 1001694, aqi: 122 },
  { city: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, pop: 957352, aqi: 190 },
  { city: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, pop: 961587, aqi: 88 },
  { city: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064, pop: 951558, aqi: 92 },
  { city: "Hubli-Dharwad", state: "Karnataka", lat: 15.3647, lng: 75.1240, pop: 943788, aqi: 62 },
  { city: "Bareilly", state: "Uttar Pradesh", lat: 28.3640, lng: 79.4150, pop: 903668, aqi: 185 },
  { city: "Moradabad", state: "Uttar Pradesh", lat: 28.8386, lng: 78.7733, pop: 887871, aqi: 220 },
  { city: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394, pop: 893062, aqi: 35 }, // Cleanest
  { city: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266, pop: 876900, aqi: 325 },
  { city: "Aligarh", state: "Uttar Pradesh", lat: 27.8974, lng: 78.0880, pop: 874408, aqi: 195 },
  { city: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762, pop: 862522, aqi: 135 },
  { city: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047, pop: 847387, aqi: 58 },
  { city: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, pop: 837737, aqi: 82 },
  { city: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460, pop: 829267, aqi: 65 },
  { city: "Mira-Bhayandar", state: "Maharashtra", lat: 19.2952, lng: 72.8548, pop: 814655, aqi: 112 },
  { city: "Warangal", state: "Telangana", lat: 17.9689, lng: 79.5941, pop: 811865, aqi: 70 },
  { city: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, pop: 746829, aqi: 42 },
  { city: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365, pop: 743354, aqi: 76 },
  { city: "Bhiwandi", state: "Maharashtra", lat: 19.2813, lng: 73.0483, pop: 709665, aqi: 162 },
  { city: "Saharanpur", state: "Uttar Pradesh", lat: 29.9640, lng: 77.5460, pop: 705478, aqi: 210 },
  { city: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3731, pop: 673446, aqi: 180 },
  { city: "Bikaner", state: "Rajasthan", lat: 28.0191, lng: 73.3119, pop: 644406, aqi: 135 },
  { city: "Amravati", state: "Maharashtra", lat: 20.9374, lng: 77.7796, pop: 647057, aqi: 74 },
  { city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, pop: 637272, aqi: 340 },
  { city: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029, pop: 631364, aqi: 108 },
  { city: "Bhilai", state: "Chhattisgarh", lat: 21.1938, lng: 81.3509, pop: 625700, aqi: 120 },
  { city: "Cuttack", state: "Odisha", lat: 20.4625, lng: 85.8830, pop: 610189, aqi: 88 },
  { city: "Firozabad", state: "Uttar Pradesh", lat: 27.1500, lng: 78.4000, pop: 604214, aqi: 230 },
  { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, pop: 602046, aqi: 49 },
  { city: "Nellore", state: "Andhra Pradesh", lat: 14.4426, lng: 79.9865, pop: 600869, aqi: 70 },
  { city: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, pop: 574840, aqi: 105 },
  { city: "Durgapur", state: "West Bengal", lat: 23.4800, lng: 87.3200, pop: 566517, aqi: 152 },
  { city: "Jhansi", state: "Uttar Pradesh", lat: 25.4484, lng: 78.5685, pop: 505693, aqi: 128 },
  { city: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, pop: 169578, aqi: 30 },
  { city: "Gangtok", state: "Sikkim", lat: 27.3314, lng: 88.6138, pop: 100286, aqi: 25 },
  { city: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, pop: 143229, aqi: 28 },
  { city: "Imphal", state: "Manipur", lat: 24.8170, lng: 93.9368, pop: 268243, aqi: 40 },
  { city: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053, pop: 59490, aqi: 22 },
  { city: "Aizawl", state: "Mizoram", lat: 23.7307, lng: 92.7173, pop: 293416, aqi: 20 },
  { city: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.1086, pop: 99039, aqi: 27 },
  { city: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868, pop: 400004, aqi: 62 },
  { city: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, pop: 114754, aqi: 45 },
  { city: "Pondicherry", state: "Puducherry", lat: 11.9416, lng: 79.8083, pop: 244377, aqi: 50 },
  { city: "Port Blair", state: "Andaman and Nicobar", lat: 11.6234, lng: 92.7265, pop: 108087, aqi: 32 },
  { city: "Jammu", state: "Jammu and Kashmir", lat: 32.7266, lng: 74.8570, pop: 502197, aqi: 118 },
  { city: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, pop: 451100, aqi: 88 },
  { city: "Ajmer", state: "Rajasthan", lat: 26.4498, lng: 74.6399, pop: 542321, aqi: 105 },
  { city: "Rohtak", state: "Haryana", lat: 28.8955, lng: 76.6066, pop: 374292, aqi: 255 },
  { city: "Hisar", state: "Haryana", lat: 29.1487, lng: 75.7217, pop: 301383, aqi: 240 },
  { city: "Karnal", state: "Haryana", lat: 29.6857, lng: 76.9905, pop: 286827, aqi: 215 },
  { city: "Bathinda", state: "Punjab", lat: 30.2110, lng: 74.9454, pop: 285813, aqi: 165 },
  { city: "Alwar", state: "Rajasthan", lat: 27.5530, lng: 76.6089, pop: 341422, aqi: 145 },
  { city: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642, pop: 310562, aqi: 115 },
  { city: "Tirupur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411, pop: 879578, aqi: 60 },
  { city: "Kollam", state: "Kerala", lat: 8.8932, lng: 76.6141, pop: 349033, aqi: 44 },
  { city: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560, pop: 484785, aqi: 48 }
];

// Helper to determine CPCB AQI Category
function getAqiCategory(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 150) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  return 'Severe';
}

// Generate historical monthly trend data for the last 6 months (Dec 2025 to May 2026)
// Fluctuates based on winter seasonality (winter months Dec-Jan are higher in North/Central)
const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const northStates = ["Delhi", "Haryana", "Punjab", "Uttar Pradesh", "Rajasthan", "Jammu and Kashmir", "Himachal Pradesh", "Uttarakhand", "Chandigarh"];

const processedCities = baseCities.map((c, idx) => {
  const isNorth = northStates.includes(c.state);
  
  // Create historical list
  const historicalAQI = months.map((month) => {
    let factor = 1.0;
    if (isNorth) {
      // Winter peak in Dec/Jan
      if (month === "Dec" || month === "Jan") factor = 1.25;
      else if (month === "Feb") factor = 1.1;
      else if (month === "Mar") factor = 0.95;
      else if (month === "Apr" || month === "May") factor = 0.8;
    } else {
      // Moderate seasonal variation
      if (month === "Dec" || month === "Jan") factor = 1.1;
      else if (month === "May") factor = 0.9;
    }
    
    // Add minor random fluctuation
    const randomVariation = 0.95 + Math.random() * 0.1;
    const computedAqi = Math.round(c.aqi * factor * randomVariation);
    return {
      date: month,
      aqi: Math.max(10, Math.min(500, computedAqi))
    };
  });

  return {
    id: `city-${idx + 1}`,
    city: c.city,
    state: c.state,
    population: c.pop,
    aqi: c.aqi,
    aqiCategory: getAqiCategory(c.aqi),
    latitude: c.lat,
    longitude: c.lng,
    historicalAQI
  };
});

// Calculate Ranking scores:
// Overall Score = (70% AQI Score) + (30% Population Adjusted Sustainability Score)
// AQI Score: 0 is worst (aqi=500), 100 is best (aqi=0) -> Max(0, 100 - (aqi/500)*100)
// Sustainability Score: rewards high population cities that manage low AQI
// Let's formulate: (1 - aqi/500) * (log10(population)) scaled
const maxPop = Math.max(...processedCities.map(c => c.population));
const minPop = Math.min(...processedCities.map(c => c.population));

const scoredCities = processedCities.map(c => {
  const aqiScore = Math.max(0, 100 - (c.aqi / 500) * 100);
  
  // Log population scale between 0.2 and 1.0 to avoid zeroing out small cities
  const logPop = Math.log10(c.population);
  const logMin = Math.log10(minPop);
  const logMax = Math.log10(maxPop);
  const popFactor = 0.2 + 0.8 * ((logPop - logMin) / (logMax - logMin));
  
  // Sustainability score: clean air combined with high population density support
  const sustainabilityScore = aqiScore * popFactor;
  
  const overallScore = 0.7 * aqiScore + 0.3 * sustainabilityScore;

  return {
    ...c,
    overallScore
  };
});

// Sort by overallScore descending to assign ranks
scoredCities.sort((a, b) => b.overallScore - a.overallScore);

// Assign ranks 1 to 100 and clean up temporary overallScore
const finalCities = scoredCities.map((c, index) => {
  const { overallScore, ...cityWithoutScore } = c;
  return {
    ...cityWithoutScore,
    rank: index + 1
  };
});

// Write to files
const outputPath = path.join(__dirname, '..', 'src', 'data', 'cities.json');
const outputDir = path.dirname(outputPath);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(finalCities, null, 2), 'utf-8');
console.log(`Successfully generated ${finalCities.length} cities at ${outputPath}`);
