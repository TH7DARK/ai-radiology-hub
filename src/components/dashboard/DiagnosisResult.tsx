
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Share, Calendar, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Exam } from './Dashboard';

interface DiagnosisResultProps {
  exam: Exam;
}

export const DiagnosisResult = ({ exam }: DiagnosisResultProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    const content = `
DIAGNÓSTICO MÉDICO - DiagnosIA
========================================

Paciente: ${exam.user_id}
Data do Exame: ${new Date(exam.created_at).toLocaleDateString('pt-BR')}
Arquivo: ${exam.image_name}
Confiança da IA: ${exam.confidence}%

DIAGNÓSTICO:
${exam.diagnosis}

========================================
Este diagnóstico foi gerado por inteligência artificial e deve sempre ser validado por um profissional médico qualificado.
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico_${exam.image_name.split('.')[0]}_${new Date(exam.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "O relatório foi baixado com sucesso.",
    });
  };

  const handleShare = async () => {
    const text = `Diagnóstico DiagnosIA - Arquivo: ${exam.image_name} - Confiança: ${exam.confidence}%`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Diagnóstico DiagnosIA',
          text: text,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado",
        description: "Informações do diagnóstico copiadas para a área de transferência.",
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'Alta Confiança';
    if (confidence >= 75) return 'Confiança Moderada';
    return 'Baixa Confiança';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border-green-400/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Diagnóstico Concluído</h2>
                <p className="text-green-200">Análise realizada com sucesso</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/50">
              <Zap className="w-3 h-3 mr-1" />
              {exam.status === 'completed' ? 'Completo' : 'Processando'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">Imagem Analisada</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={exam.image_url}
              alt="Raio X"
              className="w-full h-64 object-contain bg-black/20 rounded-lg mb-4"
            />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Arquivo:</span>
                <span className="text-white truncate ml-2">{exam.image_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Data:</span>
                <span className="text-white">
                  {new Date(exam.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Confiança:</span>
                <span className={getConfidenceColor(exam.confidence)}>
                  {exam.confidence}% - {getConfidenceLabel(exam.confidence)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                Relatório de Diagnóstico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/5 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                <pre className="text-blue-100 whitespace-pre-wrap text-sm leading-relaxed">
                  {exam.diagnosis}
                </pre>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="bg-orange-500/10 backdrop-blur-lg border-orange-400/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Importante</h3>
                  <p className="text-orange-200 text-sm leading-relaxed">
                    Este diagnóstico foi gerado por inteligência artificial e deve ser sempre 
                    validado por um profissional médico qualificado. Não substitui consulta médica.
                    O diagnóstico foi salvo automaticamente no seu histórico.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
