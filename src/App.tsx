import React, { useState, useMemo } from 'react';
import './index.css';
import { searchMockFlights, type Flight } from './mockData';

type SortOption = 'best' | 'cheapest' | 'fastest';
type FlightClass = 'economy' | 'economy_plus' | 'business';

function App() {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [flexDays, setFlexDays] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState<FlightClass>('economy');
  
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Flight[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('best');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromQuery || !toQuery || !dateStr) {
      alert("Bitte fülle Von, Nach und Hinflug aus.");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate network delay for effect
    setTimeout(() => {
      const flights = searchMockFlights(fromQuery, toQuery, dateStr, flexDays);
      setResults(flights);
      setIsSearching(false);
    }, 1500);
  };

  const sortedResults = useMemo(() => {
    const list = [...results];
    switch (sortOption) {
      case 'best':
        return list.sort((a, b) => (b.bestValueScore || 0) - (a.bestValueScore || 0));
      case 'cheapest':
        return list.sort((a, b) => a.prices[flightClass] - b.prices[flightClass]);
      case 'fastest':
        return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
      default:
        return list;
    }
  }, [results, sortOption, flightClass]);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formatCurrency = (amount: number) => {
    // Total price = price per passenger * number of passengers
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount * passengers);
  };

  return (
    <div className="min-h-screen">
      <header className="hero-gradient text-center">
        <div className="container">
          <h1 className="text-2xl mb-4" style={{ fontSize: '2.5rem', fontWeight: 800 }}>AeroSearch Premium</h1>
          <p className="text-muted text-lg mb-8">Entdecke deine nächste Reise mit unübertroffener Flexibilität.</p>
          
          <form onSubmit={handleSearch} className="card glass-panel text-left w-full mx-auto" style={{ maxWidth: '900px' }}>
            <div className="flex flex-col gap-6">
              
              {/* Top Row: Origin & Destination */}
              <div className="flex gap-4">
                <div className="input-group w-full">
                  <label className="label">Von (z.B. Deutschland, Norddeutschland, BER)</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Abflugort" 
                    value={fromQuery}
                    onChange={(e) => setFromQuery(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group w-full">
                  <label className="label">Nach (z.B. USA, Florida, MIA)</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Zielort" 
                    value={toQuery}
                    onChange={(e) => setToQuery(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Middle Row: Dates */}
              <div className="flex gap-4 items-center">
                <div className="input-group w-full">
                  <label className="label">Hinflug</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group w-full">
                  <label className="label">Rückflug (Optional)</label>
                  <input type="date" className="input" />
                </div>
                <div className="flex items-center gap-2 mt-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    id="flexi-dates" 
                    checked={flexDays}
                    onChange={(e) => setFlexDays(e.target.checked)}
                  />
                  <label htmlFor="flexi-dates" className="label" style={{ margin: 0, cursor: 'pointer' }}>+/- 3 Tage flexibel</label>
                </div>
              </div>

              {/* Bottom Row: Passengers & Class & Button */}
              <div className="flex gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <div className="input-group">
                    <label className="label">Passagiere</label>
                    <select 
                      className="select" 
                      value={passengers} 
                      onChange={(e) => setPassengers(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="label">Klasse</label>
                    <select 
                      className="select"
                      value={flightClass}
                      onChange={(e) => setFlightClass(e.target.value as FlightClass)}
                    >
                      <option value="economy">Economy</option>
                      <option value="economy_plus">Economy Plus</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary mt-4" disabled={isSearching}>
                  {isSearching ? 'Suche...' : 'Flüge finden'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </header>

      <main className="container mt-8 pb-8" style={{ maxWidth: '900px' }}>
        {!hasSearched && !isSearching && (
          <div className="text-center text-muted mt-8">
            <h2 className="text-xl mb-2">Wohin soll die Reise gehen?</h2>
            <p>Gib deine Reisedaten ein, um die besten Flüge zu finden.</p>
          </div>
        )}

        {isSearching && (
          <div className="text-center mt-8 animate-fade-in">
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p className="mt-4 text-muted">Durchsuche hunderte Verbindungen...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {hasSearched && !isSearching && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{sortedResults.length} Flüge gefunden</h2>
              
              <div className="flex gap-2">
                <button 
                  className={`btn ${sortOption === 'best' ? 'btn-primary' : 'btn-secondary'} text-sm`} 
                  style={{ padding: '0.4rem 1rem' }}
                  onClick={() => setSortOption('best')}
                >
                  Beste (Score)
                </button>
                <button 
                  className={`btn ${sortOption === 'cheapest' ? 'btn-primary' : 'btn-secondary'} text-sm`} 
                  style={{ padding: '0.4rem 1rem' }}
                  onClick={() => setSortOption('cheapest')}
                >
                  Günstigste
                </button>
                <button 
                  className={`btn ${sortOption === 'fastest' ? 'btn-primary' : 'btn-secondary'} text-sm`} 
                  style={{ padding: '0.4rem 1rem' }}
                  onClick={() => setSortOption('fastest')}
                >
                  Kürzeste
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {sortedResults.map((flight, index) => (
                <div key={flight.id} className="card flex items-center justify-between" style={{ animationDelay: `${index * 50}ms` }}>
                  
                  {/* Airline & Times */}
                  <div className="flex items-center gap-6" style={{ flex: 2 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg-color), var(--border-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {flight.airline.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <div className="flex items-center gap-4 w-full">
                      <div className="text-right">
                        <div className="text-xl font-bold">{flight.departureTime}</div>
                        <div className="text-muted text-sm">{flight.departureAirport}</div>
                      </div>
                      
                      <div className="flex flex-col items-center flex-1" style={{ minWidth: '100px' }}>
                        <div className="text-xs text-muted mb-1">{formatDuration(flight.durationMinutes)}</div>
                        <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--surface-color)', padding: '0 4px', fontSize: '0.7rem', color: flight.stops === 0 ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                            {flight.stops === 0 ? 'Direkt' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xl font-bold">{flight.arrivalTime}</div>
                        <div className="text-muted text-sm">{flight.arrivalAirport}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Selection */}
                  <div className="flex flex-col items-end gap-2" style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', marginLeft: '1.5rem' }}>
                    <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {flightClass.replace('_', ' ')} • {passengers} {passengers > 1 ? 'Personen' : 'Person'}
                    </div>
                    <div className="text-2xl font-bold text-primary-color">
                      {formatCurrency(flight.prices[flightClass])}
                    </div>
                    
                    <button className="btn btn-primary w-full mt-2" style={{ padding: '0.5rem' }}>
                      Auswählen
                    </button>
                    
                    {sortOption === 'best' && flight.bestValueScore && (
                      <div className="text-xs mt-1" style={{ color: flight.bestValueScore > 85 ? '#10b981' : 'var(--text-secondary)' }}>
                        Best Value Score: {flight.bestValueScore} / 100
                      </div>
                    )}
                  </div>

                </div>
              ))}
              
              {sortedResults.length === 0 && (
                <div className="text-center p-8 border border-dashed border-color rounded-lg text-muted">
                  Für diese Reisedaten konnten keine Flüge gefunden werden.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
