export default function MaintenancePage() {
  if (!maintenanceMode) {
    redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-tuni-blue">Maintenance Mode</h1>
        <p className="mt-4 text-lg text-gray-600">
          Our site is currently undergoing scheduled maintenance. Please check
          back later.
        </p>
      </div>
    </div>
  );
}
