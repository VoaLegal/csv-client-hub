import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, Database, Briefcase, Building, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { parseAnyCSV } from '@/utils/csvParsers';
import { getCSVTypeDisplayName, getCSVTypeDescription } from '@/utils/csvDetector';
import { ImportedData, CSVDataType } from '@/types/portfolio';
import { CSVTemplateList } from '@/components/CSVTemplateDownloader';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportedData) => void;
}

const getTypeIcon = (type: CSVDataType) => {
  switch (type) {
    case 'portfolio': return <Briefcase className="h-5 w-5" />;
    case 'ativos': return <Database className="h-5 w-5" />;
    case 'clientes': return <Building className="h-5 w-5" />;
    default: return <FileText className="h-5 w-5" />;
  }
};

const getTypeColor = (type: CSVDataType) => {
  switch (type) {
    case 'portfolio': return 'bg-accent/10 text-accent border-accent';
    case 'ativos': return 'bg-success/10 text-success border-success';
    case 'clientes': return 'bg-secondary/10 text-secondary-foreground border-secondary';
    default: return 'bg-muted/10 text-muted-foreground border-muted';
  }
};

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onImport }) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ImportedData | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const importedData = parseAnyCSV(text);
      
      if (importedData.totalImported === 0) {
        setError('Nenhum item válido encontrado no arquivo CSV.');
        return;
      }

      onImport(importedData);
      setSuccess(importedData);
    } catch (err) {
      setError('Erro ao processar o arquivo CSV. Verifique o formato do arquivo.');
      console.error('CSV Import Error:', err);
    } finally {
      setImporting(false);
    }
  }, [onImport]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Importar Dados CSV
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            {/* Supported Formats */}
            <div>
            <h4 className="text-sm font-semibold mb-3">Formatos Suportados:</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { type: 'portfolio' as CSVDataType, files: 'Portfolio_VLMA' },
                { type: 'ativos' as CSVDataType, files: 'Ativos/Mapa_Clientes' },
                { type: 'clientes' as CSVDataType, files: 'Clientes (2 colunas: cliente, tipo)' }
              ].map(({ type, files }) => (
                <div key={type} className="flex items-center space-x-2 p-3 rounded-lg border">
                  <div className={`p-1.5 rounded ${getTypeColor(type)}`}>
                    {getTypeIcon(type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getCSVTypeDisplayName(type)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {files}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent hover:bg-accent/5'
              }
              ${importing ? 'cursor-not-allowed opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-3">
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  <p className="text-sm text-muted-foreground">Analisando e processando arquivo...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {isDragActive 
                        ? 'Solte o arquivo aqui' 
                        : 'Arraste um arquivo CSV ou clique para selecionar'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sistema detecta automaticamente o tipo de arquivo
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-success bg-success/5">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-success font-medium">
                    {success.totalImported} itens importados com sucesso!
                  </span>
                  <Badge className={getTypeColor(success.type)}>
                    {getCSVTypeDisplayName(success.type)}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Instruções:</p>
                <ul className="text-muted-foreground text-xs space-y-1 ml-4">
                  <li>• O sistema detecta automaticamente o tipo de arquivo CSV</li>
                  <li>• Suporta separadores por ponto-e-vírgula (;) ou vírgula (,)</li>
                  <li>• Arquivos são processados de acordo com sua estrutura específica</li>
                  <li>• Dados duplicados são filtrados automaticamente</li>
                </ul>
              </div>
            </div>
          </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                {success ? 'Fechar' : 'Cancelar'}
              </Button>
              {success && (
                <Button onClick={handleClose}>
                  Continuar
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Templates */}
          <div>
            <CSVTemplateList />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
