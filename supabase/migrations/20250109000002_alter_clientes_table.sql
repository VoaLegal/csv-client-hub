-- Add segmento_economico field to clientes table
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS segmento_economico TEXT CHECK (
    segmento_economico IN (
        'Agronegócio',
        'Audiovisual',
        'Bebida e Alimentos',
        'Construção civil',
        'Empreendimentos Imobiliários',
        'Holding Patrimonial',
        'Holding Familiar',
        'Energia/Gás/Combustíveis',
        'Fintechs',
        'Bancos e IF',
        'Comércio',
        'Comércio eletrônico',
        'Entretenimento e Eventos',
        'Serviços Profissionais',
        'Indústria',
        'Empresas de tech',
        'Saúde'
    )
);

-- Remove campos que agora pertencem à tabela contratos
-- NOTA: Os dados existentes serão perdidos. Considere fazer backup antes!
ALTER TABLE public.clientes 
DROP COLUMN IF EXISTS area,
DROP COLUMN IF EXISTS servico_prestado,
DROP COLUMN IF EXISTS produtos_vendidos,
DROP COLUMN IF EXISTS potencial,
DROP COLUMN IF EXISTS nota_potencial,
DROP COLUMN IF EXISTS data_inicio,
DROP COLUMN IF EXISTS quem_trouxe,
DROP COLUMN IF EXISTS tipo_contrato,
DROP COLUMN IF EXISTS ocupacao_cliente;

-- Comentário: Os campos mantidos em clientes são:
-- id, created_at, nome_ cliente, cpf_cnpj, segmento_economico, 
-- contato_principal, porte_empresa, grupo_economico, 
-- cidade, estado, pais, relacionamento_exterior, 
-- email, whatsapp, empresa_id

