import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function LoadingSwipePage() {
  return (
    <LoadingSpinner
      title="Ladataan profiileja..."
      fullScreen={false}
      size="sm"
    />
  );
}
