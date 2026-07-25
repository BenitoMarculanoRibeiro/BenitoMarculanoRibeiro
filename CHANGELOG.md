# Histórico de alterações

## 0.0.2 - Automação segura das estatísticas do perfil

Data: 2026-07-25

### Alterações

- Adicionadas regras permanentes de versionamento, commits e manutenção do projeto
- Fortalecido o gerador com timeout, repetições e validações de entrada, saída e SVG
- Configurado o workflow para testar e atualizar as estatísticas a cada hora
- Adicionada suíte automatizada para os fluxos de segurança e geração

### Validações

- Executados 9 testes automatizados com sucesso
- Gerado e validado o SVG usando os serviços externos reais
- Verificado o diff com `git diff --check`

### Observações

- O workflow também continua disponível por push na `main` e execução manual
