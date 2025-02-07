import { useState } from "react";

const MyComponent = ({ userUrl }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target); // Get the FormData from the form

    // Extract email and password from FormData
    // const email = String(localStorage.getItem("email")); // Convert to string explicitly
    // const password = String(localStorage.getItem("password")); // Convert to string explicitly
    const email = String(formData.get("email")); // Convert to string explicitly
    const password = String(formData.get("password")); // Convert to string explicitly

    const paid = String(formData.get("paid")); // Convert to string explicitly
    const number_plate = String(formData.get("number_plate")); // Convert to string explicitly
    const booked_parking_slots = String(formData.get("booked")); // Convert to string explicitly

    // Example logging
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("paid:", paid);
    console.log("number_plate:", number_plate);
    console.log("booked_parking_slots:", booked_parking_slots);

    const data = {
      email: email,
      password: password,
      paid: paid,
      number_plate: number_plate,
      booked_parking_slots: booked_parking_slots,
    };

    // Send data to backend
    try {
      const response = await fetch(userUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Send form data to backend
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setSuccessMessage("User registered successfully!");
        alert(successMessage);
        window.location = "/";
      } else {
        setErrorMessage("Failed to register user.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while registering.");
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 max-w">
            Or
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create an account
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="paid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Paid
                </label>
                <div className="mt-1">
                  <input
                    id="paid"
                    name="paid"
                    type="text"
                    // autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Paid or Not / true or false"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="number_plate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Number Plate
                </label>
                <div className="mt-1">
                  <input
                    id="number_plate"
                    name="number_plate"
                    type="text"
                    // autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your car Number Plate"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="booked_parking_slots"
                  className="block text-sm font-medium text-gray-700"
                >
                  Desired Parking Slot
                </label>
                <div className="mt-1">
                  <input
                    id="booked_parking_slots"
                    name="booked_parking_slots"
                    type="booked_parking_slots"
                    // autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your Desired Parking Slot"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Update User Details
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-100 text-gray-500"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Conditional rendering of error and success messages */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default MyComponent;
