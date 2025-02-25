import { useEffect, useState } from "react";
import Loading from 'react-simple-loading' // Package for the loading animation

const Parking = () => {
// initially the slots are empty and using useState we are updating by fetching it from the database

  const [parkingslots, setparkingslots] = useState([]);
  // this usestate will show the loading animation while fetching the slots data
  const [loading, setLoading] = useState(true);
  // this usestate is for selecting the empty slots
  const [selectslot, setselectslot] = useState(null);

  // useeffect for fetching the data and updating the DOM based on the slots available
  useEffect(() => {
    const fetchslots = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8004/parkingData")
        const data = await response.json();
        setparkingslots(data.slots);
        setLoading(false); // the loading animation will stop when the data has been fetched
        console.log("Fetched parking slots successfully...")
      } catch (error) {
        console.error("Fetching parking slots failed:", error);
        setLoading(false);
      }
      };

    fetchslots();
    const interval = setInterval(fetchslots,5000); // For real time update of the available slots
    return () => clearInterval(interval)
    }, []);

  const slotselection = (slot_no) => {
    setselectslot(slot_no);
    alert(`Selected slot ${slot_no}`);
    console.log(`Selected slot ${slot_no}`)
  };

  return (

    <div className="flex flex-col items-center bg-gray-900 text-white min-h-screen p-4">
   {/* These are the headers with fucking floor buttons */}
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
    {/* this is the loading animation which runs from that package, we can set the colour if you want refer this link https://www.npmjs.com/package/react-simple-loading */}
{loading ? (
        <div> <Loading /> </div>
      ) : (

        <div className="grid grid-cols-3 gap-6 w-full max-w-6xl">
  {/* Grid with three columns for Slot A and the roadlike border then at last Slot B */}
  {/* The following one is A slot mapping  */}
          <div className="flex flex-col gap-6 justify-self-start">
            {parkingslots
              .filter((slot) => slot.slot_id.startsWith("A"))
              .map((slot) => (
                <div
                  key={slot.slot_id}

                onClick={() => !slot.slot_status && slotselection(slot.slot_id)}
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


  {/* The following one is the road like border */}
          <div className="flex justify-center items-center">
            <div className="h-full border-2 border-dashed"></div>
          </div>


  {/* The following one is B slot mapping  */}
          <div className="flex flex-col gap-6 justify-self-end">
            {parkingslots
              .filter((slot) => slot.slot_id.startsWith("B"))
              .map((slot) => (
                <div
                  key={slot.slot_id}

                onClick={() => !slot.slot_status && slotselection(slot.slot_id)}
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

  <footer>
<button class="mt-6 px-32 py-4 bg-sky-500 text-black rounded-md text-sm font-medium hover:bg-yellow-400">
      Book
</button>
  </footer>
    </div>
  );
};


export default Parking;
