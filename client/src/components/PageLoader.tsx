import { LoaderIcon } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoaderIcon className="h-12 w-12 animate-spin" />
    </div>
  );
}
