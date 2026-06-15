import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const router = express.Router(); 



router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password ) {
        return res.status(400).json({ error: 'Please provide both email and password'});
    }

    try {

        const userCheck = await pool.query('SELECT * FROM users WHERE  email = $1', [email.tolowerCase()]);
        if (userCheck.rows.length > 0 ) {
            return res.status(400).json({ error: 'An account with email already exists'});

        }

        // Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        //INSERT NEW USER INTO POSTGRES

        await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2)',
            [email.tolowerCase(), hashedPassword] 
        );

        return res.status(201).json({ success: true, message: 'User registered successfully!'});

    } catch(error) {
        console.error('Signup Error:', error.message);
        return re.status(500).json ({ error: 'Server error during registration'});

    }
});

// LOGIN 
router.post('login', async(req, res) => {
    const { email, password} = req.body;

    if (!email || !password)  {
        return res.status(400).json({ error: ' Please provide both email and password'});

    }
    try {
        // check if user exists 
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.tolowerCase()]);
        const user = result.rows[0];

        if (!user) {
          return res.status(400).json({ error: 'Invalid email or password'});

        }
        // To compare passwords 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)  {
            return res.status(400).json({ error: 'Invalid email or pasword'});

        }

        // Generate JWT ()T
        const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET, { expiresIn: '24h' });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email} 
        });
    } catch ( error ) {
        console.error('Login Error:', error.message);
        return res.status(500).json({ error: 'Server error during login'});

    }

});

export default router;
