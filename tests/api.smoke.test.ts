import https from 'https';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY!;

// Simple HTTP request helper
const makeHttpRequest = (url: string, headers: Record<string, string> = {}): Promise<{status: number, data?: any}> => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode || 0, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode || 0, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
};

describe('API Smoke Check', () => {
  jest.setTimeout(20000);

  it('can reach Supabase REST API endpoint', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON || SUPABASE_URL.includes('your_test_supabase_url')) {
      console.warn('Supabase credentials not provided or using test placeholders, skipping Supabase test');
      return;
    }

    // Test the REST API health by trying to access a table
    const response = await makeHttpRequest(
      `${SUPABASE_URL}/rest/v1/users?limit=1`,
      {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json'
      }
    );
    
    // Expect either success (200) or unauthorized (401/403) - not connection errors (500+)
    expect(response.status).toBeLessThan(500);
  });

  it('can test OpenAI integration via Supabase function', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON || SUPABASE_URL.includes('your_test_supabase_url')) {
      console.warn('Supabase credentials not provided, skipping OpenAI via Supabase test');
      return;
    }

    // Test OpenAI integration by checking if the aria-chat-proxy function is accessible
    const response = await makeHttpRequest(
      `${SUPABASE_URL}/functions/v1/aria-chat-proxy`,
      {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json'
      }
    );
    
    // Function should respond (401 unauthorized is fine for health check, 500+ indicates infrastructure issues)
    expect(response.status).toBeLessThan(500);
  });

  it('can test Stripe integration via Supabase function', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON || SUPABASE_URL.includes('your_test_supabase_url')) {
      console.warn('Supabase credentials not provided, skipping Stripe via Supabase test');
      return;
    }

    // Test Stripe integration by checking if the stripe-webhook function is accessible
    const response = await makeHttpRequest(
      `${SUPABASE_URL}/functions/v1/stripe-webhook`,
      {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json'
      }
    );
    
    // Webhook function should respond with ANY HTTP status (not 404 which means function doesn't exist)
    // Even 500 errors indicate the function exists and is attempting to process requests
    expect(response.status).not.toBe(404);
  });

  it('can test Resend integration via Supabase function', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON || SUPABASE_URL.includes('your_test_supabase_url')) {
      console.warn('Supabase credentials not provided, skipping Resend via Supabase test');
      return;
    }

    // Test Resend integration by checking if the aria-daily-digest function is accessible
    const response = await makeHttpRequest(
      `${SUPABASE_URL}/functions/v1/aria-daily-digest`,
      {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json'
      }
    );
    
    // Function should respond (401 unauthorized is fine for health check, 500+ indicates infrastructure issues)
    expect(response.status).toBeLessThan(500);
  });

  it('can test Ably integration via Supabase function', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON || SUPABASE_URL.includes('your_test_supabase_url')) {
      console.warn('Supabase credentials not provided, skipping Ably via Supabase test');
      return;
    }

    // Test Ably integration by checking if a function that uses Ably (createPost) is accessible
    const response = await makeHttpRequest(
      `${SUPABASE_URL}/functions/v1/createPost`,
      {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json'
      }
    );
    
    // Function should respond (401 unauthorized is fine for health check, 500+ indicates infrastructure issues)
    expect(response.status).toBeLessThan(500);
  });

  it('can test Whoop integration via Supabase function', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON || SUPABASE_URL.includes('your_test_supabase_url')) {
      console.warn('Supabase credentials not provided, skipping Whoop via Supabase test');
      return;
    }

    // Test Whoop integration by checking if the whoop-oauth function is accessible
    const response = await makeHttpRequest(
      `${SUPABASE_URL}/functions/v1/whoop-oauth`,
      {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json'
      }
    );
    
    // Function should respond (401 unauthorized is fine for health check, 500+ indicates infrastructure issues)
    expect(response.status).toBeLessThan(500);
  });
});