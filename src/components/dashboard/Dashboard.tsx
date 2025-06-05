import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, History, User, LogOut, Activity } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { ExamHistory } from './ExamHistory';
import { DiagnosisResult } from './DiagnosisResult';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

// Use the Supabase generated type for Exam
export type Exam = Tables<'exams'>;

export const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState('upload');
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar exames:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o histórico de exames.",
          variant: "destructive",
        });
      } else {
        setExams(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar exames:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (examData: {
    imageName: string;
    imageUrl: string;
    diagnosis: string;
    confidence: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([
          {
            user_id: user!.id,
            image_name: examData.imageName,
            image_url: examData.imageUrl,
            diagnosis: examData.diagnosis,
            confidence: examData.confidence,
            status: 'completed'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar exame:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar o exame no banco de dados.",
          variant: "destructive",
        });
        return;
      }

      setExams(prev => [data, ...prev]);
      setCurrentDiagnosis(data);
      setCurrentTab('result');

      toast({
        title: "Exame salvo",
        description: "O diagnóstico foi salvo com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar exame:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao salvar o exame.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">DiagnosIA</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-blue-200 text-sm">
                Olá, {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-blue-200 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border border-white/20">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Novo Exame
            </TabsTrigger>
            <TabsTrigger 
              value="result" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-200"
              disabled={!currentDiagnosis}
            >
              <Activity className="w-4 h-4 mr-2" />
              Diagnóstico
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-200"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico ({exams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <ImageUpload onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="result">
            {currentDiagnosis && <DiagnosisResult exam={currentDiagnosis} />}
          </TabsContent>

          <TabsContent value="history">
            <ExamHistory 
              exams={exams} 
              loading={loading}
              onViewExam={(exam) => {
                setCurrentDiagnosis(exam);
                setCurrentTab('result');
              }} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
