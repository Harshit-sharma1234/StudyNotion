const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const categories = [
    {
        name: "Python",
        description: "Learn Python from scratch with hands-on projects."
    },
    {
        name: "Web Development",
        description: "Build modern websites using HTML, CSS, JavaScript, and top frameworks."
    },
    {
        name: "Data Science",
        description: "Analyze and visualize data using powerful tools and libraries."
    },
    {
        name: "Android Development",
        description: "Create high-quality mobile apps for the Android platform."
    },
    {
        name: "AI / ML",
        description: "Dive into the world of Artificial Intelligence and Machine Learning."
    },
    {
        name: "Cloud Computing",
        description: "Scale your applications using modern cloud infrastructures."
    },
    {
        name: "Blockchain",
        description: "Explore the technology behind decentralized ledgers and cryptocurrencies."
    }
];

async function seedCategories() {
    console.log("Seeding categories...");
    try {
        const { data, error } = await supabase
            .from("categories")
            .insert(categories)
            .select();

        if (error) {
            throw error;
        }

        console.log("Successfully seeded categories:");
        console.log(data.map(c => c.name).join(", "));
    } catch (error) {
        console.error("Error seeding categories:", error.message);
    }
}

seedCategories();
