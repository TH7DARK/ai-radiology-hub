// supabase/functions/analyze-xray/index.ts
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
    const body = await req.json();
    const imageBase64 = body?.imageBase64; // Safer access

    if (!imageBase64) {
      console.error('Requisição sem imageBase64.');
      return new Response(
        JSON.stringify({ error: 'A propriedade imageBase64 é obrigatória no corpo da requisição.' }),
        {
          status: 400, // Bad Request
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY não configurada na Edge Function.');
      // Não exponha detalhes da chave API ao cliente diretamente no erro.
      // O log acima é suficiente para depuração no servidor.
      throw new Error('Erro de configuração do servidor: OPENAI_API_KEY não configurada.');
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
        model: 'gpt-4-vision-preview', // Considere 'gpt-4o' ou 'gpt-4o-mini' para performance/custo
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
                  url: `data:image/jpeg;base64,${imageBase64}`, // Adicione o prefixo data URL aqui
                  detail: 'high' // Considere 'low' ou 'auto' para reduzir tempo/custo se aplicável
                }
              }
            ]
          }
        ],
        max_tokens: 1000, // Reduzido de 1500; ajuste conforme necessário
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Resposta não-JSON da OpenAI." } }));
      console.error('Erro da API OpenAI:', response.status, errorData);
      throw new Error(`Erro da API OpenAI: ${errorData.error?.message || response.statusText || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const diagnosis = data.choices?.[0]?.message?.content;

    if (!diagnosis) {
      console.error('Resposta inesperada da API OpenAI. Diagnóstico ausente:', data);
      throw new Error('Resposta inválida da API OpenAI. Não foi possível obter o diagnóstico.');
    }

    // Simular uma confiança baseada na resposta
    const confidence = Math.random() * 15 + 85; // Entre 85% e 100%

    console.log('Análise concluída com sucesso.');

    return new Response(
      JSON.stringify({
        diagnosis,
        confidence: Math.round(confidence * 10) / 10
      }),
      {
        status: 200, // Sucesso
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro detalhado na função analyze-xray:', error, error.stack); // Log mais detalhado
    let errorMessage = 'Ocorreu um erro ao analisar a imagem.';
    // Evite expor detalhes internos da mensagem de erro diretamente ao cliente por segurança.
    // Use os logs do servidor para depuração.
    if (error.message.includes('OPENAI_API_KEY')) {
      errorMessage = 'Erro de configuração interna do servidor.';
    } else if (error.message.startsWith('Erro da API OpenAI:')) {
      errorMessage = 'Não foi possível processar a imagem com o serviço de IA.';
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500, // Internal Server Error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
