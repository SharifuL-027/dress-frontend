import { RouterProvider } from "react-router";
import router from "./routes/Router";
import { Toaster } from "react-hot-toast"; 
import WhatsAppButton from "./components/contact/WhatsAppButton";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <WhatsAppButton/>
     
      <Toaster position="top-right" /> 
    </>
  );
}

export default App;