package com.impressora.elgisa.dto;

import com.impressora.elgisa.model.Impressora;
import com.impressora.elgisa.model.Aba10;

public class ImpressoraComAba10DTO {
    private Impressora impressora;
    private Aba10 aba10;

    public ImpressoraComAba10DTO(Impressora impressora, Aba10 aba10) {
        this.impressora = impressora;
        this.aba10 = aba10;
    }

    public Impressora getImpressora() {
        return impressora;
    }

    public void setImpressora(Impressora impressora) {
        this.impressora = impressora;
    }

    public Aba10 getAba10() {
        return aba10;
    }

    public void setAba10(Aba10 aba10) {
        this.aba10 = aba10;
    }
}