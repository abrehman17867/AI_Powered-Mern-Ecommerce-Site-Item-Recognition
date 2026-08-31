import Order from "@/customer/components/Order/Order";
import ProtectedRoute from "@/customer/components/navigation/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <Order />
    </ProtectedRoute>
  );
}
