require('dotenv').config({ path: __dirname + '/.env'});
const getFormattedTimestamp = require('../utils/TimeStamp');
const generateToken = require('../utils/GenerateToken');

const stkPush = async (phone, amount) => {
    const token = await generateToken();
    const passkey = process.env.PASS_KEY;
    const shortcode = process.env.SHORTCODE;
    const timeStamp = getFormattedTimestamp();
    const stkPassword = Buffer.from(`${shortcode}${passkey}${timeStamp}`).toString('base64');
    const callBackUrl = process.env.CALLBACK_URL;
    console.log("This is the callback url:", callBackUrl);
    const url = process.env.STK_URL;

    try{
        const body = {
        "BusinessShortCode": shortcode,    
        "Password": stkPassword,
        "Timestamp":timeStamp,
        "TransactionType": "CustomerPayBillOnline",    
        "Amount": amount,    
        "PartyA":phone,    
        "PartyB":shortcode,    
        "PhoneNumber":phone,
        "CallBackURL": callBackUrl,
        "AccountReference":"Nyarikii",
        "TransactionDesc":"Test"
        };
        console.log("This is the stk push body:", body);
        
        const response =  await fetch (url,{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('STK Push API Response Error:', errorData);
            throw new Error(`STK Push failed: ${errorData}`);
        }

        const responseData =  await response.json();
        return responseData;
    }catch (error) {
        console.error('Error in STK push request');
        throw error;
    }
};
module.exports = stkPush;