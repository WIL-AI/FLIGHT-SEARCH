export interface Flight {
  id: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  prices: {
    economy: number;
    economy_plus: number;
    business: number;
  };
  bestValueScore?: number;
}

const AIRLINES = ['Lufthansa', 'Delta', 'United Airlines', 'Air France', 'British Airways', 'Emirates', 'Qatar Airways'];

export const REGIONS: Record<string, string[]> = {
  'Deutschland': ['FRA', 'MUC', 'BER', 'DUS', 'HAM', 'STR', 'CGN'],
  'Norddeutschland': ['HAM', 'BRE', 'HAJ', 'BER'],
  'Süddeutschland': ['MUC', 'STR', 'NUE', 'FDH'],
  'USA': ['JFK', 'LAX', 'ORD', 'ATL', 'SFO', 'MIA', 'MCO'],
  'Florida': ['MIA', 'MCO', 'TPA', 'FLL'],
  'Europa': ['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO'],
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function generateFlight(fromAirport: string, toAirport: string, dateStr: string): Flight {
  const airline = AIRLINES[getRandomInt(0, AIRLINES.length - 1)];
  const stops = getRandomInt(0, 3);
  
  // Base flight duration (e.g., cross-atlantic)
  const isIntercontinental = (['USA', 'Florida'].includes(toAirport) && !['USA', 'Florida'].includes(fromAirport)) || 
                             (['USA', 'Florida'].includes(fromAirport) && !['USA', 'Florida'].includes(toAirport));
  
  let baseDuration = isIntercontinental ? getRandomInt(480, 840) : getRandomInt(60, 240); // in minutes
  
  // Add time for stops (approx 1-3 hours per stop)
  baseDuration += stops * getRandomInt(60, 180);
  
  // Base pricing
  const basePrice = isIntercontinental ? getRandomInt(350, 1200) : getRandomInt(50, 400);
  const ecoPrice = basePrice * (1 + (stops === 0 ? 0.3 : 0)); // Non-stop is typically more expensive
  
  // Departure Time
  const depHour = getRandomInt(5, 22);
  const depMin = getRandomInt(0, 59);
  
  const depDateObj = new Date(dateStr);
  depDateObj.setHours(depHour, depMin, 0);
  
  const arrDateObj = new Date(depDateObj.getTime() + baseDuration * 60000);

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: generateId(),
    airline,
    departureAirport: fromAirport,
    arrivalAirport: toAirport,
    departureTime: `${formatTime(depDateObj)}`, // Simplification for UI
    arrivalTime: `${formatTime(arrDateObj)} (${baseDuration >= 1440 ? '+1' : '0'})`, 
    durationMinutes: baseDuration,
    stops,
    prices: {
      economy: Math.round(ecoPrice),
      economy_plus: Math.round(ecoPrice * 1.4),
      business: Math.round(ecoPrice * 3.5),
    }
  };
}

function getAirportsForQuery(query: string): string[] {
  // If exact match in regions map
  const exactRegionMatch = Object.keys(REGIONS).find(r => r.toLowerCase() === query.toLowerCase());
  if (exactRegionMatch) return REGIONS[exactRegionMatch];
  
  // Assume it's an airport code or pass directly
  return [query.toUpperCase()];
}

export function searchMockFlights(fromQuery: string, toQuery: string, dateStr: string, flexDays: boolean): Flight[] {
  if (!fromQuery || !toQuery || !dateStr) return [];

  const fromAirports = getAirportsForQuery(fromQuery.trim());
  const toAirports = getAirportsForQuery(toQuery.trim());
  
  let flights: Flight[] = [];
  
  // Determine dates
  let datesToSearch = [dateStr];
  if (flexDays) {
    const mainDate = new Date(dateStr);
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const flexDate = new Date(mainDate);
      flexDate.setDate(flexDate.getDate() + i);
      datesToSearch.push(formatDate(flexDate));
    }
  }

  // Generate for all combinations
  fromAirports.forEach(from => {
    toAirports.forEach(to => {
      datesToSearch.forEach(d => {
        // Generate 1-5 flights per combo route/date
        const numToGenerate = getRandomInt(1, 5);
        for(let i=0; i<numToGenerate; i++) {
           flights.push(generateFlight(from, to, d));
        }
      });
    });
  });

  // Calculate Best Value Score
  if (flights.length > 0) {
    const minPrice = Math.min(...flights.map(f => f.prices.economy));
    const minDuration = Math.min(...flights.map(f => f.durationMinutes));

    flights = flights.map(f => {
      const priceScore = (minPrice / f.prices.economy) * 100;
      const durationScore = (minDuration / f.durationMinutes) * 100;
      
      let stopsScore = 0;
      if (f.stops === 0) stopsScore = 100;
      else if (f.stops === 1) stopsScore = 60;
      else if (f.stops === 2) stopsScore = 20;
      
      const bestValueScore = (priceScore * 0.4) + (durationScore * 0.4) + (stopsScore * 0.2);
      
      return {
        ...f,
        bestValueScore: parseFloat(bestValueScore.toFixed(2))
      };
    });
  }

  return flights;
}
