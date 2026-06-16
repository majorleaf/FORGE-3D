import express from 'express';
import { client } from  '@gradio/client';
import supabase from '../config/supabaseClient.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

const FREE_3D_SPACE = process.env.FREE_3D_SPACE || "tencent/Hunyan3D-2";

router.post('/generate-3d', protectRoute, async (req, res) =>  {
    const userUuid = req.user.id;
    const { prompt } = req.body;

    if (!prompt ) {
        return res.status(400).json({ error: 'A text prompt is required for 3D genration'});

    }

    try {

        const app = await client.connect(FREE_3D_SPACE);


        const result = await app.predict("/predict", {
            caption: prompt,
            image: null,
            steps: step || 20,
            guidance_scale: guidanceScale || 3,
            seed: seed || Math.floor(Math.random() * 1000000),
            octree_resolution:  "256",
            check_box_rating: true
        });


        const finalGlbUrl = result.data[0]?.url || '';
        const uniqueTaskId = `hf_free_${Date.now()}`;

        if (!finalGlbUrl) {
            return res.status(500).json({ error: 'The public space failed to output a valid 3D file.'});
        }

        const { error: dbError } = await supabase
        .from('assets')
        .insert({
            user_id: userUuid,
            prompt: prompt,
            task_id: uniqueTaskId,
            status: 'SUCCEEDED',
            model_url: finalGlbUrl
        });

        if (dbError) throw dbError;

        return res.status(200).json({
            success: true,
            taskId: uniqueTaskId,
            status: 'SUCCEEDED',
            url: finalGlbUrl
        });
    } catch (error) {
        console.error('Hugging Face 3D Generation Failure:', error.message);
        return res.status(500).json({ error: 'The free public 3D server is overloaded. Please try again.'});    
    }

});

export default router;