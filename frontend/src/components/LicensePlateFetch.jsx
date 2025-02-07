import React, { useEffect, useState } from "react";

// interface MyComponentProps {
//   licenseplate: string;
//   videofeed: string;
//   licenseNumber: string;
// }

const MyComponent = ({ licenseNumberUrl, userLicenseUrl }) => {
  // Create state for licenseNumber, ownername, paid, slot
  const [licenseNumber, setLicenseNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [slot, setSlot] = useState("");

  useEffect(() => {
    // Log the values passed from Astro (licenseplate, videofeed, and licenseNumber)
    console.log("License Number URL:", licenseNumberUrl);

    fetch(licenseNumberUrl)
      .then((response) => response.json()) // Parse the response
      .then((data) => {
        console.log("fucking data:", data); // Log the entire response
        console.log("fucking data correct:", data.license_plate); // Access license_plate correctly
        setLicenseNumber(data.license_plate);
      })
      .catch((error) => console.error("Error fetching data:", error));

    fetch(userLicenseUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("user data:", data); // Log the entire response
        // console.log("user data correct:", data.license_plate); // Access license_plate correctly
        // setLicenseNumber(data.license_plate);
      })
      .catch((error) => console.error("Error fetching data:", error));

    // fetchLicensePlate();
    // Example: you could fetch data or take some action based on these values
  }, [licenseNumberUrl, userLicenseUrl]);

  // useEffect(() => {
  //   // Log the values passed from Astro (licenseplate, videofeed, and licenseNumber)
  //   console.log("userlicense URL:", userLicenseUrl);
  //
  //   fetch(userLicenseUrl, {
  //     method: "GET", // Use POST method
  //     headers: {
  //       "Content-Type": "application/json", // Tell the server we're sending JSON
  //     },
  //     body: JSON.stringify({
  //       number_plate: licenseNumber, // Your number plate data
  //     }),
  //   })
  //     .then((response) => response.json()) // Parse JSON response
  //     .then((data) => {
  //       console.log("User data:", data); // Log the entire response
  //       // If you want to access specific data:
  //       // console.log("User license plate:", data.number_plate);
  //       // setLicenseNumber(data.number_plate); // Assuming this sets the license plate in state or UI
  //     })
  //     .catch((error) => console.error("Error fetching data:", error));
  //
  //   // fetchLicensePlate();
  //   // Example: you could fetch data or take some action based on these values
  // }, [licenseNumber]);
  //
  async function fetchLicensePlate() {
    // GET request using fetch with async/await
    const response = await fetch("https://api.npms.io/v2/search?q=react");
    const data = await response.json();

    console.log("data: ", data);
    return data;
  }

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <form className="flex flex-col bg-white rounded shadow-lg p-12" action="">
      <div className="flex flex-row gap-x-12 justify-baseline items-baseline">
        <label className="font-semibold text-xl" htmlFor="plate">
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
      <label className="font-semibold text-xl mt-3" htmlFor="ownername">
        Owner Name
      </label>
      <input
        className="flex items-center h-12 px-4 w-64 bg-gray-200 mt-2 rounded focus:outline-none focus:ring-2"
        name="ownername"
        type="text"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
      />

      <label className="font-semibold text-xl mt-8" htmlFor="paid">
        Paid
      </label>
      <label className="relative inline-flex items-center cursor-pointer my-4">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="sr-only peer"
        />
        <div className="group border border-gray-600  shadow-inner shadow-gray-900 peer ring-0  bg-gradient-to-tr from-rose-100 via-rose-400 to-rose-500  rounded-full outline-none duration-300 after:duration-300 w-24 h-12  shadow-md peer-checked:bg-emerald-500  peer-focus:outline-none  after:content-['✖️']  after:rounded-full after:absolute after:bg-gray-50 after:border after:border-gray-600 after:outline-none after:h-10 after:w-10 after:top-1 after:left-1 after:-rotate-180 after:flex after:justify-center after:items-center peer-checked:after:translate-x-12 peer-checked:after:content-['✔️'] peer-hover:after:scale-95 peer-checked:after:rotate-0 peer-checked:bg-gradient-to-tr peer-checked:from-green-100 peer-checked:via-lime-400 peer-checked:to-lime-500"></div>
      </label>

      <label className="font-semibold text-xl mt-3" htmlFor="slot">
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
