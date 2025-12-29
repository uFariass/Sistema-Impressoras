package com.impressora.elgisa.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id")
    private Integer usuarioId;
    
    @Column(name = "usuario_nome")
    private String usuarioNome;
    
    @Column(name = "acao")
    private String acao; // CREATE, UPDATE, DELETE
    
    @Column(name = "tabela")
    private String tabela;
    
    @Column(name = "registro_id")
    private Long registroId;
    
    @Column(name = "dados_anteriores", columnDefinition = "TEXT")
    private String dadosAnteriores;
    
    @Column(name = "dados_novos", columnDefinition = "TEXT")
    private String dadosNovos;
    
    @Column(name = "data_hora")
    private LocalDateTime dataHora;
    
    @Column(name = "ip_address")
    private String ipAddress;

    // Constructors
    public AuditLog() {}
    
    public AuditLog(Integer usuarioId, String usuarioNome, String acao, String tabela, Long registroId, String dadosAnteriores, String dadosNovos, String ipAddress) {
        this.usuarioId = usuarioId;
        this.usuarioNome = usuarioNome;
        this.acao = acao;
        this.tabela = tabela;
        this.registroId = registroId;
        this.dadosAnteriores = dadosAnteriores;
        this.dadosNovos = dadosNovos;
        this.dataHora = LocalDateTime.now();
        this.ipAddress = ipAddress;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    
    public String getUsuarioNome() { return usuarioNome; }
    public void setUsuarioNome(String usuarioNome) { this.usuarioNome = usuarioNome; }
    
    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }
    
    public String getTabela() { return tabela; }
    public void setTabela(String tabela) { this.tabela = tabela; }
    
    public Long getRegistroId() { return registroId; }
    public void setRegistroId(Long registroId) { this.registroId = registroId; }
    
    public String getDadosAnteriores() { return dadosAnteriores; }
    public void setDadosAnteriores(String dadosAnteriores) { this.dadosAnteriores = dadosAnteriores; }
    
    public String getDadosNovos() { return dadosNovos; }
    public void setDadosNovos(String dadosNovos) { this.dadosNovos = dadosNovos; }
    
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}