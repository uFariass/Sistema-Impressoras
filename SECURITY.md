# 🔒 Guia de Segurança - Sistema Elgisa

## ✅ Implementações de Segurança

### 1. Autenticação JWT
- Tokens com expiração de 30 minutos
- Validação automática em todas as requisições
- Logout automático por inatividade (15 min)

### 2. Proteção contra Ataques
- **XSS**: Sanitização HTML automática
- **SQL Injection**: Validação rigorosa de entrada
- **CSRF**: Headers de segurança configurados
- **Brute Force**: Rate limiting (5 tentativas/5min)

### 3. Logs de Auditoria
- Registro de todos os eventos de segurança
- Armazenamento em banco de dados
- Rastreamento de IP e timestamp

### 4. Backup Automático
- Backup diário às 2h da manhã
- Backup semanal aos domingos às 3h
- Retenção de 7 backups por tipo

### 5. 2FA para Administradores
- Códigos de 6 dígitos via email
- Expiração em 5 minutos
- Obrigatório para contas admin

## 🚀 Configuração de Produção

### 1. Gerar Certificado SSL
```bash
# Execute o script
generate-ssl.bat

# Ou manualmente
keytool -genkeypair -alias elgisa -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12
```

### 2. Configurar Variáveis de Ambiente
```bash
export DB_USERNAME=seu_usuario
export DB_PASSWORD=sua_senha_segura
export JWT_SECRET=sua_chave_jwt_muito_segura
```

### 3. Executar com Perfil de Produção
```bash
java -jar elgisa.jar --spring.profiles.active=prod
```

## 🧪 Testes de Segurança

### Executar Testes Automatizados
```bash
cd security-tests
node penetration-test.js
```

### Testes Manuais Recomendados
1. **Teste de Login**: Verificar rate limiting
2. **Teste de Sessão**: Validar timeout automático
3. **Teste de Permissões**: Verificar controle de acesso
4. **Teste de Backup**: Confirmar execução automática

## 📋 Checklist de Segurança

### Desenvolvimento
- [ ] Validação de entrada implementada
- [ ] Sanitização HTML ativa
- [ ] Rate limiting configurado
- [ ] Logs de auditoria funcionando
- [ ] Testes de penetração executados

### Produção
- [ ] HTTPS configurado
- [ ] Certificado SSL válido instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Backup automático testado
- [ ] 2FA ativado para admins
- [ ] Monitoramento de logs implementado

## 🚨 Resposta a Incidentes

### Em caso de suspeita de ataque:
1. Verificar logs de auditoria
2. Bloquear IPs suspeitos
3. Forçar logout de todos os usuários
4. Alterar chaves JWT
5. Notificar administradores

### Contatos de Emergência
- Administrador do Sistema: admin@elgisa.com
- Suporte Técnico: suporte@elgisa.com

## 📊 Monitoramento

### Métricas Importantes
- Tentativas de login falhadas
- Acessos não autorizados
- Tempo de resposta das APIs
- Status dos backups

### Alertas Configurados
- Mais de 10 tentativas de login falhadas/hora
- Acesso negado por falta de permissão
- Falha no backup automático
- Uso de CPU/memória acima de 80%

## 🔄 Atualizações de Segurança

### Frequência Recomendada
- **Dependências**: Mensalmente
- **Certificados SSL**: Anualmente
- **Senhas de Sistema**: Trimestralmente
- **Testes de Penetração**: Semestralmente

### Processo de Atualização
1. Testar em ambiente de desenvolvimento
2. Executar testes de segurança
3. Fazer backup completo
4. Aplicar em produção
5. Verificar funcionamento
6. Documentar alterações