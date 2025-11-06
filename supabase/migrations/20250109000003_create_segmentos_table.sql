-- Criar tabela segmentos (similar a produtos e serviços)
CREATE TABLE IF NOT EXISTS public.segmentos (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT,
    empresa_id BIGINT REFERENCES public.empresas(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS segmentos_empresa_id_idx ON public.segmentos(empresa_id);
CREATE INDEX IF NOT EXISTS segmentos_name_idx ON public.segmentos(name);

-- Inserir segmentos padrão (empresa_id null = segmentos gerais disponíveis para todas as empresas)
INSERT INTO public.segmentos (name, empresa_id) VALUES
    ('Agronegócio', NULL),
    ('Audiovisual', NULL),
    ('Bebida e Alimentos', NULL),
    ('Construção civil', NULL),
    ('Empreendimentos Imobiliários', NULL),
    ('Holding Patrimonial', NULL),
    ('Holding Familiar', NULL),
    ('Energia/Gás/Combustíveis', NULL),
    ('Fintechs', NULL),
    ('Bancos e IF', NULL),
    ('Comércio', NULL),
    ('Comércio eletrônico', NULL),
    ('Entretenimento e Eventos', NULL),
    ('Serviços Profissionais', NULL),
    ('Indústria', NULL),
    ('Empresas de tech', NULL),
    ('Saúde', NULL)
ON CONFLICT DO NOTHING;

-- Adicionar coluna segmento_id na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS segmento_id BIGINT REFERENCES public.segmentos(id) ON DELETE SET NULL;

-- Migrar dados existentes de segmento_economico (TEXT) para segmento_id (FK)
-- Isso mapeia os valores de texto para os IDs dos segmentos criados acima
UPDATE public.clientes c
SET segmento_id = s.id
FROM public.segmentos s
WHERE c.segmento_economico = s.name
AND c.segmento_id IS NULL;

-- Criar índice para a foreign key
CREATE INDEX IF NOT EXISTS clientes_segmento_id_idx ON public.clientes(segmento_id);

-- Remover a coluna antiga segmento_economico e seu CHECK constraint
-- NOTA: Isso remove os dados que não foram migrados. Considere fazer backup antes!
ALTER TABLE public.clientes 
DROP COLUMN IF EXISTS segmento_economico;

