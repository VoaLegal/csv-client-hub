import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSVTemplate, downloadInstructions } from '@/utils/csvTemplate';
import { validateCSVData, ValidationResult, ValidationError } from '@/utils/csvValidator';
import { clienteService, empresaService, type Empresa } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

interface CSVUploadModalProps {
  children: React.ReactNode;
  onClientesImported?: () => void;
}

interface ImportProgress {
  current: number;
  total: number;
  currentClient: string;
}

export default function CSVUploadModal({ children, onClientesImported }: CSVUploadModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0, currentClient: '' });
  const [importComplete, setImportComplete] = useState(false);
  const [userCompany, setUserCompany] = useState<Empresa | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV válido');
        return;
      }
      setFile(selectedFile);
      setValidationResult(null);
      setImportComplete(false);
    }
  };

  const handleValidateFile = async () => {
    if (!file) return;

    setIsValidating(true);
    try {
      const fileContent = await file.text();
      const result = validateCSVData(fileContent);
      setValidationResult(result);

      if (result.isValid) {
        toast.success(`Arquivo validado com sucesso! ${result.validRows.length} clientes prontos para importação.`);
      } else {
        toast.error(`Arquivo contém ${result.errors.length} erro(s). Verifique os detalhes abaixo.`);
      }
    } catch (error) {
      toast.error('Erro ao processar arquivo CSV');
      console.error('CSV validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.isValid || !user) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: validationResult.validRows.length, currentClient: '' });

    try {
      // Get user's company
      const company = await empresaService.getUserCompany(user.id);
      if (!company) {
        toast.error('Empresa não encontrada para este usuário');
        return;
      }

      setUserCompany(company);
      let successCount = 0;
      const failedImports: { client: string; error: string }[] = [];

      for (let i = 0; i < validationResult.validRows.length; i++) {
        const clientData = validationResult.validRows[i];
        const clienteName = clientData.nome_cliente || `Cliente ${i + 1}`;

        setImportProgress({
          current: i + 1,
          total: validationResult.validRows.length,
          currentClient: clienteName
        });

        try {
          // Convert CSV data to database format
          const dbData = {
            'nome_ cliente': clientData.nome_cliente,
            contato_principal: clientData.contato_principal || null,
            grupo_economico: clientData.grupo_economico || null,
            cpf_cnpj: clientData.cpf_cnpj || null,
            area: clientData.area && clientData.area.length > 0 ? clientData.area : null,
            servico_prestado: clientData.servico_prestado && clientData.servico_prestado.length > 0 ? clientData.servico_prestado : null,
            produtos_vendidos: clientData.produtos_vendidos && clientData.produtos_vendidos.length > 0 ? clientData.produtos_vendidos : null,
            potencial: clientData.potencial || null,
            nota_potencial: clientData.nota_potencial || null,
            data_inicio: clientData.data_inicio || null,
            cidade: clientData.cidade || null,
            estado: clientData.estado || null,
            pais: clientData.pais || null,
            relacionamento_exterior: clientData.relacionamento_exterior || false,
            porte_empresa: clientData.porte_empresa || null,
            quem_trouxe: clientData.quem_trouxe || null,
            tipo_contrato: clientData.tipo_contrato || null,
            ocupacao_cliente: clientData.ocupacao_cliente || null,
            whatsapp: clientData.whatsapp || null,
            email: clientData.email || null,
            empresa_id: null // Will be set by clienteService.create
          };

          const result = await clienteService.create(dbData, company.id);
          if (result) {
            successCount++;
          } else {
            failedImports.push({ client: clienteName, error: 'Falha ao salvar no banco de dados' });
          }
        } catch (error) {
          failedImports.push({
            client: clienteName,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportComplete(true);

      if (failedImports.length === 0) {
        toast.success(`Importação concluída! ${successCount} clientes importados com sucesso.`);
      } else {
        toast.warning(`Importação parcial: ${successCount} sucessos, ${failedImports.length} falhas.`);
      }

      if (onClientesImported) {
        onClientesImported();
      }
    } catch (error) {
      toast.error('Erro durante a importação');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setValidationResult(null);
    setImportComplete(false);
    setImportProgress({ current: 0, total: 0, currentClient: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && !isImporting && !isValidating) {
      resetModal();
    }
    setOpen(open);
  };

  const renderValidationErrors = (errors: ValidationError[]) => {
    const groupedErrors = errors.reduce((acc, error) => {
      if (!acc[error.row]) {
        acc[error.row] = [];
      }
      acc[error.row].push(error);
      return acc;
    }, {} as { [row: number]: ValidationError[] });

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {Object.entries(groupedErrors).map(([row, rowErrors]) => (
          <Card key={row} className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium">
                {row === '0' ? 'Erro no arquivo' : `Linha ${row}`}
              </span>
            </div>
            <div className="space-y-1">
              {rowErrors.map((error, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  <span className="font-medium">{error.field}:</span> {error.message}
                  {error.value && <span className="text-xs"> (valor: "{error.value}")</span>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Importar Clientes via CSV
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV para importar múltiplos clientes de uma vez
          </DialogDescription>
        </DialogHeader>

        

        <div className="space-y-6">
          {/* Download Templates Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Download className="mr-2 h-5 w-5" />
                Downloads
              </CardTitle>
              <CardDescription>
                Baixe o template e as instruções antes de fazer o upload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    try {
                      downloadCSVTemplate();
                      toast.success('Template CSV baixado com sucesso!');
                    } catch (error) {
                      toast.error('Erro ao baixar template CSV');
                      console.error('Template download error:', error);
                    }
                  }}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Baixar Template CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    try {
                      downloadInstructions();
                      toast.success('Instruções baixadas com sucesso!');
                    } catch (error) {
                      toast.error('Erro ao baixar instruções');
                      console.error('Instructions download error:', error);
                    }
                  }}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Baixar Instruções
                </Button>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Use o template fornecido e siga as instruções para evitar erros na importação.
                  A coluna empresa_id será preenchida automaticamente pelo sistema.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Upload className="mr-2 h-5 w-5" />
                Upload do Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isImporting || isValidating}
                />
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting || isValidating}
                    >
                      Selecionar Arquivo CSV
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ou arraste e solte o arquivo aqui
                  </p>
                </div>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{file.name}</span>
                    <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                  <Button
                    onClick={handleValidateFile}
                    disabled={isValidating || isImporting}
                    size="sm"
                  >
                    {isValidating ? 'Validando...' : 'Validar Arquivo'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  {validationResult.isValid ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      Validação Bem-sucedida
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-5 w-5 text-destructive" />
                      Erros de Validação
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{validationResult.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Total de linhas</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{validationResult.validRows.length}</div>
                    <div className="text-sm text-muted-foreground">Linhas válidas</div>
                  </div>
                </div>

                {!validationResult.isValid && (
                  <div>
                    <h4 className="font-medium mb-3 text-destructive">
                      Erros encontrados ({validationResult.errors.length}):
                    </h4>
                    {renderValidationErrors(validationResult.errors)}
                  </div>
                )}

                {validationResult.isValid && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleImport}
                      disabled={isImporting}
                      size="lg"
                      className="w-full"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      {isImporting ? 'Importando...' : `Importar ${validationResult.validRows.length} Clientes`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Progress */}
          {isImporting && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Progresso da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Importando clientes...</span>
                    <span>{importProgress.current} de {importProgress.total}</span>
                  </div>
                  <Progress
                    value={(importProgress.current / importProgress.total) * 100}
                    className="w-full"
                  />
                </div>
                {importProgress.currentClient && (
                  <p className="text-sm text-muted-foreground">
                    Processando: {importProgress.currentClient}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Complete */}
          {importComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-green-600">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Importação Concluída
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Os clientes foram importados com sucesso! A página será atualizada automaticamente.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isImporting || isValidating}
          >
            {importComplete ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}