
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  try {
    console.log('API config endpoint called');
    
    const { data, error } = await supabase
      .from('api_config')
      .select('server_url, api_key')
      .single();

    if (error) {
      console.error('Error fetching API config:', error);
      return new Response(
        JSON.stringify({ error: 'No API configuration found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('API config fetched successfully');
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API config error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch API configuration' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
