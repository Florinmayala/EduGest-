-- A executer dans une nouvelle base EduGest. Il remplace schema.sql pour toutes les interfaces.
CREATE TABLE dbo.AnneeScolaire (CodeAnnee nvarchar(30) PRIMARY KEY, libelle nvarchar(100) NOT NULL);
CREATE TABLE dbo.Niveau (codeNiveau nvarchar(30) PRIMARY KEY, libelle nvarchar(100) NOT NULL);
CREATE TABLE dbo.Classe (CodeClasse nvarchar(20) PRIMARY KEY, libelle nvarchar(100) NOT NULL, capaciteMax int NOT NULL, codeniveau nvarchar(30) NOT NULL REFERENCES dbo.Niveau(codeNiveau));
CREATE TABLE dbo.Cours (codecours nvarchar(30) PRIMARY KEY, titre nvarchar(100) NOT NULL, volumeHoraire int NOT NULL);
CREATE TABLE dbo.Enseignant (MatriculeEnseignant nvarchar(30) PRIMARY KEY, nom nvarchar(80) NOT NULL, prenom nvarchar(80) NOT NULL, sexe nchar(1) NOT NULL, specialite nvarchar(100) NOT NULL, telephone nvarchar(30), dateembauche date, adresse nvarchar(255));
CREATE TABLE dbo.Eleve (Matricule nvarchar(30) PRIMARY KEY, nom nvarchar(80) NOT NULL, Postnom nvarchar(80), prenom nvarchar(80) NOT NULL, sexe nchar(1) NOT NULL, DateNaissance date, TelephoneParent nvarchar(30), Adresse nvarchar(255), CodeClasse nvarchar(20) NOT NULL REFERENCES dbo.Classe(CodeClasse));
CREATE TABLE dbo.Periode (CodePeriode nvarchar(30) PRIMARY KEY, libelle nvarchar(100) NOT NULL, codeAnnee nvarchar(30) NOT NULL REFERENCES dbo.AnneeScolaire(CodeAnnee));
CREATE TABLE dbo.Frequenter (MatriculeEleve nvarchar(30) NOT NULL REFERENCES dbo.Eleve(Matricule), codeAnnee nvarchar(30) NOT NULL REFERENCES dbo.AnneeScolaire(CodeAnnee), PRIMARY KEY (MatriculeEleve, codeAnnee));
CREATE TABLE dbo.Suivre (Codeclasse nvarchar(20) NOT NULL REFERENCES dbo.Classe(CodeClasse), codecours nvarchar(30) NOT NULL REFERENCES dbo.Cours(codecours), PRIMARY KEY (Codeclasse, codecours));
CREATE TABLE dbo.Dispenser (Codecours nvarchar(30) NOT NULL REFERENCES dbo.Cours(codecours), matriculeEnseignant nvarchar(30) NOT NULL REFERENCES dbo.Enseignant(MatriculeEnseignant), PRIMARY KEY (Codecours, matriculeEnseignant));
CREATE SEQUENCE dbo.SequenceEleve AS int START WITH 1;
CREATE SEQUENCE dbo.SequenceEnseignant AS int START WITH 1;
CREATE SEQUENCE dbo.SequenceEvaluation AS int START WITH 1;
CREATE SEQUENCE dbo.SequencePaiement AS int START WITH 100;
CREATE TABLE dbo.Evaluation (IdEvaluation nvarchar(30) PRIMARY KEY, typeEvaluation nvarchar(50) NOT NULL, dateevaluation date NOT NULL, note decimal(5,2) NOT NULL CHECK(note BETWEEN 0 AND 20), codecours nvarchar(30) NOT NULL REFERENCES dbo.Cours(codecours), MatriculeEleve nvarchar(30) NOT NULL REFERENCES dbo.Eleve(Matricule));
CREATE TABLE dbo.Bulletin (numBulletin nvarchar(30) PRIMARY KEY, moyenne decimal(5,2) NOT NULL, resultat nvarchar(40) NOT NULL, MatriculeEleve nvarchar(30) NOT NULL REFERENCES dbo.Eleve(Matricule), CodePeriode nvarchar(30) NOT NULL REFERENCES dbo.Periode(CodePeriode));
CREATE TABLE dbo.Paiement (NumPaiement nvarchar(30) PRIMARY KEY, DatePaiement datetime2 NOT NULL, Montant decimal(12,2) NOT NULL CHECK(Montant > 0), modepaiement nvarchar(40) NOT NULL, tranche nvarchar(80) NOT NULL, CodePeriode nvarchar(30) NOT NULL REFERENCES dbo.Periode(CodePeriode), MatriculeEleve nvarchar(30) NOT NULL REFERENCES dbo.Eleve(Matricule));

-- Valeurs initiales necessaires a la premiere ouverture de l'interface Admin.
INSERT INTO dbo.AnneeScolaire (CodeAnnee, libelle) VALUES ('A26-27', 'Année scolaire 2026-2027');
INSERT INTO dbo.Niveau (codeNiveau, libelle) VALUES ('N1', 'Secondaire');
INSERT INTO dbo.Periode (CodePeriode, libelle, codeAnnee) VALUES ('T1-2026', 'Trimestre 1', 'A26-27');
