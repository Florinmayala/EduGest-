require('dotenv').config();
const path = require('path');
const express = require('express');
const { sql, getPool } = require('./database');

const app = express();
const port = Number(process.env.PORT || 3000);
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', asyncRoute(async (_req, res) => {
    await getPool();
    res.json({ ok: true });
}));

app.get('/api/eleves', asyncRoute(async (req, res) => {
    const pool = await getPool();
    const request = pool.request();
    let query = 'SELECT Matricule, nom, Postnom, prenom, TelephoneParent, CodeClasse FROM dbo.Eleve';
    if (req.query.classe) {
        request.input('classe', sql.NVarChar(20), req.query.classe);
        query += ' WHERE CodeClasse = @classe';
    }
    const result = await request.query(query + ' ORDER BY nom, prenom');
    res.json(result.recordset);
}));

app.get('/api/periodes', asyncRoute(async (_req, res) => {
    const pool = await getPool();
    const result = await pool.request().query('SELECT CodePeriode, libelle FROM dbo.Periode ORDER BY CodePeriode DESC');
    res.json(result.recordset);
}));

app.get('/api/paiements', asyncRoute(async (req, res) => {
    const pool = await getPool();
    const request = pool.request();
    let query = `SELECT NumPaiement, CONVERT(varchar(16), DatePaiement, 120) AS DatePaiement,
                        Montant, modepaiement, tranche, CodePeriode, MatriculeEleve FROM dbo.Paiement`;
    if (req.query.matricule) {
        request.input('matricule', sql.NVarChar(30), req.query.matricule);
        query += ' WHERE MatriculeEleve = @matricule';
    }
    const result = await request.query(query + ' ORDER BY DatePaiement DESC');
    res.json(result.recordset);
}));

app.post('/api/paiements', asyncRoute(async (req, res) => {
    const { montant, modepaiement, tranche, codePeriode, matriculeEleve } = req.body;
    if (!Number.isFinite(Number(montant)) || Number(montant) <= 0 || !modepaiement || !tranche || !codePeriode || !matriculeEleve) {
        return res.status(400).json({ message: 'Les informations du paiement sont incomplètes ou invalides.' });
    }
    const pool = await getPool();
    const request = pool.request();
    request.input('montant', sql.Decimal(12, 2), Number(montant));
    request.input('modepaiement', sql.NVarChar(40), modepaiement);
    request.input('tranche', sql.NVarChar(80), tranche);
    request.input('codePeriode', sql.NVarChar(30), codePeriode);
    request.input('matriculeEleve', sql.NVarChar(30), matriculeEleve);
    const result = await request.query(`
        DECLARE @numero nvarchar(30) = CONCAT('REC-', RIGHT(CONCAT('000000', NEXT VALUE FOR dbo.SequencePaiement), 6));
        INSERT INTO dbo.Paiement (NumPaiement, DatePaiement, Montant, modepaiement, tranche, CodePeriode, MatriculeEleve)
        OUTPUT INSERTED.NumPaiement, CONVERT(varchar(16), INSERTED.DatePaiement, 120) AS DatePaiement, INSERTED.Montant, INSERTED.modepaiement, INSERTED.tranche, INSERTED.CodePeriode, INSERTED.MatriculeEleve
        VALUES (@numero, SYSDATETIME(), @montant, @modepaiement, @tranche, @codePeriode, @matriculeEleve);`);
    res.status(201).json(result.recordset[0]);
}));

// Donnees communes aux quatre interfaces. Les noms de colonnes correspondent au front existant.
app.get('/api/app-data', asyncRoute(async (_req, res) => {
    const pool = await getPool();
    const queries = {
        anneeScolaire: 'SELECT CodeAnnee, libelle FROM dbo.AnneeScolaire',
        niveau: 'SELECT codeNiveau, libelle FROM dbo.Niveau',
        periode: 'SELECT CodePeriode, libelle, codeAnnee FROM dbo.Periode',
        classe: 'SELECT CodeClasse, libelle, capaciteMax, codeniveau FROM dbo.Classe',
        cours: 'SELECT codecours, titre, volumeHoraire FROM dbo.Cours',
        enseignant: 'SELECT MatriculeEnseignant, nom, prenom, sexe, specialite, telephone, dateembauche, adresse FROM dbo.Enseignant',
        eleve: 'SELECT Matricule, nom, Postnom, prenom, sexe, DateNaissance, TelephoneParent, Adresse, CodeClasse FROM dbo.Eleve',
        frequenter: 'SELECT MatriculeEleve, codeAnnee FROM dbo.Frequenter',
        suivre: 'SELECT Codeclasse, codecours FROM dbo.Suivre',
        dispenser: 'SELECT Codecours, matriculeEnseignant FROM dbo.Dispenser',
        evaluation: 'SELECT IdEvaluation, typeEvaluation, CONVERT(varchar(10), dateevaluation, 23) AS dateevaluation, note, codecours, MatriculeEleve FROM dbo.Evaluation',
        bulletin: 'SELECT numBulletin, moyenne, resultat, MatriculeEleve, CodePeriode FROM dbo.Bulletin',
        paiement: 'SELECT NumPaiement, CONVERT(varchar(16), DatePaiement, 120) AS DatePaiement, Montant, modepaiement, tranche, CodePeriode, MatriculeEleve FROM dbo.Paiement'
    };
    const entries = await Promise.all(Object.entries(queries).map(async ([key, query]) => [key, (await pool.request().query(query)).recordset]));
    res.json(Object.fromEntries(entries));
}));

