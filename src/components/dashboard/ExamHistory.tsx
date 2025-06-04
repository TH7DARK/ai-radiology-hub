
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Eye, Calendar, FileText, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { Exam } from './Dashboard';

interface ExamHistoryProps {
  exams: Exam[];
  loading: boolean;
  onViewExam: (exam: Exam) => void;
}

export const ExamHistory = ({ exams, loading, onViewExam }: ExamHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = exams.filter(exam =>
    exam.image_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'processing': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'failed': return 'bg-red-500/20 text-red-300 border-red-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completo';
      case 'processing': return 'Processando';
      case 'failed': return 'Falha';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <History className="w-5 h-5 mr-2 text-blue-400" />
            Histórico de Exames
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
              <Input
                placeholder="Buscar exames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-blue-200">Carregando histórico...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-12">
              {exams.length === 0 ? (
                <>
                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum exame realizado</h3>
                  <p className="text-blue-200">Faça upload de uma imagem para começar a análise.</p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-blue-200">Tente ajustar os termos da busca.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExams.map((exam) => (
                <Card key={exam.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4 flex-1">
                        <img
                          src={exam.image_url}
                          alt={exam.image_name}
                          className="w-16 h-16 object-cover bg-black/20 rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{exam.image_name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-blue-200">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(exam.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <span>Confiança: {exam.confidence}%</span>
                          </div>
                          <p className="text-blue-300 text-sm mt-2 line-clamp-2">
                            {exam.diagnosis.split('\n')[0]}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        <Badge variant="secondary" className={getStatusColor(exam.status)}>
                          {getStatusLabel(exam.status)}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => onViewExam(exam)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
