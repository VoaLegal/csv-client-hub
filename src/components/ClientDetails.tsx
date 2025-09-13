import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  DollarSign, 
  User, 
  Calendar,
  Briefcase,
  Target,
  Users,
  FileText,
  Globe
} from 'lucide-react';
import { Client } from '@/types/client';
import { formatCurrency } from '@/utils/csvParser';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose }) => {
  const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = 
    ({ title, icon, children }) => (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );

  const InfoItem: React.FC<{ label: string; value?: string; link?: boolean }> = 
    ({ label, value, link = false }) => {
      if (!value) return null;
      
      return (
        <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
          <span className="text-muted-foreground text-sm">{label}:</span>
          {link ? (
            <a 
              href={label.includes('Email') ? `mailto:${value}` : `https://wa.me/${value.replace(/\D/g, '')}`}
              className="text-accent hover:underline text-sm font-medium"
              target={label.includes('WhatsApp') ? '_blank' : undefined}
              rel={label.includes('WhatsApp') ? 'noopener noreferrer' : undefined}
            >
              {value}
            </a>
          ) : (
            <span className="text-sm font-medium">{value}</span>
          )}
        </div>
      );
    };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-elegant max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{client.nomeCliente}</h2>
            {client.grupoEconomico && (
              <p className="text-muted-foreground mt-1">{client.grupoEconomico}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <DetailSection 
              title="Informações de Contato" 
              icon={<User className="h-4 w-4" />}
            >
              <div className="space-y-1">
                <InfoItem label="Contato Principal" value={client.contatoPrincipal} />
                <InfoItem label="Email" value={client.email} link={true} />
                <InfoItem label="WhatsApp" value={client.whatsapp} link={true} />
                <InfoItem label="Cidade" value={client.cidade} />
                <InfoItem label="Estado" value={client.estado} />
                <InfoItem label="País" value={client.pais} />
              </div>
            </DetailSection>

            {/* Business Information */}
            <DetailSection 
              title="Informações Empresariais" 
              icon={<Building2 className="h-4 w-4" />}
            >
              <div className="space-y-1">
                <InfoItem label="Segmento Econômico" value={client.segmentoEconomico} />
                <InfoItem label="Porte da Empresa" value={client.porteEmpresa} />
                <InfoItem label="Tipo" value={client.pfPj} />
                <InfoItem label="Área" value={client.area} />
                <InfoItem label="Produto" value={client.produto} />
                <InfoItem label="Relacionamento Exterior" value={client.relacionamentoExterior} />
              </div>
            </DetailSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Services and Potential */}
            <DetailSection 
              title="Serviços e Potencial" 
              icon={<Target className="h-4 w-4" />}
            >
              <div className="space-y-3">
                <InfoItem label="Serviços Prestados" value={client.servicosPrestados} />
                <InfoItem label="O que podemos oferecer" value={client.oQuePodemosOferecer} />
                <InfoItem label="Potencial" value={client.potencial} />
                <InfoItem label="Nota Potencial" value={client.notaPotencial} />
                <InfoItem label="Cliente Novo em 2025" value={client.clienteNovoEm2025} />
              </div>
            </DetailSection>

            {/* Financial Information */}
            <DetailSection 
              title="Informações Financeiras" 
              icon={<DollarSign className="h-4 w-4" />}
            >
              <div className="space-y-1">
                <InfoItem label="Tipo do Contrato" value={client.tipoContrato} />
                <InfoItem label="Cap Mensal de Horas" value={client.capMensalHoras} />
                <InfoItem label="Valor Mensal" value={client.valorMensal ? formatCurrency(client.valorMensal) : undefined} />
                <InfoItem label="Valor da Hora" value={client.valorHora ? formatCurrency(client.valorHora) : undefined} />
              </div>
            </DetailSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Information */}
            <DetailSection 
              title="Informações da Equipe" 
              icon={<Users className="h-4 w-4" />}
            >
              <div className="space-y-1">
                <InfoItem label="Quem trouxe (VLMA)" value={client.quemTrouveVlma} />
                <InfoItem label="Quem trouxe (Externo)" value={client.quemTrouveExterno} />
                <InfoItem label="Focal Interno" value={client.focalInterno} />
                <InfoItem label="Ocupação do Cliente" value={client.ocupacaoCliente} />
              </div>
            </DetailSection>

            {/* Additional Information */}
            <DetailSection 
              title="Informações Adicionais" 
              icon={<FileText className="h-4 w-4" />}
            >
              <div className="space-y-1">
                <InfoItem label="Identificador" value={client.identificador} />
                <InfoItem label="Data de Entrada" value={client.dataEntrada} />
                
                {/* Status Badges */}
                <div className="pt-3 space-y-2">
                  {client.clienteNovoEm2025 === 'Sim' && (
                    <Badge className="bg-info/10 text-info border-info">
                      <Calendar className="h-3 w-3 mr-1" />
                      Novo em 2025
                    </Badge>
                  )}
                  
                  {client.relacionamentoExterior && (
                    <Badge variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      Relação Internacional
                    </Badge>
                  )}
                </div>
              </div>
            </DetailSection>
          </div>
        </div>
      </div>
    </div>
  );
};