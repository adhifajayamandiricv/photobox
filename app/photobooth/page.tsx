import { Suspense } from "react";
import PhotoboothClient from "./PhotoboothClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PhotoboothClient />
    </Suspense>
  );
}