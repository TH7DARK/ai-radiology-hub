
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileImage, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  onUploadComplete: (examData: {
    imageName: string;
    imageUrl: string;
    diagnosis: string;
    confidence: number;
  }) => void;
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

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, selecione uma imagem menor que 10MB.",
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

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const analyzeWithOpenAI = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Convert image to base64
      const imageBase64 = await convertToBase64(selectedFile);

      console.log('Enviando imagem para análise...');

      // Call our edge function
      const { data, error } = await supabase.functions.invoke('analyze-xray', {
        body: { imageBase64 }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Erro ao chamar função:', error);
        throw new Error(error.message || 'Erro ao analisar imagem');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Pass data to parent component
      onUploadComplete({
        imageName: selectedFile.name,
        imageUrl: previewUrl || '',
        diagnosis: data.diagnosis,
        confidence: data.confidence,
      });
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsAnalyzing(false);
      setProgress(0);

      toast({
        title: "Análise concluída",
        description: "Diagnóstico gerado com sucesso pela OpenAI!",
      });

    } catch (error) {
      console.error('Erro na análise:', error);
      setIsAnalyzing(false);
      setProgress(0);
      
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Erro ao analisar a imagem",
        variant: "destructive",
      });
    }
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
                  disabled={isAnalyzing}
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
                  onClick={analyzeWithOpenAI}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Analisar com IA
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Analisando com IA...</span>
                    <span className="text-blue-300">{progress}%</span>
                  </div>
                  <Progress value={progress} className="bg-white/10" />
                  <p className="text-blue-200 text-sm text-center">
                    {progress < 30 ? 'Processando imagem...' : 
                     progress < 70 ? 'Enviando para OpenAI...' : 
                     progress < 90 ? 'Analisando com IA...' : 'Finalizando diagnóstico...'}
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
            <li>• Formatos aceitos: JPEG e PNG (máx. 10MB)</li>
            <li>• A análise é feita pela OpenAI GPT-4o com capacidade de visão</li>
            <li>• Os diagnósticos são salvos automaticamente no seu histórico</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
