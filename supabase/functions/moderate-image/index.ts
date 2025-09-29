import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { decode } from "npm:base64-arraybuffer@1.0.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, userId } = await req.json();

    if (!image || !userId) {
      throw new Error("Image and userId are required");
    }

    // Extract the base64 data
    const base64Data = image.split(',')[1];
    const arrayBuffer = decode(base64Data);

    // Use AI to check if the image is appropriate
    const model = new Supabase.ai.Session('clip-vit-b-32');
    const embedding = await model.run(arrayBuffer, { mean_pool: true, normalize: true });
    
    // These are example NSFW concepts to check against
    const nsfwConcepts = [
      "nsfw", "explicit", "inappropriate", "adult content",
      "violence", "gore", "offensive", "disturbing"
    ];

    // Check similarity with NSFW concepts
    const similarities = await Promise.all(
      nsfwConcepts.map(concept => model.similarity(embedding, concept))
    );

    const maxSimilarity = Math.max(...similarities);
    
    // If similarity is too high, reject the image
    if (maxSimilarity > 0.3) {
      return new Response(
        JSON.stringify({ error: "Image appears to be inappropriate" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Upload to Storage if appropriate
    const fileName = `${userId}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase
      .storage
      .from('profile-photos')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ url: publicUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});