import express from 'express';
import { client } from  '@gradio/client';
import supabase from '../config/supabaseClient.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

const FREE_3D_SPACE = process.env.FREE_3D_SPACE || "components/3d-arena";

router.post('/generate-3d', protectRoute, async (req, res) =>  {
    const userUuid = req.user.id;
    const { prompt } = req.body;

    if (!prompt ) {
        return res.status(400).json({ error: 'A text prompt is required for 3D genration'});

    }

    try {

        const app = await client (FREE_3D_SPACE);


        const result = await app.predict("/predict", {
            prompt_text: prompt 
        });


        const finalGlbUrl = result.data[0]?.url || '';
        const uniqueTaskId = `hf_free_${Date.now()}`;

        if (!finalGlbUrl) {
            return res.status(500).json({ error: 'The public space failed to output a valid 3D file.'});
        }

        const { error } = await supabase
        .from('assets')
        .insert({
            user_id: userUuid,
            prompt: prompt,
            task_id: uniqueTaskId,
            status: 'SUCCEEDED',
            model_url: finalGlbUrl
        });

        if (error) throw error;

        return res.status(200).json({
            success: true,
            taskId: uniqueTaskId,
            status: 'SUCCEEDED',
            url: finalGlbUrl
        });
    } catch (error) {
        console.error('Free 3D Generation Space Error:', error.message);
        return res.status(500).json({ error: 'The free public 3D server is overloaded. Please try again.'});    
    }

});

export default router;