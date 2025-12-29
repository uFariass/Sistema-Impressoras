package com.impressora.elgisa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "IMPRESSORAS")
public class Impressora {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    @Column(name = "NF_SIMPRESS", length = 50)
    private String nfSimpress;
    
    @Column(name = "NOME_ITEM", length = 100)
    private String nomeItem;
    
    @Column(name = "NUMERO_SERIE", length = 50)
    private String numeroSerie;
    
    @Column(name = "OS_INSPECAO", length = 50)
    private String osInspecao;
    
    @Column(name = "OS_REVISAO", length = 50)
    private String osRevisao;
    
    @Column(name = "VALOR", length = 20)
    private String valor;
    
    @Column(name = "NF_ELGISA", length = 50)
    private String nfElgisa;
    
    @Column(name = "SERVICO", length = 50)
    private String servico;
    
    @Column(name = "STATUS_REPARO", length = 50)
    private String statusReparo;
    
    @Column(name = "STATUS_SERVICO", length = 50)
    private String statusServico;
    
    @Column(name = "DATAREGISTRO", columnDefinition = "VARCHAR(MAX)")
    private String dataRegistro;

    // Constructors
    public Impressora() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNfSimpress() { return nfSimpress; }
    public void setNfSimpress(String nfSimpress) { this.nfSimpress = nfSimpress; }
    
    public String getNomeItem() { return nomeItem; }
    public void setNomeItem(String nomeItem) { this.nomeItem = nomeItem; }
    
    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }
    
    public String getOsInspecao() { return osInspecao; }
    public void setOsInspecao(String osInspecao) { this.osInspecao = osInspecao; }
    
    public String getOsRevisao() { return osRevisao; }
    public void setOsRevisao(String osRevisao) { this.osRevisao = osRevisao; }
    
    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
    
    public String getNfElgisa() { return nfElgisa; }
    public void setNfElgisa(String nfElgisa) { this.nfElgisa = nfElgisa; }
    
    public String getServico() { return servico; }
    public void setServico(String servico) { this.servico = servico; }
    
    public String getStatusReparo() { return statusReparo; }
    public void setStatusReparo(String statusReparo) { this.statusReparo = statusReparo; }
    
    public String getStatusServico() { return statusServico; }
    public void setStatusServico(String statusServico) { this.statusServico = statusServico; }
    
    public String getDataRegistro() { return dataRegistro; }
    public void setDataRegistro(String dataRegistro) { this.dataRegistro = dataRegistro; }
}