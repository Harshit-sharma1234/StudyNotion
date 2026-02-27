const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function test() {
    console.log("Testing Supabase connection...");

    console.log("1. Querying 'users' table...");
    const { data: users, error: userError } = await supabase.from("users").select("count").limit(1);
    if (userError) {
        console.error("Error querying 'users':", userError);
    } else {
        console.log("'users' table OK");
    }

    console.log("2. Querying 'profiles' table...");
    const { data: profiles, error: profileError } = await supabase.from("profiles").select("count").limit(1);
    if (profileError) {
        console.error("Error querying 'profiles':", profileError);
    } else {
        console.log("'profiles' table OK");
    }

    console.log("3. Querying with join (users + profiles)...");
    const { data: join, error: joinError } = await supabase.from("users").select("*, profiles(*)").limit(1);
    if (joinError) {
        console.error("Error querying join:", joinError);
    } else {
        console.log("Join OK");
    }
}

test();
