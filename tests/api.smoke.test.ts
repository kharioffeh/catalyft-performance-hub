import https from 'https';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY!;
const ABLY_KEY     = process.env.ABLY_API_KEY!;
const OPENAI_KEY   = process.env.OPENAI_API_KEY!;
const GARMIN_TOKEN = process.env.GARMIN_OAUTH_TOKEN!;

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

  it('can connect to Ably REST API', async () => {
    if (!ABLY_KEY) {
      console.warn('ABLY_API_KEY not provided, skipping Ably test');
      return;
    }

    // Test Ably REST API stats endpoint
    const response = await makeHttpRequest(
      'https://rest.ably.io/stats',
      {
        'Authorization': `Basic ${Buffer.from(ABLY_KEY).toString('base64')}`
      }
    );
    
    expect(response.status).toBeLessThan(400);
  });

  it('can connect to OpenAI API', async () => {
    if (!OPENAI_KEY) {
      console.warn('OPENAI_API_KEY not provided, skipping OpenAI test');
      return;
    }

    // Test OpenAI models endpoint
    const response = await makeHttpRequest(
      'https://api.openai.com/v1/models',
      {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      }
    );
    
    expect(response.status).toBeLessThan(400);
  });

  it('can fetch Garmin profile (if token provided)', async () => {
    if (!GARMIN_TOKEN) {
      console.warn('GARMIN_OAUTH_TOKEN not provided, skipping Garmin test');
      return;
    }

    const response = await makeHttpRequest(
      'https://apis.garmin.com/wellness-api/rest/user/id',
      {
        'Authorization': `Bearer ${GARMIN_TOKEN}`
      }
    );
    
    expect(response.status).toBeLessThan(400);
  });
});