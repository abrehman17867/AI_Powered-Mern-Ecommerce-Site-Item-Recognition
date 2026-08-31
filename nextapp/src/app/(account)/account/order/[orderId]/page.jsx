import OrderDetails from "@/customer/components/Order/OrderDetails";
import ProtectedRoute from "@/customer/components/navigation/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <OrderDetails />
    </ProtectedRoute>
  );
}
