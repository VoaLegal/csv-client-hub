import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSVTemplateContratos, downloadInstructionsContratos } from '@/utils/csvTemplate';
import { validateCSVDataContratosWithReferences, ValidationResult, ValidationError } from '@/utils/csvValidator';
import { contratoService, clienteService, areaService, servicoService, produtoService, empresaService, type Empresa } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

interface CSVUploadContratosModalProps {
  children: React.ReactNode;
  onContratosImported?: () => void;
}

interface ImportProgress {
  current: number;
  total: number;
  currentContrato: string;
}

export default function CSVUploadContratosModal({ children, onContratosImported }: CSVUploadContratosModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0, currentContrato: '' });
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
    if (!file || !user) return;

    setIsValidating(true);
    try {
      // Get user's company first
      const company = await empresaService.getUserCompany(user.id);
      if (!company) {
        toast.error('Empresa não encontrada para este usuário');
        return;
      }

      // Load reference data
      const [clientesData, areasData, servicosData, produtosData] = await Promise.all([
        clienteService.getByCompanyId(company.id),
        areaService.getAllForCompany(company.id),
        servicoService.getAllForCompany(company.id),
        produtoService.getAllForCompanyWithServico(company.id)
      ]);

      const fileContent = await file.text();
      const result = await validateCSVDataContratosWithReferences(
        fileContent,
        clientesData,
        areasData,
        servicosData,
        produtosData
      );
      
      setValidationResult(result);

      if (result.isValid) {
        toast.success(`Arquivo validado com sucesso! ${result.validRows.length} contratos prontos para importação.`);
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
    setImportProgress({ current: 0, total: validationResult.validRows.length, currentContrato: '' });

    try {
      // Get user's company
      const company = await empresaService.getUserCompany(user.id);
      if (!company) {
        toast.error('Empresa não encontrada para este usuário');
        return;
      }

      setUserCompany(company);
      let successCount = 0;
      const failedImports: { contrato: string; error: string }[] = [];

      for (let i = 0; i < validationResult.validRows.length; i++) {
        const contratoData = validationResult.validRows[i] as any;
        const contratoName = contratoData.email_cliente || `Contrato ${i + 1}`;

        setImportProgress({
          current: i + 1,
          total: validationResult.validRows.length,
          currentContrato: contratoName
        });

        try {
          // Find cliente by email
          const clientes = await clienteService.getByCompanyId(company.id);
          const cliente = clientes.find(c => c.email === contratoData.email_cliente);
          
          if (!cliente) {
            failedImports.push({ 
              contrato: contratoName, 
              error: `Cliente com e-mail "${contratoData.email_cliente}" não encontrado. Cadastre o cliente primeiro.` 
            });
            continue;
          }

          // Find area by name
          let areaId = null;
          if (contratoData.area) {
            const areas = await areaService.getAllForCompany(company.id);
            const area = areas.find(a => a.name === contratoData.area);
            areaId = area?.id || null;
          }

          // Find servico by name
          let servicoId = null;
          if (contratoData.servico) {
            const servicos = await servicoService.getAllForCompany(company.id);
            const servico = servicos.find(s => s.name === contratoData.servico);
            servicoId = servico?.id || null;
          }

          // Find produto by name
          let produtoId = null;
          if (contratoData.produto) {
            const produtos = await produtoService.getAllForCompanyWithServico(company.id);
            const produto = produtos.find(p => p.name === contratoData.produto);
            produtoId = produto?.id || null;
          }

          // Convert CSV data to database format
          const dbData = {
            cliente_id: cliente.id,
            area_id: areaId,
            servico_id: servicoId,
            produto_id: produtoId,
            tipo_contrato: contratoData.tipo_contrato || null,
            valor_contrato: contratoData.valor_contrato || null,
            data_inicio: contratoData.data_inicio || null,
            data_fim: contratoData.data_fim || null,
            quem_trouxe: contratoData.quem_trouxe || null,
            empresa_id: company.id
          };

          const result = await contratoService.create(dbData, company.id);
          if (result) {
            successCount++;
          } else {
            failedImports.push({ contrato: contratoName, error: 'Falha ao salvar no banco de dados' });
          }
        } catch (error) {
          failedImports.push({
            contrato: contratoName,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportComplete(true);

      if (failedImports.length === 0) {
        toast.success(`Importação concluída! ${successCount} contratos importados com sucesso.`);
      } else {
        toast.warning(`Importação parcial: ${successCount} sucessos, ${failedImports.length} falhas.`);
        console.log('Failed imports:', failedImports);
      }

      if (onContratosImported) {
        onContratosImported();
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
    setImportProgress({ current: 0, total: 0, currentContrato: '' });
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
            Importar Contratos via CSV
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV para importar múltiplos contratos de uma vez
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
                      downloadCSVTemplateContratos();
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
                  onClick={async () => {
                    try {
                      if (!user) {
                        toast.error('Usuário não encontrado');
                        return;
                      }

                      // Get user's company first
                      const company = await empresaService.getUserCompany(user.id);
                      if (!company) {
                        toast.error('Empresa não encontrada para este usuário');
                        return;
                      }

                      // Load reference data for instructions
                      const [areasData, servicosData, produtosData] = await Promise.all([
                        areaService.getAllForCompany(company.id),
                        servicoService.getAllForCompany(company.id),
                        produtoService.getAllForCompanyWithServico(company.id)
                      ]);

                      downloadInstructionsContratos(areasData, servicosData, produtosData);
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
                  <strong>Importante:</strong> Este template é apenas para dados de CONTRATOS. 
                  Os clientes devem já estar cadastrados no sistema (use o e-mail para identificar o cliente).
                  Áreas, serviços e produtos devem também estar cadastrados.
                  Use o template fornecido e siga as instruções para evitar erros na importação.
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
                      <FileCheck className="mr-2 h-5 w-5" />
                      {isImporting ? 'Importando...' : `Importar ${validationResult.validRows.length} Contratos`}
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
                  <FileCheck className="mr-2 h-5 w-5" />
                  Progresso da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Importando contratos...</span>
                    <span>{importProgress.current} de {importProgress.total}</span>
                  </div>
                  <Progress
                    value={(importProgress.current / importProgress.total) * 100}
                    className="w-full"
                  />
                </div>
                {importProgress.currentContrato && (
                  <p className="text-sm text-muted-foreground">
                    Processando: {importProgress.currentContrato}
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
                  Os contratos foram importados com sucesso! A página será atualizada automaticamente.
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
