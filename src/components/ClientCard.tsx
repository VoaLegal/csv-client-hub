import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  DollarSign, 
  User, 
  Calendar,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { Client } from '@/types/client';
import { formatCurrency } from '@/utils/csvParser';

interface ClientCardProps {
  client: Client;
  onViewDetails?: (client: Client) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onViewDetails }) => {
  const getPorteColor = (porte?: string) => {
    switch (porte?.toLowerCase()) {
      case 'muito grande': return 'bg-success text-success-foreground';
      case 'grande': return 'bg-info text-info-foreground';
      case 'médio': return 'bg-warning text-warning-foreground';
      case 'pequeno': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPotencialColor = (potencial?: string) => {
    switch (potencial?.toLowerCase()) {
      case 'muito alto': return 'bg-success text-success-foreground';
      case 'alto': return 'bg-info text-info-foreground';
      case 'médio': return 'bg-warning text-warning-foreground';
      case 'baixo': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-smooth group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
              {client.nomeCliente}
            </h3>
            {client.grupoEconomico && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="h-3 w-3 mr-1" />
                {client.grupoEconomico}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {client.porteEmpresa && (
              <Badge variant="secondary" className={getPorteColor(client.porteEmpresa)}>
                {client.porteEmpresa}
              </Badge>
            )}
            {client.potencial && (
              <Badge variant="outline" className={getPotencialColor(client.potencial)}>
                Potencial: {client.potencial}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {client.contatoPrincipal && (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Contato:</span>
              <span className="ml-1">{client.contatoPrincipal}</span>
            </div>
          )}
          
          {(client.cidade || client.estado) && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {[client.cidade, client.estado].filter(Boolean).join(', ')}
                {client.pais && client.pais !== 'Brasil' && ` - ${client.pais}`}
              </span>
            </div>
          )}

          {client.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <a 
                href={`mailto:${client.email}`}
                className="text-accent hover:underline"
              >
                {client.email}
              </a>
            </div>
          )}

          {client.whatsapp && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <a 
                href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {client.whatsapp}
              </a>
            </div>
          )}
        </div>

        {/* Business Information */}
        <div className="space-y-2 pt-2 border-t">
          {client.segmentoEconomico && (
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Segmento:</span>
              <span className="ml-1">{client.segmentoEconomico}</span>
            </div>
          )}

          {client.pfPj && (
            <Badge variant="outline" className="text-xs">
              {client.pfPj}
            </Badge>
          )}

          {client.clienteNovoEm2025 === 'Sim' && (
            <Badge variant="outline" className="text-xs bg-info/10 text-info border-info">
              <Calendar className="h-3 w-3 mr-1" />
              Novo em 2025
            </Badge>
          )}
        </div>

        {/* Financial Information */}
        {(client.valorMensal || client.valorHora) && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center text-sm font-medium">
              <DollarSign className="h-4 w-4 mr-2 text-success" />
              Informações Financeiras
            </div>
            
            {client.valorMensal && (
              <div className="text-sm">
                <span className="text-muted-foreground">Valor mensal:</span>
                <span className="ml-2 font-semibold text-success">
                  {formatCurrency(client.valorMensal)}
                </span>
              </div>
            )}
            
            {client.valorHora && (
              <div className="text-sm">
                <span className="text-muted-foreground">Valor hora:</span>
                <span className="ml-2 font-semibold">
                  {formatCurrency(client.valorHora)}
                </span>
              </div>
            )}
            
            {client.capMensalHoras && (
              <div className="text-sm">
                <span className="text-muted-foreground">Cap mensal:</span>
                <span className="ml-2">{client.capMensalHoras}h</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {onViewDetails && (
          <div className="pt-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(client)}
              className="w-full group/btn"
            >
              Ver Detalhes
              <ExternalLink className="h-3 w-3 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};