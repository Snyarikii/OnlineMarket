require('dotenv').config();
const axios = require('axios');

const generateToken = async () => {
    const url = process.env.AUTH_URL;
    const consumerKey = process.env.CONSUMER_KEY;
    const secret = process.env.CONSUMER_SECRET;
    const auth = 'Basic ' + Buffer.from(`${consumerKey}:${secret}`).toString('base64');

    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error('Error generating token:', error);
    }
};

module.exports = generateToken;