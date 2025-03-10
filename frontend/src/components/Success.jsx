import jsPDF from "jspdf"; // to generate a pdf for receipt

// this is the payment success page which gets redirected during a successful payment
const Success = () => {
  // getting url query parameters in browser
  const searchParams = new URLSearchParams(window.location.search);

  // The URLSearchParams() constructor takes in a query string as an argument and returns a URLSearchParams object that has methods to work with query strings. You can use the window.location.search property to access the query string of the current page and pass it as an argument to the URLSearchParams() constructor

  // Refer this https://sentry.io/answers/how-to-get-values-from-urls-in-javascript/#:~:text=The%20get()%20method%20returns,for%20a%20given%20query%20parameter.

  const slot = searchParams.get("slot");
  const amount = searchParams.get("amount");
  const transactionId = searchParams.get("order_id")

}

