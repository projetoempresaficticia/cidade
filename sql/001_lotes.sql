-- Cidade — lotes reclamados por empresas reais (PRD-08, item 3).
-- Os 13 lotes fixos (ClassCard, Prepacoin, ...) são os apps do
-- ecossistema, não empresas — ficam hardcoded em app.js, não entram
-- aqui. Esta tabela é só para empresas reais (Padaria Central, etc.)
-- que reclamam um lote livre e definem o seu prédio.

-- nome_empresa/email_empresa ficam copiados aqui no momento da escrita
-- (não é um JOIN em tempo de leitura) porque `empresas` não tem
-- policy de leitura pública (só o professor e o vínculo da própria
-- empresa lêem `empresas` diretamente) -- mudar essa RLS partilhada
-- só para a Cidade não valeria a pena; a cópia é feita dentro da RPC
-- security definer, que já lê `empresas` sem essa restrição.
create table public.cidade_lotes (
  id uuid primary key default gen_random_uuid(),
  empresa_cedula text not null unique references public.empresas(cedula),
  nome_empresa text,
  email_empresa text,
  tipo_predio text not null,
  linha int not null,
  coluna int not null,
  foto_caminho text,
  link text,
  rede_social text,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  unique (linha, coluna)
);

alter table public.cidade_lotes enable row level security;

create policy "lotes sao publicos"
  on public.cidade_lotes for select
  using (true);

-- porta única: o meu próprio lote (ou null, se ainda não tenho)
create or replace function public.cidade_meu_lote()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa text;
  v_lote public.cidade_lotes;
begin
  v_empresa := public.fn_minha_empresa_cedula();
  if v_empresa is null then
    return jsonb_build_object('ok', true, 'dados', null);
  end if;

  select * into v_lote from public.cidade_lotes where empresa_cedula = v_empresa;
  if not found then
    return jsonb_build_object('ok', true, 'dados', null);
  end if;

  return jsonb_build_object('ok', true, 'dados', to_jsonb(v_lote));
end;
$$;

-- cria ou atualiza o lote da empresa da sessão (upsert por empresa_cedula)
create or replace function public.cidade_definir_lote(
  p_tipo_predio text,
  p_linha int,
  p_coluna int,
  p_foto_caminho text,
  p_link text,
  p_rede_social text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa text;
  v_nome text;
  v_email text;
  v_lote public.cidade_lotes;
begin
  v_empresa := public.fn_minha_empresa_cedula();
  if v_empresa is null then
    return jsonb_build_object('ok', false, 'erro', 'Sem sessão de empresa.');
  end if;
  if p_tipo_predio is null or p_tipo_predio = '' then
    return jsonb_build_object('ok', false, 'erro', 'Escolha um tipo de prédio.');
  end if;
  if p_linha is null or p_coluna is null or p_linha < 0 or p_coluna < 0
     or p_linha > 200 or p_coluna > 200 then
    return jsonb_build_object('ok', false, 'erro', 'Posição inválida.');
  end if;

  select nome, email_empresa into v_nome, v_email from public.empresas where cedula = v_empresa;

  begin
    insert into public.cidade_lotes(
      empresa_cedula, tipo_predio, linha, coluna, foto_caminho, link, rede_social,
      nome_empresa, email_empresa
    )
    values (v_empresa, p_tipo_predio, p_linha, p_coluna, p_foto_caminho, p_link, p_rede_social,
      v_nome, v_email)
    on conflict (empresa_cedula) do update
      set tipo_predio = excluded.tipo_predio,
          linha = excluded.linha,
          coluna = excluded.coluna,
          foto_caminho = excluded.foto_caminho,
          link = excluded.link,
          rede_social = excluded.rede_social,
          nome_empresa = excluded.nome_empresa,
          email_empresa = excluded.email_empresa,
          atualizada_em = now()
    returning * into v_lote;
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'erro', 'Esse lote já está ocupado por outra empresa.');
  end;

  return jsonb_build_object('ok', true, 'dados', to_jsonb(v_lote));
end;
$$;

revoke all on function public.cidade_meu_lote() from public, anon;
grant execute on function public.cidade_meu_lote() to authenticated;

revoke all on function public.cidade_definir_lote(text, int, int, text, text, text) from public, anon;
grant execute on function public.cidade_definir_lote(text, int, int, text, text, text) to authenticated;

-- bucket público das fotos dos lotes -- mesmo desenho do bucket
-- 'avatares' do ClassCard, só que a pasta é a cédula da EMPRESA
-- (fn_minha_empresa_cedula()), não o auth.uid() da pessoa, porque
-- quem publica aqui é a empresa.
insert into storage.buckets (id, name, public)
values ('cidade', 'cidade', true)
on conflict (id) do nothing;

create policy "empresa envia a propria foto"
  on storage.objects for insert
  with check (bucket_id = 'cidade' and (storage.foldername(name))[1] = public.fn_minha_empresa_cedula());

create policy "empresa atualiza a propria foto"
  on storage.objects for update
  using (bucket_id = 'cidade' and (storage.foldername(name))[1] = public.fn_minha_empresa_cedula());

create policy "empresa remove a propria foto"
  on storage.objects for delete
  using (bucket_id = 'cidade' and (storage.foldername(name))[1] = public.fn_minha_empresa_cedula());

create policy "leitura publica das fotos da cidade"
  on storage.objects for select
  using (bucket_id = 'cidade');
