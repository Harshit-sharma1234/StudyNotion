const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function listTables() {
    console.log("Attempting to list tables via PostgREST metadata...");

    // PostgREST exposes metadata at the root /
    // We can try to query a non-existent table to see the error message details
    // or use a known one if we find any.

    // Actually, a more reliable way to check existence is to query the 'information_schema'
    // if we have permission, but anon keys usually don't.

    // Let's try to fetch from a generic or likely existing table if any.
    // Or just try to hit the root.

    try {
        const { data, error } = await supabase.from("_any_non_existent_table").select("*").limit(1);
        console.log("Error response for non-existent table (reveals cache info):", error);
    } catch (e) {
        console.error("Fetch Exception:", e);
    }
}

listTables();
