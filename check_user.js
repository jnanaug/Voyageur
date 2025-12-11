
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
    console.log("Checking user jnanakoustubhaug@gmail.com...");
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error("Error:", error);
        } else {
            const user = users.find(u => u.email === 'jnanakoustubhaug@gmail.com');
            if (!user) {
                console.log("RESULT: User NOT FOUND.");
            } else {
                console.log("RESULT: User FOUND.");
                console.log("Providers:", user.app_metadata.providers);
            }
        }
    } catch (e) {
        console.error("Crash:", e);
    }
    process.exit(0);
}

checkUser();
