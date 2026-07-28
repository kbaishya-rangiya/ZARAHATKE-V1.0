import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { StoreProvider } from "@/context/StoreContext";
import SiteChrome from "@/components/site/SiteChrome";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Category from "@/pages/Category";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Admin from "@/pages/Admin";

function App() {
  return (
    <div className="App">
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<SiteChrome />}>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/order/:id" element={<OrderConfirmation />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
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
