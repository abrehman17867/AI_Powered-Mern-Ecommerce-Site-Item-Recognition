import CheckOut from "@/customer/components/CheckOut/CheckOut";
import ProtectedRoute from "@/customer/components/navigation/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <CheckOut />
    </ProtectedRoute>
  );
}
