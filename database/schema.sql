CREATE TABLE dbo.Eleve (
    Matricule nvarchar(30) NOT NULL PRIMARY KEY,
    nom nvarchar(80) NOT NULL,
    Postnom nvarchar(80) NULL,
    prenom nvarchar(80) NOT NULL,
    TelephoneParent nvarchar(30) NULL,
    CodeClasse nvarchar(20) NULL
);
CREATE TABLE dbo.Periode (
    CodePeriode nvarchar(30) NOT NULL PRIMARY KEY,
    libelle nvarchar(100) NOT NULL
);
CREATE SEQUENCE dbo.SequencePaiement AS int START WITH 100 INCREMENT BY 1;
CREATE TABLE dbo.Paiement (
    NumPaiement nvarchar(30) NOT NULL PRIMARY KEY,
    DatePaiement datetime2 NOT NULL,
    Montant decimal(12,2) NOT NULL CHECK (Montant > 0),
    modepaiement nvarchar(40) NOT NULL,
    tranche nvarchar(80) NOT NULL,
    CodePeriode nvarchar(30) NOT NULL REFERENCES dbo.Periode(CodePeriode),
    MatriculeEleve nvarchar(30) NOT NULL REFERENCES dbo.Eleve(Matricule)
);
