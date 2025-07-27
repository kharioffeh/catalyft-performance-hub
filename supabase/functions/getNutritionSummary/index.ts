import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface NutritionSummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFats: number
  mealCount: number
  meals: Array<{
    id: string
    name: string
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
    created_at: string
  }>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Bootstrap Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { 
        global: { 
          headers: { 
            Authorization: req.headers.get('Authorization')! 
          } 
        } 
      }
    )

    // Auth guard - must be logged in
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request to get query parameters
    const url = new URL(req.url)
    const date = url.searchParams.get('date')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let query = supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: true })

    // Filter by specific date or date range
    if (date) {
      query = query.eq('date', date)
    } else if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query = query.gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    }

    const { data: nutritionLogs, error: logsError } = await query

    if (logsError) {
      console.error('Nutrition logs query error:', logsError)
      throw logsError
    }

    // Group by date and calculate summaries
    const summaryMap = new Map<string, NutritionSummary>()

    nutritionLogs?.forEach(log => {
      const dateKey = log.date
      
      if (!summaryMap.has(dateKey)) {
        summaryMap.set(dateKey, {
          date: dateKey,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
          mealCount: 0,
          meals: []
        })
      }

      const summary = summaryMap.get(dateKey)!
      summary.totalCalories += Number(log.calories)
      summary.totalProtein += Number(log.protein_g)
      summary.totalCarbs += Number(log.carbs_g)
      summary.totalFats += Number(log.fats_g)
      summary.mealCount += 1
      summary.meals.push({
        id: log.id,
        name: log.name,
        calories: Number(log.calories),
        protein_g: Number(log.protein_g),
        carbs_g: Number(log.carbs_g),
        fats_g: Number(log.fats_g),
        created_at: log.created_at
      })
    })

    // Convert map to array and round numbers for cleaner output
    const summaries = Array.from(summaryMap.values()).map(summary => ({
      ...summary,
      totalCalories: Math.round(summary.totalCalories * 100) / 100,
      totalProtein: Math.round(summary.totalProtein * 100) / 100,
      totalCarbs: Math.round(summary.totalCarbs * 100) / 100,
      totalFats: Math.round(summary.totalFats * 100) / 100,
    }))

    // If requesting a specific date, return just that summary
    if (date) {
      const dailySummary = summaries.find(s => s.date === date)
      if (!dailySummary) {
        return new Response(
          JSON.stringify({
            date,
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
            mealCount: 0,
            meals: []
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      return new Response(
        JSON.stringify(dailySummary),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return all summaries
    return new Response(
      JSON.stringify({ summaries }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})