const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client using environment variables from Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the service role key for API access
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Fetch public messages from the 'messages' table, ordered by creation time
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('channel_id', 'general') // Filter for public messages
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            
            res.status(200).json(data.reverse()); // Reverse to show latest at the bottom
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ error: "Failed to fetch messages" });
        }
    } else if (req.method === 'POST') {
        // Post a new public message to the 'messages' table
        try {
            const { username, content } = req.body;
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    username,
                    content,
                    channel_id: 'general' // Tag this as a public message
                }]);

            if (error) throw error;
            
            res.status(201).json({ success: true, message: data });
        } catch (error) {
            console.error('Error adding message:', error);
            res.status(500).json({ error: "Failed to add message" });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}