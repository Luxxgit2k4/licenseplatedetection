import jsPDF from "jspdf"; // to generate a pdf for receipt
import { useRef, useState } from "react";
import Popup from 'reactjs-popup';
import { QRCodeCanvas } from "qrcode.react"; // for qr code generation
// refer this https://zpao.github.io/qrcode.react/ for QRCodeCanvas code
import "../assets/fonts/Roboto-VariableFont_wdth,wght-normal.js" // importing roboto font for the pdf section

// this is the payment success page which gets redirected during a successful payment
const Success = () => {

  const [ispopup, setpopup] = useState(false);
  const qrRef = useRef(null) // creating a reference to store the qr code
  // getting url query parameters in browser
  const searchParams = new URLSearchParams(window.location.search);

  // The URLSearchParams() constructor takes in a query string as an argument and returns a URLSearchParams object that has methods to work with query strings. You can use the window.location.search property to access the query string of the current page and pass it as an argument to the URLSearchParams() constructor

  // Refer this https://sentry.io/answers/how-to-get-values-from-urls-in-javascript/#:~:text=The%20get()%20method%20returns,for%20a%20given%20query%20parameter.

  // getting the values from the parameters
  const slot = searchParams.get("slot");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("order_id")
  const transactionId = orderId.substring(6)
  const hours = searchParams.get("hours")
  const name = "Kumar Vetrivel"

// download function for generating a pdf and downloading it
 const download = () => {
    const pdf = new jsPDF("p", "mm", "a4"); // setting the pdf to potrait mode, size is a4 and the measurements is  taking in millimeters
 pdf.addFont("Roboto-VariableFont_wdth,wght-normal.ttf", "Roboto", "normal");
    pdf.setFont("Roboto", "normal");
    pdf.setFontSize(18);
    pdf.text("Parking Receipt", 80, 20); // adds the text and moves it 80mm from the left and 20mm from the top

    pdf.setFontSize(15);
    pdf.setFont("Roboto", "normal");
    pdf.text(`Name: ${name}`, 20, 40);
    pdf.text(`Slot No: ${slot}`, 20, 50);
    pdf.text(`Duration: ${hours} hr`, 20, 60);
pdf.text(`Amount Paid: ₹ ${amount}`, 20, 70);
    pdf.text(`Transaction ID: ${transactionId}`, 20, 80);

   // the qrRef.current refers to the div that has the qr code and the queryselector finds the canvas element inside the div and stores the qr code in qrCanvas variable
    const qrCanvas = qrRef.current.querySelector("canvas");

   // converting the qrcode to image and adding to the pdf
    const qrImage = qrCanvas.toDataURL("image/png");
    pdf.addImage(qrImage, "PNG", 20, 100, 40, 40); // the dimensions of the qr code is 40*40 in mm

   // after adding the texts and images this saves and downloads the pdf
    pdf.save(`Parking_Receipt_${transactionId}.pdf`);
  };



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

    <div ref={qrRef} className="flex justify-center my-4 p-2 border border-gray-400 rounded-md">
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
    onClick={download}
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

