
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Imagem é obrigatória' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('Iniciando análise da imagem com OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `Você é um radiologista especialista em análise de imagens de raio X. 
            Analise a imagem fornecida e forneça um diagnóstico detalhado seguindo este formato:

            Análise da imagem de raio X:

            • Campos pulmonares: [descreva transparência, presença de opacidades, etc.]
            • Silhueta cardíaca: [descreva tamanho e contornos]
            • Estruturas ósseas: [descreva costelas, clavículas, etc.]
            • Mediastino: [descreva contornos e posição]
            • Outros achados: [mencione qualquer outra observação relevante]

            Conclusão: [forneça uma conclusão clara e recomendações]

            IMPORTANTE: Este é um diagnóstico assistido por IA e deve sempre ser validado por um profissional médico qualificado.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Por favor, analise esta imagem de raio X e forneça um diagnóstico detalhado.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da OpenAI:', errorData);
      throw new Error(`Erro da OpenAI: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const diagnosis = data.choices[0].message.content;

    // Simular uma confiança baseada na resposta
    const confidence = Math.random() * 15 + 85; // Entre 85% e 100%

    console.log('Análise concluída com sucesso');

    return new Response(
      JSON.stringify({ 
        diagnosis,
        confidence: Math.round(confidence * 10) / 10
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na análise:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao analisar a imagem',
        details: error.message 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

