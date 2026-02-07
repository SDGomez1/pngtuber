import { Suspense } from "react";
import AvatarAppClient from "@/components/AvatarAppClient";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AvatarAppClient />
    </Suspense>
  );
}