const adminInsert = {
    annee: ['INSERT INTO dbo.AnneeScolaire (CodeAnnee, libelle) VALUES (@CodeAnnee, @libelle)', ['CodeAnnee', 'libelle']],
    niveau: ['INSERT INTO dbo.Niveau (codeNiveau, libelle) VALUES (@codeNiveau, @libelle)', ['codeNiveau', 'libelle']],
    periode: ['INSERT INTO dbo.Periode (CodePeriode, libelle, codeAnnee) VALUES (@CodePeriode, @libelle, @codeAnnee)', ['CodePeriode', 'libelle', 'codeAnnee']],
    classe: ['INSERT INTO dbo.Classe (CodeClasse, libelle, capaciteMax, codeniveau) VALUES (@CodeClasse, @libelle, @capaciteMax, @codeniveau)', ['CodeClasse', 'libelle', 'capaciteMax', 'codeniveau']],
    cours: ['INSERT INTO dbo.Cours (codecours, titre, volumeHoraire) VALUES (@codecours, @titre, @volumeHoraire)', ['codecours', 'titre', 'volumeHoraire']],
    suivre: ['INSERT INTO dbo.Suivre (Codeclasse, codecours) VALUES (@Codeclasse, @codecours)', ['Codeclasse', 'codecours']],
    dispenser: ['INSERT INTO dbo.Dispenser (Codecours, matriculeEnseignant) VALUES (@Codecours, @matriculeEnseignant)', ['Codecours', 'matriculeEnseignant']]
};
app.post('/api/admin/structure/:resource', asyncRoute(async (req, res) => {
    const definition = adminInsert[req.params.resource];
    if (!definition) return res.status(404).json({ message: 'Ressource inconnue.' });
    if (definition[1].some((key) => req.body[key] === undefined || req.body[key] === '')) return res.status(400).json({ message: 'Champs obligatoires manquants.' });
    const request = (await getPool()).request();
    definition[1].forEach((key) => request.input(key, req.body[key]));
    await request.query(definition[0]);
    res.status(201).json({ ok: true });
}));

app.post('/api/admin/eleves', asyncRoute(async (req, res) => {
    const b = req.body;
    if (!b.nom || !b.prenom || !b.sexe || !b.CodeClasse || !b.codeAnnee) return res.status(400).json({ message: 'Dossier élève incomplet.' });
    const request = (await getPool()).request();
    ['nom', 'Postnom', 'prenom', 'sexe', 'DateNaissance', 'TelephoneParent', 'Adresse', 'CodeClasse', 'codeAnnee'].forEach((key) => request.input(key, b[key] || null));
    const result = await request.query(`DECLARE @mat nvarchar(30) = CONCAT('MAT', RIGHT(CONCAT('000000', NEXT VALUE FOR dbo.SequenceEleve), 6));
        INSERT INTO dbo.Eleve (Matricule, nom, Postnom, prenom, sexe, DateNaissance, TelephoneParent, Adresse, CodeClasse) VALUES (@mat,@nom,@Postnom,@prenom,@sexe,@DateNaissance,@TelephoneParent,@Adresse,@CodeClasse);
        INSERT INTO dbo.Frequenter (MatriculeEleve, codeAnnee) VALUES (@mat,@codeAnnee); SELECT @mat AS Matricule;`);
    res.status(201).json(result.recordset[0]);
}));

app.post('/api/admin/enseignants', asyncRoute(async (req, res) => {
    const b = req.body;
    if (!b.nom || !b.prenom || !b.sexe || !b.specialite) return res.status(400).json({ message: 'Dossier enseignant incomplet.' });
    const request = (await getPool()).request();
    ['nom', 'prenom', 'sexe', 'specialite', 'telephone', 'dateembauche', 'adresse'].forEach((key) => request.input(key, b[key] || null));
    const result = await request.query(`DECLARE @mat nvarchar(30) = CONCAT('PRF', RIGHT(CONCAT('000000', NEXT VALUE FOR dbo.SequenceEnseignant), 6));
        INSERT INTO dbo.Enseignant (MatriculeEnseignant,nom,prenom,sexe,specialite,telephone,dateembauche,adresse) VALUES (@mat,@nom,@prenom,@sexe,@specialite,@telephone,@dateembauche,@adresse); SELECT @mat AS MatriculeEnseignant;`);
    res.status(201).json(result.recordset[0]);
}));

app.post('/api/evaluations/bulk', asyncRoute(async (req, res) => {
    const { codecours, typeEvaluation, dateevaluation, notes } = req.body;
    if (!codecours || !typeEvaluation || !dateevaluation || !Array.isArray(notes) || !notes.length) return res.status(400).json({ message: 'Notes invalides.' });
    const transaction = new sql.Transaction(await getPool());
    await transaction.begin();
    try {
        for (const item of notes) {
            const request = new sql.Request(transaction);
            request.input('matricule', item.matricule); request.input('note', sql.Decimal(5, 2), item.note);
            request.input('cours', codecours); request.input('type', typeEvaluation); request.input('date', dateevaluation);
            await request.query(`DECLARE @id nvarchar(30)=CONCAT('EV', NEXT VALUE FOR dbo.SequenceEvaluation); INSERT INTO dbo.Evaluation (IdEvaluation,typeEvaluation,dateevaluation,note,codecours,MatriculeEleve) VALUES (@id,@type,@date,@note,@cours,@matricule);`);
        }
        await transaction.commit(); res.status(201).json({ count: notes.length });
    } catch (error) { await transaction.rollback(); throw error; }
}));

app.use('/api', (_req, res) => res.status(404).json({ message: 'Route API introuvable.' }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Erreur du serveur ou de SQL Server.' });
});
app.listen(port, () => console.log(`EduGest disponible sur http://localhost:${port}`));
