import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, radius } = await req.json();

    if (!lat || !lon) {
      return new Response(JSON.stringify({ error: "lat and lon are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const r = radius || 5000; // default 5km

    // Overpass API query for mosques
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lon});
        way["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lon});
      );
      out center tags;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!response.ok) {
      console.error("Overpass error:", response.status);
      return new Response(JSON.stringify({ error: "Failed to fetch mosques" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    const mosques = (data.elements || []).map((el: any) => ({
      osm_id: String(el.id),
      name: el.tags?.name || el.tags?.["name:ar"] || el.tags?.["name:en"] || "مسجد",
      address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || "",
      latitude: el.lat || el.center?.lat,
      longitude: el.lon || el.center?.lon,
    })).filter((m: any) => m.latitude && m.longitude);

    return new Response(JSON.stringify({ mosques }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
