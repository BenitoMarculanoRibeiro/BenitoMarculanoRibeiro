# Convenções de Git, commits e versionamento

## Comando padrão

Quando o proprietário disser `atualize o commit`, isso autoriza exatamente um
commit relacionado à tarefa atual. O comando não autoriza push, merge, rebase,
tag, release nem alteração do histórico.

Antes do commit, o Codex deve:

1. Ler `AGENTS.md` e todas as regras referenciadas.
2. Analisar `git status`, o diff preparado e o não preparado.
3. Examinar individualmente arquivos novos, modificados e removidos.
4. Excluir do escopo arquivos sensíveis, temporários ou inadequados.
5. Separar somente as alterações relacionadas à tarefa atual.
6. Cumprir `.agents/PROJECT_RULES.md`.
7. Executar testes, lint, build e validações aplicáveis.
8. Calcular a próxima versão e adicionar sua entrada ao `CHANGELOG.md`.
9. Preparar somente os arquivos conferidos, revisar o diff preparado e criar
   um único commit.
10. Confirmar no histórico que o commit existe e apresentar versão, hash e
    resultado.

## Mensagem obrigatória

Use português do Brasil e o formato:

```text
x.y.z - Título curto que descreve o resultado

- Descrição objetiva do que foi feito
- Outra alteração relevante
- Teste ou validação realmente executado
```

- Use exatamente a versão calculada.
- Prefira títulos com até 72 caracteres, sem contar a versão.
- Não termine o título com ponto.
- Preserve a linha vazia antes dos tópicos.
- Inicie todos os tópicos com `-`.
- Não use descrições genéricas nem invente validações.
- Se nenhuma validação puder ser executada, informe isso após o commit.

## Versionamento

- Leia o prefixo `x.y` em `.agents/VERSION_PREFIX`.
- Somente o proprietário pode alterar `x` ou `y`; o Codex nunca altera o
  `VERSION_PREFIX`.
- O Codex calcula apenas `z`, sempre inteiro e incremental.
- Consulte o histórico Git e o `CHANGELOG.md`, encontre o maior `z` usado com
  o prefixo atual e some 1.
- Se o prefixo ainda não tiver versão, use `z = 1`.
- Nunca reutilize, reduza ou pule intencionalmente uma versão.
- Se histórico e changelog forem incompatíveis, interrompa o commit e informe
  o conflito.

## Escopo e atomicidade

- Cada commit representa uma única alteração lógica.
- Não misture funcionalidades, correções ou refatorações sem relação.
- Proponha commits separados para mudanças independentes.
- Não use `git add .` indiscriminadamente.
- Preserve alterações do proprietário que estejam fora do escopo.
- Não descarte alterações, não inclua mudanças de origem desconhecida e não
  crie commits vazios.
- Se não for possível separar o escopo com segurança, consulte o proprietário.

## Validações anteriores ao commit

- Confira status, diff completo, arquivos novos e diff preparado.
- Execute testes, lint, build e demais verificações configuradas e relacionadas.
- Verifique documentação, dependências e configurações afetadas.
- Se uma validação falhar, corrija somente quando isso estiver claramente no
  escopo; não esconda falhas nem remova testes para fazê-los passar.
- Se a correção exigir decisão do proprietário ou ampliação relevante do
  escopo, não crie o commit e informe a falha.

## Segurança

Nunca inclua automaticamente senhas, tokens, chaves, certificados privados,
arquivos `.env` reais, sessões, cookies, credenciais, dados pessoais novos,
dados de produção, logs, caches, temporários, dependências instaladas nem
artefatos grandes sem avaliação.

Não revele conteúdos sensíveis. Informe apenas o nome ou tipo excluído, avalie
o `.gitignore` e avise se houver indício de segredo previamente versionado.

## Proteção do histórico

Sem autorização explícita, não execute push ou push forçado, amend, rebase,
reset destrutivo, descarte de alterações, remoção de branches, merge, troca de
branch com mudanças pendentes, tags, releases ou publicação de executáveis.
Prefira um novo commit a modificar um commit existente.

## Changelog permanente

- Cada commit criado por `atualize o commit` deve ter exatamente uma entrada
  correspondente no `CHANGELOG.md`, incluída no mesmo commit.
- A versão e o título devem ser idênticos aos da mensagem do commit.
- Adicione a entrada mais recente logo após o título principal.
- Entradas anteriores são imutáveis: nunca apague, reescreva, reorganize,
  resuma ou corrija uma entrada existente.
- Não duplique versões, não registre mudanças fora do commit e não inclua o
  hash do próprio commit.
- Use a data local em `AAAA-MM-DD`.
- `Alterações` é obrigatória; `Validações` e `Observações` só aparecem quando
  tiverem conteúdo real.

Formato:

```markdown
## x.y.z - Título do que foi feito

Data: AAAA-MM-DD

### Alterações

- Descrição objetiva

### Validações

- Validação realmente executada

### Observações

- Informação relevante
```

## Resultado após o commit

Informe versão, hash abreviado, título, arquivos incluídos, resumo, validações
executadas e não executadas, mudanças deixadas de fora, atualização do
`CHANGELOG.md` e confirmação de que nenhum push foi realizado. Só declare
conclusão após confirmar o commit no histórico.
