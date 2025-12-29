package com.impressora.elgisa.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "Usuarios", schema = "dbo")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;
    
    @Column(name = "NomeCompleto", nullable = false, length = 150)
    private String nomeCompleto;
    
    @Column(name = "Usuario", nullable = false, unique = true, length = 50)
    private String usuario;
    
    @Column(name = "Email", nullable = false, unique = true, length = 120)
    private String email;
    
    @Column(name = "Cargo", nullable = false, length = 50)
    private String cargo;
    
    @Column(name = "Departamento", nullable = false, length = 100)
    private String departamento;
    
    @Column(name = "Status", nullable = false, length = 20)
    private String status;
    
    @Column(name = "Senha", nullable = false, length = 100)
    private String senha;
    
    @Column(name = "DataCadastro", insertable = false, updatable = false)
    private Date dataCadastro;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Date getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Date dataCadastro) {
        this.dataCadastro = dataCadastro;
    }
}
