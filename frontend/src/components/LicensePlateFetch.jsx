import React, { useEffect } from "react";

// interface MyComponentProps {
//   licenseplate: string;
//   videofeed: string;
//   licenseNumber: string;
// }

const MyComponent = ({ licenseNumberUrl }) => {
  // Create state for licenseNumber, ownername, paid, slot
  const [licenseNumber, setLicenseNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [paid, setPaid] = useState(false);
  const [slot, setSlot] = useState(false);

  useEffect(() => {
    // Log the values passed from Astro (licenseplate, videofeed, and licenseNumber)
    console.log("License Number URL:", licenseNumberUrl);

    // Example: you could fetch data or take some action based on these values
  }, [licenseNumberUrl]);

  function handlePaidChange(value) {
    if (value == "yes" || value == "Yes") {
      setPaid(true);
    } else {
      setPaid(false);
    }
  }

  return (
    <form className="flex flex-col bg-white rounded shadow-lg p-12" action="">
      <div className="flex flex-row gap-x-12 justify-baseline items-baseline">
        <label className="font-semibold text-xs" htmlFor="plate">
          Number Plate
        </label>

        <button
          type="submit"
          className="flex items-center justify-center w-fit px-4 py-2 bg-gray-200 text-black mt-8 rounded-4xl font-semibold text-sm hover:text-white hover:bg-blue-700"
        >
          Refresh ⟳
        </button>
      </div>

      <input
        className="flex items-center h-12 px-4 w-64 bg-gray-200 mt-2 rounded focus:outline-none focus:ring-2"
        name="plate"
        type="text"
        value={licenseNumber}
        onChange={(e) => setLicenseNumber(e.target.value)}
        // defaultValue={licenseplate}
      />

      <label className="font-semibold text-xs mt-3" htmlFor="ownername">
        Owner Name
      </label>
      <input
        className="flex items-center h-12 px-4 w-64 bg-gray-200 mt-2 rounded focus:outline-none focus:ring-2"
        name="ownername"
        type="text"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
      />

      <label className="font-semibold text-xs mt-3" htmlFor="paid">
        Paid
      </label>
      <input
        className="flex items-center h-12 px-4 w-64 bg-gray-200 mt-2 rounded focus:outline-none focus:ring-2"
        name="paid"
        type="text"
        value={paid}
        onChange={(e) => handlePaidChange(e.target.value)}
      />

      <label className="font-semibold text-xs mt-3" htmlFor="slot">
        Parking Slot
      </label>
      <input
        className="flex items-center h-12 px-4 w-64 bg-gray-200 mt-2 rounded focus:outline-none focus:ring-2"
        name="slot"
        type="text"
        value={slot}
        onChange={(e) => setSlot(e.target.value)}
      />

      <button className="flex items-center justify-center h-12 px-6 w-64 bg-blue-600 mt-8 rounded font-semibold text-sm text-blue-100 hover:bg-blue-700">
        Check in
      </button>
    </form>
  );
};

export default MyComponent;
