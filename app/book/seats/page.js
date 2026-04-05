'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '../../../components/Stepper';
import { getBusSeats } from '../../../lib/api';

export default function SeatsPage() {
  const router = useRouter();
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [takenSeats, setTakenSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(45);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedBus = sessionStorage.getItem('nb_bus');
    const storedRoute = sessionStorage.getItem('nb_route');
    if (!storedBus || !storedRoute) { router.push('/book'); return; }

    const busData = JSON.parse(storedBus);
    const routeData = JSON.parse(storedRoute);
    setBus(busData);
    setRoute(routeData);

    getBusSeats(busData._id, routeData.date)
      .then((data) => {
        setTakenSeats(data.takenSeats || []);
        setTotalSeats(data.totalSeats || 45);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleSeatClick = (seatNum) => {
    if (takenSeats.includes(seatNum)) return; // Can't click taken seats
    setSelectedSeat(seatNum === selectedSeat ? null : seatNum);
  };

  const handleContinue = () => {
    if (!selectedSeat) return;
    sessionStorage.setItem('nb_seat', selectedSeat.toString());
    router.push('/book/details');
  };

  // Build rows of 4 seats
  const seatRows = [];
  for (let i = 1; i <= totalSeats; i += 4) {
    const row = [];
    for (let j = i; j < i + 4 && j <= totalSeats; j++) {
      row.push(j);
    }
    seatRows.push(row);
  }

  const getSeatStyle = (seatNum) => {
    if (takenSeats.includes(seatNum)) {
      return 'bg-red-100 border-red-200 text-red-400 cursor-not-allowed';
    }
    if (seatNum === selectedSeat) {
      return 'bg-green-700 border-green-700 text-white cursor-pointer';
    }
    return 'bg-white border-gray-200 text-gray-700 cursor-pointer hover:border-green-700 hover:bg-green-50';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Your Trip</h1>
      <Stepper currentStep={3} />

      <div className="mt-6">
        {/* Back */}
        <button onClick={() => router.push('/book/buses')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Back to buses
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-md">
          <h2 className="font-bold text-gray-900 text-lg mb-3">
            {bus?.name} — Pick Your Seat
          </h2>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border border-gray-200 bg-white"></div>
              <span className="text-xs text-gray-500">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border border-green-700 bg-green-700"></div>
              <span className="text-xs text-gray-500">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border border-red-200 bg-red-100"></div>
              <span className="text-xs text-gray-500">Taken</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              {/* FRONT label */}
              <p className="text-xs text-gray-400 text-center mb-3 tracking-widest">FRONT</p>

              {/* Seat grid */}
              <div className="flex flex-col gap-2">
                {seatRows.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-4 gap-2">
                    {row.map((seatNum) => (
                      <button
                        key={seatNum}
                        onClick={() => handleSeatClick(seatNum)}
                        className={`w-full aspect-square rounded-lg border text-xs font-medium transition-colors ${getSeatStyle(seatNum)}`}
                        disabled={takenSeats.includes(seatNum)}
                      >
                        {seatNum}
                      </button>
                    ))}
                    {/* Fill empty cells in last row */}
                    {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                  </div>
                ))}
              </div>

              {/* BACK label */}
              <p className="text-xs text-gray-400 text-center mt-3 tracking-widest">BACK</p>
            </div>
          )}

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={!selectedSeat}
            className="w-full mt-4 bg-green-700 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedSeat ? `Continue with Seat ${selectedSeat}` : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
