# Regras específicas do projeto

Novas regras específicas solicitadas pelo proprietário devem ser registradas
neste arquivo. Não invente obrigações, não duplique regras gerais de Git e não
substitua regras incompatíveis silenciosamente; consulte o proprietário diante
de uma contradição.

## Testes obrigatórios

- Ao alterar `scripts/update-github-trophies.mjs`, seus testes ou o workflow,
  execute `npm test`.
- A falha dos testes impede a criação do commit.

## Integrações externas

- Mantenha timeout, tentativas limitadas e validação das respostas dos serviços
  externos usados para gerar as estatísticas.
- Nunca incorpore ao artefato conteúdo que falhe na validação de SVG.
- Mudanças de domínio externo devem ser explícitas e acompanhadas por testes.

## Artefatos gerados

- `assets/github-trophies-pt-br.svg` é um artefato versionado.
- O commit criado exclusivamente pelo workflow para atualizar esse artefato é
  técnico e automatizado: não recebe versão nem entrada no `CHANGELOG.md` e
  deve alterar somente o SVG.
- Ao alterar sua geração, execute `npm run update-trophies` quando houver
  acesso aos serviços externos e confira o SVG resultante.
- Uma falha de rede deve ser informada e impede a atualização do artefato, mas
  não invalida testes locais que não dependam da rede.

## Documentação

- Atualize o README quando a forma de executar, testar ou automatizar o projeto
  mudar de maneira relevante.

<!-- Exemplo inativo, somente para eventual adoção explícita:
## Build e executáveis

- Antes de cada commit que altere o aplicativo, gerar novamente o executável.
- Validar que o executável foi gerado corretamente.
- Impedir o commit se a geração falhar.
-->
