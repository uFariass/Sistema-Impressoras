CREATE DATABASE ImpressorasDB;
GO

USE ImpressorasDB;
GO

-- Primeiro drop das tabelas se existirem
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Impressoras;
DROP TABLE IF EXISTS Aba10;
GO

-- Criar tabela Aba10
CREATE TABLE Aba10
(
    [NF_SIMPRESS1] NVARCHAR(500) NULL,
    [NUMERO_DE_SERIE] NVARCHAR(500) NULL,
    [NF_SIMPRESS2] NVARCHAR(500) NULL,
    [LOTE] NVARCHAR(500) NULL,
    [SEM_PECAS] NVARCHAR(500) NULL
);
GO

-- Criar tabela IMPRESSORAS com ID
CREATE TABLE IMPRESSORAS (
    ID              INT IDENTITY(1,1) PRIMARY KEY,
    NF_SIMPRESS     VARCHAR(50),
    NOME_ITEM       VARCHAR(100),
    NUMERO_SERIE    VARCHAR(50),
    OS_INSPECAO     VARCHAR(50),
    OS_REVISAO      VARCHAR(50),
    VALOR           VARCHAR(20),
    NF_ELGISA       VARCHAR(50),
    SERVICO         VARCHAR(50),
    SEM_PECAS       VARCHAR(50),
    FUSOR           VARCHAR(200),
    OUTRAS_PECAS1   VARCHAR(500),
    OUTRAS_PECAS2   VARCHAR(500),
    OUTRAS_PECAS3   VARCHAR(500),
    OUTRAS_PECAS4   VARCHAR(500),
    OUTRAS_PECAS5   VARCHAR(500),
    OUTRAS_PECAS6   VARCHAR(500),
    OUTRAS_PECAS7   VARCHAR(500),
    DATAREGISTRO    VARCHAR(MAX)
);
GO

-- Criar tabela Usuarios
CREATE TABLE Usuarios (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    NomeCompleto VARCHAR(150) NOT NULL,
    Usuario VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(120) NOT NULL UNIQUE,
    Cargo VARCHAR(50) NOT NULL,
    Departamento VARCHAR(100) NOT NULL,
    Status VARCHAR(20) NOT NULL,
    Senha VARCHAR(100) NOT NULL,
    DataCadastro DATETIME DEFAULT GETDATE()
);
GO

-- Inserir usuário
INSERT INTO Usuarios 
(NomeCompleto, Usuario, Email, Cargo, Departamento, Status, Senha)
VALUES (
    'Lucas Santos',
    'lucas',
    'lucas@email.com',
    'Administrador',
    'TI',
    'Ativo',
    '1234'
);
GO

-- BULK INSERTs
BULK INSERT Aba10
FROM 'C:\slq1\aba10.csv'
WITH (
     FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 2,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba1_marco.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba2_abril.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba3_maio.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba4_junho.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba5_julho.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba6_agosto.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba7_setembro.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba8_outubro.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

BULK INSERT Impressoras
FROM 'C:\slq1\aba9_novembro.csv'
WITH (
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '\n',
    FIRSTROW = 1,
    CODEPAGE = '65001',
    TABLOCK
);
GO

SELECT * FROM Impressoras;
SELECT * FROM Aba10;
SELECT * FROM Usuarios;