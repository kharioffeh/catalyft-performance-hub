
// Test script for invite-athlete edge function
// Usage: node scripts/test-invite.js

const https = require('https');
const http = require('http');
const url = require('url');

async function testInviteFunction() {
  const functionUrl = process.env.INVITE_URL || "http://localhost:54321/functions/v1/invite-athlete";
  const accessToken = "<PASTE_A_VALID_COACH_ACCESS_TOKEN_HERE>";

  console.log("Testing invite endpoint:", functionUrl);
  
  const requestData = JSON.stringify({ email: "testathlete@example.com" });
  const parsedUrl = new url.URL(functionUrl);
  
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  const client = parsedUrl.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log("Status:", res.statusCode);
        console.log("Response headers:", res.headers);
        console.log("Response body:", data);
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(requestData);
    req.end();
  });
}

// Run the test
testInviteFunction().catch(console.error);
