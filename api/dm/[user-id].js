const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const { method, body, query } = req;
    const { username, content } = body || {};
    const { userId } = query; // Recipient's user ID

    // You would get the sender's user ID from a token or session
    const senderId = req.headers['x-sender-id'];
    if (!senderId) {
        return res.status(401).json({ error: "Sender ID is required" });
    }

    // Create a consistent channel ID for the two users
    const dmChannelId = [senderId, userId].sort().join('_');

    if (method === 'POST') {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    username,
                    content,
                    channel_id: dmChannelId // Use the consistent DM channel ID
                }]);

            if (error) throw error;
            
            res.status(201).json({ success: true, message: data });
        } catch (error) {
            console.error('Error posting DM:', error);
            res.status(500).json({ error: "Failed to send DM" });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}