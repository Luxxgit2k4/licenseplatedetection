import { useEffect, useState } from "react";
import Loading from 'react-simple-loading'// Package for the loading animation
import Popup from 'reactjs-popup'; // package for the pop up menu
// import { useNavigate } from "react-router";
import 'reactjs-popup/dist/index.css';

const Parking = () => {

// const navigate = useNavigate();


// initially the slots are empty and using useState we are updating by fetching it from the database
  const [parkingslots, setparkingslots] = useState([]);

  // this usestate will show the loading animation while fetching the slots data
  const [loading, setLoading] = useState(true);

  // this usestate is for selecting the empty slots
  const [selectslot, setselectslot] = useState(null);

  // this usestate is for the Popup menu after selecting a slot
  const [ispopup, setpopup] = useState(false);

  // this usestate is for increasing the hours
  const [hours, setHours] = useState(1);

  const rate = 50; // to calculate the parking when hours is increased or decreased

  // useeffect for fetching the data and updating the DOM based on the slots available
  useEffect(() => {
    const fetchslots = async () => {
      try {
        const response = await fetch("http://parkspace.tunnel.bupd.xyz/parkingData")
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
    const interval = setInterval(fetchslots,6000); // For real time update of the available slots
    return () => clearInterval(interval)
    }, []);

  const slotselection = (slot_no) => {
    setselectslot(slot_no);
    setpopup(true);
    setHours(1); // sets hour to default value of 1
    console.log(`Selected slot ${slot_no}`)
  };

// this useEffect is for the opening the popup of razorpay checkout by appending script tag when an order is created to the razorpay server.
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);

  // to increase the number of hours for the parking payment
  const increasehours = () => setHours((prev) => Math.min(prev + 1, 24));
// to decrease the number of hours for the paring payment
  const decreasehours = () => setHours((prev) => Math.max(prev - 1, 1));

    const payment = async (e) => {

      // used to create an order with selected slot and amount after creating an order it opens the razorpay checkout menu. Wrote this by referring this https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#api-sample-code

      e.preventDefault();
try {
    const amount = rate * hours * 100; // the rupees is converted into paise as razorpay accepts only in paise but to the user it is shown as rupees
    const currency = "INR";
    const receipt = `receipt_${Date.now()}`;

// giving a post request to the razorpay server to create an order with the selected amount

    const response = await fetch("http://localhost:8007/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, receipt }),
    });
          const order = await response.json();
          console.log("Order created successfully !!...")
          console.log(order)

// after creating an order to the razorpay the razorpay opens which sends a request to the parking slot database by updating the is_booked status to true of the selected slot which changes the colour of the booked slot and makes it not able to select by the other user

  await fetch(`http://parkspace.tunnel.bupd.xyz/parkingData/${selectslot}/bookslot`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_booked: true }),
    });

  const options = {
    key: "rzp_test_a34HlK9mdp7A4M",
    amount: amount,
    currency: currency,
    name: "Kumar Parking Limited",
    description: `Selected slot - ${selectslot}`,
    order_id: order.id,
    callback_url: `http://localhost:8007/payment-success?slot=${selectslot}&hours=${hours}&amount=${amount / 100}&order_id=${order.id}`, // razorpay has a default callback_url option which sends a post request automatically to the specified url and redirects to that url after a successful payment
    redirect: true,

    // handler function to verify whether the payment is valid or not by giving a post request to the verify-payment route and it saves the payment in the razorpay dashboard

    handler: async function (response) {
      const body = {
        ...response, slot: selectslot, hours, amount: amount / 100
      };

      const validateRes = await fetch("http://localhost:8007/verify-payment", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const jsonRes = await validateRes.json();
      console.log(jsonRes)

       /* setpopup(false);  // closes the pop up while redirecting after payment success
        setselectslot(null); // deselects the slot after redirection */

      // if (jsonRes.success) {
      //   navigate("/success", { state: body});
      // }
      },

    // the modal is an inbuilt options of the razorpay which triggers a certain function when the payment is cancelled here the is_booked status of the selected slot is updated to false again so the colour changes back to normal hence othe user can select the parking slot
       modal: {
        ondismiss: async function () {
          console.log("User closed Razorpay, marking slot as available...");
          await fetch(`http://parkspace.tunnel.bupd.xyz/parkingData/${selectslot}/bookslot`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_booked: false }),
          });
        },
      },

      prefill: {
        name: "UserName",
        email: "user@example.com",
        contact: "9999999999",
      },
      theme: { color: "#3399cc" },
    };

    const razor = new window.Razorpay(options);
    razor.open();

  } catch (error) {
    console.error("Error creating order or payment:", error);
  }
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

                               className={`flex flex-col items-center justify-center border border-dotted w-32 h-20 p-4 cursor-pointer ${
                    slot.slot_status
                      ? "bg-gray-700 cursor-not-allowed"
                      : slot.is_booked
                      ? "bg-yellow-700 cursor-not-allowed"
                      : slot.slot_id === selectslot
                      ? "bg-blue-300"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
 onClick={() =>{
                 if (!slot.slot_status && !slot.is_booked)
   slotselection(slot.slot_id)}
}
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

                  className={`flex flex-col items-center justify-center border border-dotted w-32 h-20 p-4 cursor-pointer ${
                    slot.slot_status
                      ? "bg-gray-700 cursor-not-allowed"
                      : slot.is_booked
                      ? "bg-yellow-700 cursor-not-allowed"
                      : slot.slot_id === selectslot
                      ? "bg-blue-300"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}

               onClick={() =>{

                 if (!slot.slot_status && !slot.is_booked)
   slotselection(slot.slot_id)} }
                >
                  {slot.slot_status ? (
                    <img src="/car.jpg" alt="Car" className="w-10 h-10" />
                  ) : null}
                  <span className="mt-2 text-sm">{slot.slot_id}</span>
                </div>
              ))}
          </div>

   {/* Using react popup component for popup while selecting a empty slot refer this line https://react-popup.elazizi.com/getting-started/ */}

        <Popup open={ispopup} onClose={() => setpopup(false)} position="right center"         >
        <div className="p-4 bg-gray-700 text-white text-center">
          <h2 className="text-lg font-bold mb-2">Slot Selected</h2>
          <h2 className="text-sm">You have selected slot <strong>{selectslot}</strong></h2>
 <p className="text-sm mt-2">Parking charge ₹50 per hour</p>

   <div className="flex items-center justify-center gap-4 mt-2">
            <button className="bg-gray-600 px-3 py-2 rounded" onClick={decreasehours}>-</button>
            <span className="text-lg font-bold">{hours} hr</span>
            <button className="bg-gray-600 px-3 py-2 rounded" onClick={increasehours}>+</button>
          </div>

          <h2 className="text-xl font-bold mt-2">₹{rate * hours}</h2>

<div className="flex justify-between mt-4 gap-3">
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={() =>{ setpopup(false);
            setselectslot(null);} }
          >
            Close
          </button>

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={payment}
          >
            Book
          </button>
        </div>
</div>
      </Popup>

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
