
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileImage, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Exam } from './Dashboard';

interface ImageUploadProps {
  onUploadComplete: (exam: Exam) => void;
}

export const ImageUpload = ({ onUploadComplete }: ImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem JPEG ou PNG.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const simulateAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);

    // Simulate progress
    const intervals = [20, 40, 60, 80, 100];
    for (const value of intervals) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(value);
    }

    // Simulate OpenAI analysis result
    const exam: Exam = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      imageName: selectedFile?.name || 'exam.jpg',
      imageUrl: previewUrl || '',
      diagnosis: "Análise da imagem de raio X torácico:\n\n• Campos pulmonares: Transparência preservada bilateralmente\n• Silhueta cardíaca: Dentro dos limites normais\n• Estruturas ósseas: Sem alterações significativas\n• Mediastino: Contornos preservados\n\nConclusão: Exame dentro dos parâmetros normais. Recomenda-se acompanhamento médico regular.",
      confidence: 92.5,
      status: 'completed'
    };

    setIsAnalyzing(false);
    setProgress(0);
    onUploadComplete(exam);
    
    // Reset form
    setSelectedFile(null);
    setPreviewUrl(null);

    toast({
      title: "Análise concluída",
      description: "Diagnóstico gerado com sucesso!",
    });
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileImage className="w-5 h-5 mr-2 text-blue-400" />
            Upload de Imagem de Raio X
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-blue-400/50 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer group"
            >
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Arraste uma imagem ou clique para selecionar
                </h3>
                <p className="text-blue-200 text-sm">
                  Formatos suportados: JPEG, PNG (máx. 10MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl || ''}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-black/20 rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearSelection}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-blue-200 text-sm">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              {!isAnalyzing ? (
                <Button
                  onClick={simulateAnalysis}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Iniciar Análise
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Analisando imagem...</span>
                    <span className="text-blue-300">{progress}%</span>
                  </div>
                  <Progress value={progress} className="bg-white/10" />
                  <p className="text-blue-200 text-sm text-center">
                    {progress < 40 ? 'Processando imagem...' : 
                     progress < 80 ? 'Analisando estruturas...' : 'Gerando diagnóstico...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-500/10 backdrop-blur-lg border-blue-400/20">
        <CardContent className="pt-6">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <FileImage className="w-4 h-4 mr-2 text-blue-400" />
            Instruções para melhor resultado
          </h3>
          <ul className="text-blue-200 text-sm space-y-2">
            <li>• Use imagens de alta qualidade e bem iluminadas</li>
            <li>• Certifique-se de que o raio X está completo na imagem</li>
            <li>• Evite reflexos ou obstruções na imagem</li>
            <li>• Formatos aceitos: JPEG e PNG</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
