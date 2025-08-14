import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/hero";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import Link from "next/link";

export default async function IndexPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  return (
    <div className="flex-1 w-full flex flex-col gap-20">
      <Hero />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          {data?.claims ? (
            <Link href="/protected/shops" className="underline">Ir a mis tiendas</Link>
          ) : (
            <Link href="/auth/login" className="underline">Inicia sesión para gestionar tu agenda</Link>
          )}
        </div>
        <FetchDataSteps />
      </div>
    </div>
  );
}
