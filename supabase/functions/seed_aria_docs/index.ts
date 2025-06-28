
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_ARIA_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const seedDocuments = [
  {
    title: "Load Monitoring Fundamentals",
    source: "philosophy",
    content_md: `# Load Monitoring Fundamentals

Load monitoring is the systematic tracking of training stress and athlete response to optimize performance and prevent injury.

## Key Principles

### Acute vs Chronic Load
- **Acute Load**: Training load over the past 7 days
- **Chronic Load**: Training load over the past 28 days (4 weeks)
- **ACWR (Acute:Chronic Workload Ratio)**: Acute ÷ Chronic load

### Optimal ACWR Ranges
- **0.8-1.3**: Sweet spot for performance gains with minimal injury risk
- **< 0.8**: Detraining zone - athlete may be undertrained
- **> 1.3**: Danger zone - significantly increased injury risk
- **> 1.5**: High injury risk - immediate load reduction recommended

### Load Calculation Methods
1. **Session RPE**: RPE (6-20 scale) × Duration in minutes
2. **Training Impulse (TRIMP)**: Heart rate-based calculation
3. **Mechanical Load**: Sets × reps × load for strength training

## Implementation Guidelines

### Weekly Monitoring
- Track daily session RPE and duration
- Calculate weekly acute load
- Monitor 4-week chronic load trends
- Calculate ACWR every week

### Red Flags
- ACWR spike > 1.5 for consecutive weeks
- Sudden load increases > 50% week-to-week
- Chronic load declining while acute load maintained
- Individual athlete ACWR consistently > 1.3

### Load Progression Rules
- Increase weekly load by no more than 10% week-to-week
- Allow for planned deload weeks every 4-6 weeks
- Individual variation in load tolerance must be considered
- Environmental factors affect load tolerance (sleep, stress, nutrition)`
  },
  {
    title: "Readiness Score Interpretation",
    source: "metrics",
    content_md: `# Readiness Score Interpretation Guide

Readiness scores provide a comprehensive view of an athlete's preparedness for training by combining multiple physiological and subjective markers.

## Score Components

### Primary Factors (70% weighting)
1. **Heart Rate Variability (HRV)** - 30%
   - Higher HRV = better autonomic recovery
   - Individual baseline critical for interpretation
   
2. **Sleep Quality & Duration** - 20%
   - Sleep efficiency percentage
   - Total sleep time relative to individual needs
   
3. **Previous Day Training Load** - 20%
   - Residual fatigue from recent sessions
   - Load accumulation over 48-72 hours

### Secondary Factors (30% weighting)
1. **Resting Heart Rate** - 15%
   - Elevated RHR indicates incomplete recovery
   
2. **Subjective Wellness** - 15%
   - Self-reported energy, motivation, soreness

## Interpretation Guidelines

### Score Ranges
- **90-100**: Excellent readiness - high intensity training appropriate
- **70-89**: Good readiness - normal training load suitable
- **50-69**: Moderate readiness - consider reducing intensity or volume
- **30-49**: Poor readiness - focus on recovery, light training only
- **< 30**: Very poor readiness - rest day strongly recommended

### Individual Variation
- Establish individual baselines over 2-4 weeks
- Some athletes naturally score higher/lower
- Look for trends and patterns, not just absolute scores
- Compare to athlete's personal range, not team averages

## Training Modifications

### High Readiness (>80)
- Proceed with planned high-intensity sessions
- Good day for PR attempts or competition simulation
- Can handle higher training loads

### Moderate Readiness (50-80)
- Maintain training but monitor closely
- Consider reducing volume by 10-20%
- Focus on skill and technique rather than intensity

### Low Readiness (<50)
- Prioritize recovery interventions
- Light movement, mobility work only
- Address sleep, nutrition, stress factors
- Consider extending recovery period

## Common Patterns

### Declining Trend
- Progressive overload without adequate recovery
- External life stressors accumulating
- Potential illness onset
- Need for deload or rest

### Volatile Scores
- Inconsistent sleep patterns
- High life stress variability
- Possible measurement errors
- Individual may be hard to predict

### Consistently Low
- Chronic overtraining syndrome risk
- Underlying health issues
- Poor recovery practices
- Need comprehensive assessment`
  },
  {
    title: "Injury Risk Assessment",
    source: "philosophy", 
    content_md: `# Injury Risk Assessment Framework

A systematic approach to identifying and mitigating injury risk factors in athletic populations.

## Primary Risk Factors

### Load-Related Factors
1. **Acute Load Spikes**
   - Week-to-week increases >50%
   - ACWR consistently >1.3
   - High absolute loads without adequate preparation

2. **Load Monotony**
   - Lack of load variation
   - Insufficient recovery periods
   - Continuous high-intensity training

### Physiological Markers
1. **Autonomic Dysfunction**
   - Consistently low HRV
   - Elevated resting heart rate
   - Poor heart rate recovery

2. **Movement Quality**
   - Functional movement screen deficits
   - Asymmetries >10% between limbs
   - Compensatory movement patterns

## Assessment Protocol

### Weekly Monitoring
- ACWR calculation and trending
- Readiness score patterns
- Load distribution analysis
- Individual athlete flagging system

### Monthly Deep Dive
- Movement screening
- Strength testing asymmetries
- Wellness questionnaire trends
- Performance marker analysis

## Risk Categories

### Low Risk (Green)
- ACWR 0.8-1.3
- Consistent readiness scores >70
- No movement red flags
- Good load tolerance history

### Moderate Risk (Amber)
- ACWR 1.3-1.5 or <0.8
- Readiness declining trend
- Minor movement restrictions
- Recent return from injury

### High Risk (Red)
- ACWR >1.5 consistently
- Readiness scores <50 for >3 days
- Significant movement dysfunction
- Multiple risk factors present

## Intervention Strategies

### Load Management
- Immediate load reduction for high-risk athletes
- Extended recovery periods
- Alternative training methods
- Gradual return to previous loads

### Recovery Enhancement
- Sleep optimization protocols
- Stress management techniques
- Nutrition and hydration focus
- Therapeutic interventions

### Movement Correction
- Targeted mobility work
- Strength training for imbalances
- Movement retraining
- Manual therapy referrals

## Return-to-Training Criteria

### From High Risk Status
1. ACWR normalized (<1.3) for 1 week
2. Readiness scores >70 for 3 consecutive days
3. Movement screens cleared
4. Athlete reports feeling ready

### Progressive Loading
- Start at 50% previous load
- Increase by 10% every 3-4 days
- Monitor response closely
- Be prepared to reduce if warning signs return`
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting ARIA docs seeding...');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if documents already exist
    const { data: existingDocs, error: checkError } = await supabase
      .from('aria_docs')
      .select('id')
      .limit(1);

    if (checkError) {
      throw new Error(`Error checking existing docs: ${checkError.message}`);
    }

    if (existingDocs && existingDocs.length > 0) {
      console.log('Documents already exist, skipping seed');
      return new Response(
        JSON.stringify({ message: 'Documents already exist' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate embeddings and insert documents
    for (const doc of seedDocuments) {
      console.log(`Processing document: ${doc.title}`);
      
      // Generate embedding
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: doc.content_md,
        }),
      });

      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text();
        console.error('OpenAI embedding error:', errorText);
        continue;
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Insert document with embedding
      const { error: insertError } = await supabase
        .from('aria_docs')
        .insert({
          title: doc.title,
          source: doc.source,
          content_md: doc.content_md,
          embedding: embedding
        });

      if (insertError) {
        console.error(`Error inserting ${doc.title}:`, insertError);
      } else {
        console.log(`Successfully inserted: ${doc.title}`);
      }
    }

    console.log('ARIA docs seeding completed');
    
    return new Response(
      JSON.stringify({ message: 'Documents seeded successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in seed_aria_docs function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
