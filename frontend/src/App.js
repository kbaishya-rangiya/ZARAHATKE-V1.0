import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { StoreProvider } from "@/context/StoreContext";
import Home from "@/pages/Home";

function App() {
  return (
    <div className="App">
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#5D101C",
              color: "#FBF9F6",
              border: "1px solid #7A1525",
              borderRadius: "0",
              fontFamily: "Manrope, sans-serif",
            },
          }}
        />
      </StoreProvider>
    </div>
  );
}

export default App;
