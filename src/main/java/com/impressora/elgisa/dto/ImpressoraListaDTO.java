package com.impressora.elgisa.dto;

public class ImpressoraListaDTO {
    private String nfSimpress;
    private String nomeItem;
    private String numeroSerie;
    private String osInspecao;
    private String osRevisao;
    private String valor;
    private String nfElgisa;
    private String servico;
    private String semPecas;
    private String fusor;
    private String outrasPecas1;
    private String outrasPecas2;
    private String outrasPecas3;
    private String outrasPecas4;
    private String outrasPecas5;
    private String outrasPecas6;
    private String outrasPecas7;
    private String dataRegistro;

    public ImpressoraListaDTO(Object[] row) {
        this.nfSimpress = (String) row[0];
        this.nomeItem = (String) row[1];
        this.numeroSerie = (String) row[2];
        this.osInspecao = (String) row[3];
        this.osRevisao = (String) row[4];
        this.valor = (String) row[5];
        this.nfElgisa = (String) row[6];
        this.servico = (String) row[7];
        this.semPecas = (String) row[8];
        this.fusor = (String) row[9];
        this.outrasPecas1 = (String) row[10];
        this.outrasPecas2 = (String) row[11];
        this.outrasPecas3 = (String) row[12];
        this.outrasPecas4 = (String) row[13];
        this.outrasPecas5 = (String) row[14];
        this.outrasPecas6 = (String) row[15];
        this.outrasPecas7 = (String) row[16];
        this.dataRegistro = (String) row[17];
    }

    // Getters
    public String getNfSimpress() { return nfSimpress; }
    public String getNomeItem() { return nomeItem; }
    public String getNumeroSerie() { return numeroSerie; }
    public String getOsInspecao() { return osInspecao; }
    public String getOsRevisao() { return osRevisao; }
    public String getValor() { return valor; }
    public String getNfElgisa() { return nfElgisa; }
    public String getServico() { return servico; }
    public String getSemPecas() { return semPecas; }
    public String getFusor() { return fusor; }
    public String getOutrasPecas1() { return outrasPecas1; }
    public String getOutrasPecas2() { return outrasPecas2; }
    public String getOutrasPecas3() { return outrasPecas3; }
    public String getOutrasPecas4() { return outrasPecas4; }
    public String getOutrasPecas5() { return outrasPecas5; }
    public String getOutrasPecas6() { return outrasPecas6; }
    public String getOutrasPecas7() { return outrasPecas7; }
    public String getDataRegistro() { return dataRegistro; }
}