import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCSVToClients } from '@/utils/csvParser';
import { Client } from '@/types/client';

interface CSVImportProps {
  onImport: (clients: Client[]) => void;
}

export const CSVImport: React.FC<CSVImportProps> = ({ onImport }) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const clients = parseCSVToClients(text);
      
      if (clients.length === 0) {
        setError('Nenhum cliente válido encontrado no arquivo CSV.');
        return;
      }

      onImport(clients);
      setSuccess(`${clients.length} clientes importados com sucesso!`);
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

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Importar Clientes</h3>
          <p className="text-muted-foreground text-sm">
            Faça upload de um arquivo CSV com os dados dos clientes
          </p>
        </div>

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
                <p className="text-sm text-muted-foreground">Processando arquivo...</p>
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
                    Suporte apenas para arquivos .csv
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-success bg-success/5">
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Formato esperado do CSV:</p>
              <p className="text-muted-foreground text-xs">
                O arquivo deve conter colunas como: Nome do Cliente, Grupo Econômico, 
                Contato Principal, Cidade, Estado, Valor mensal, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};