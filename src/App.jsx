import { RouterProvider } from "react-router";
import router from "./routes/Router";
import { Toaster } from "react-hot-toast"; 

function App() {
  return (
    <>
      <RouterProvider router={router} />
     
      <Toaster position="top-right" /> 
    </>
  );
}

export default App;