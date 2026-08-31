import ProfilePage from "@/customer/pages/Account/ProfilePage";
import ProtectedRoute from "@/customer/components/navigation/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
