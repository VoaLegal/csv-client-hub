import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { CSVDataType } from "@/types/portfolio";
import { getCSVTypeDisplayName, getCSVTypeDescription } from "@/utils/csvDetector";

interface CSVTemplateDownloaderProps {
  type: CSVDataType;
  className?: string;
}

const getTemplateFileName = (type: CSVDataType): string => {
  const fileNames = {
    'portfolio': 'portfolio-template.csv',
    'ativos': 'ativos-template.csv',
    'clientes': 'clientes-template.csv',
    'unknown': ''
  };
  return fileNames[type] || '';
};

export function CSVTemplateDownloader({ type, className }: CSVTemplateDownloaderProps) {
  const handleDownload = () => {
    const fileName = getTemplateFileName(type);
    if (!fileName) return;

    const link = document.createElement('a');
    link.href = `/templates/${fileName}`;
    link.download = fileName;
    link.click();
  };

  if (type === 'unknown') {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      className={`p-2 h-8 w-8 ${className}`}
      title="Baixar modelo CSV"
    >
      <FileDown className="w-4 h-4" />
    </Button>
  );
}

interface CSVTemplateListProps {
  className?: string;
}

export function CSVTemplateList({ className }: CSVTemplateListProps) {
  const types: CSVDataType[] = ['portfolio', 'ativos', 'clientes'];

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-base font-medium text-muted-foreground mb-3">
        Modelos disponíveis:
      </h3>

      {types.map((type) => (
        <div key={type} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group">
          <div className="flex-1">
            <div className="text-sm font-medium">{getCSVTypeDisplayName(type)}</div>
            <div className="text-xs text-muted-foreground">
              {getCSVTypeDescription(type)}
            </div>
          </div>
          <CSVTemplateDownloader type={type} />
        </div>
      ))}
    </div>
  );
}