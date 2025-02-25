import { useEffect, useState } from "react";
import Loading from 'react-simple-loading'

const Parking = () => {
  const [parkingslots, setparkingslots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchslots = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8004/parkingData")
        const data = await response.json();
        setparkingslots(data.slots);
        setLoading(false);
      } catch (error) {
        console.error("Fetching parking slots failed:", error);
        setLoading(false);
      }
      };

    fetchslots();
    }, []);

  return (
    <div className="flex flex-col items-center bg-gray-900 text-white min-h-screen p-4">
    <h1 className="text-xl font-bold mb-4">Parking Slot</h1>
    <div className="flex gap-4 mb-8">
    <button className="px-3 py-2 bg-yellow-500 text-black rounded-md text-sm font-medium"> G Floor
    </button>

    <button className="px-3 py-2 bg-gray-800 rounded-md text-sm hover:bg-gray-700">
    1st Floor
    </button>

    <button className="px-3 py-2 bg-gray-800 rounded-md text-sm hover:bg-gray-700">
    2nd Floor
    </button>

    <button className="px-3 py-2 bg-gray-800 rounded-md text-sm hover:bg-gray-700">
    3rd Floor
    </button>
    </div>
{loading ? (
        <div> <Loading /> </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 w-full max-w-6xl">
          {/* Column A Slots */}
          <div className="flex flex-col gap-6 justify-self-start">
            {parkingslots
              .filter((slot) => slot.slot_id.startsWith("A"))
              .map((slot) => (
                <div
                  key={slot.slot_id}
                  className={`flex flex-col items-center justify-center border border-dotted w-32 h-20 p-4 cursor-pointer ${
                    slot.slot_status
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                 {slot.slot_status ? (
                    <img
                      src="/car.jpg"
                      alt="Car"
                      className="w-10 h-10 object-cover"
                    />
                  ) : null}
                  <span className="mt-2 text-sm">{slot.slot_id}</span>
                </div>
              ))}
          </div>

          {/* Middle Dashed Line */}
          <div className="flex justify-center items-center">
            <div className="h-full border-2 border-dashed"></div>
          </div>

          {/* Column B Slots */}
          <div className="flex flex-col gap-6 justify-self-end">
            {parkingslots
              .filter((slot) => slot.slot_id.startsWith("B"))
              .map((slot) => (
                <div
                  key={slot.slot_id}
                  className={`flex flex-col items-center justify-center border border-dotted w-32 h-20 p-4 cursor-pointer ${
                    slot.slot_status
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {slot.slot_status ? (
                    <img src="/car.jpg" alt="Car" className="w-10 h-10" />
                  ) : null}
                  <span className="mt-2 text-sm">{slot.slot_id}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};


export default Parking;
