import jsPDF from "jspdf"; // to generate a pdf for receipt
import { useState } from "react";
import Popup from 'reactjs-popup';
import { QRCodeCanvas } from "qrcode.react";

// this is the payment success page which gets redirected during a successful payment
const Success = () => {

  const [ispopup, setpopup] = useState(false);
  // getting url query parameters in browser
  const searchParams = new URLSearchParams(window.location.search);

  // The URLSearchParams() constructor takes in a query string as an argument and returns a URLSearchParams object that has methods to work with query strings. You can use the window.location.search property to access the query string of the current page and pass it as an argument to the URLSearchParams() constructor

  // Refer this https://sentry.io/answers/how-to-get-values-from-urls-in-javascript/#:~:text=The%20get()%20method%20returns,for%20a%20given%20query%20parameter.

  const slot = searchParams.get("slot");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("order_id")
  const transactionId = orderId.substring(6)
  const hours = searchParams.get("hours")
  const name = "Kumar Vetrivel"

  return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Payment Successful! 🎉</h1>
            <p>Transaction ID: {transactionId}</p>
            <p>Amount Paid: ₹{amount}</p>

            {/* Button to generate receipt as PDF */}
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
   onClick={() => setpopup(true)} >
                Generate Receipt
            </button>

  <Popup open={ispopup} onClose={() => setpopup(false)} position="right center"         >
        <div className="p-4 bg-white text-black text-center border-2 border-gray-300 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-2">Name: {name}</h2>
          <h2 className="text-lg font-bold mb-2">Slot no: {slot}</h2>

          <h2 className="text-lg font-bold mb-2">Duration: {hours} hr</h2>

          <h2 className="text-lg font-bold mb-2">Amount: ₹ {amount}</h2>

          <h2 className="text-lg font-bold mb-2">Transaction ID: {transactionId}</h2>

    <div className="flex justify-center my-4 p-2 border border-gray-400 rounded-md">
    <QRCodeCanvas
    value={`Verified parking slot ✅\nName: ${name}\nSlot no: ${slot}\nDuration: ${hours}`}
    size={150}
    bgColor={"#ffffff"}
    fgColor={"#000000"}
    level={"H"}
    />
    </div>

<div className="flex justify-between mt-4 gap-3">
          <button
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md"
            onClick={() =>{ setpopup(false) } }
          >
            Close
          </button>

          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Dowload
          </button>
        </div>
</div>
      </Popup>

        </div>
    );
};


export default Success;

