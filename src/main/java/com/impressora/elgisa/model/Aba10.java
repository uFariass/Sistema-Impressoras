package com.impressora.elgisa.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Aba10", schema = "dbo")
public class Aba10 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NUMERO_DE_SERIE", length = 500)
    private String numeroDeSerie;

    @Column(name = "NF_SIMPRESS1", length = 500)
    private String nfSimpress1;

    @Column(name = "NF_SIMPRESS2", length = 500)
    private String nfSimpress2;

    @Column(name = "LOTE", length = 500)
    private String lote;

    @Column(name = "SEM_PECAS", length = 500)
    private String semPecas;

    public Aba10() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNfSimpress1() {
        return nfSimpress1;
    }

    public void setNfSimpress1(String nfSimpress1) {
        this.nfSimpress1 = nfSimpress1;
    }

    public String getNumeroDeSerie() {
        return numeroDeSerie;
    }

    public void setNumeroDeSerie(String numeroDeSerie) {
        this.numeroDeSerie = numeroDeSerie;
    }

    public String getNfSimpress2() {
        return nfSimpress2;
    }

    public void setNfSimpress2(String nfSimpress2) {
        this.nfSimpress2 = nfSimpress2;
    }

    public String getLote() {
        return lote;
    }

    public void setLote(String lote) {
        this.lote = lote;
    }

    public String getSemPecas() {
        return semPecas;
    }

    public void setSemPecas(String semPecas) {
        this.semPecas = semPecas;
    }
}
