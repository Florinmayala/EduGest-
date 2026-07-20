window.onload = async () => {
    try {
        eleves.splice(0); cours.splice(0); evaluations.splice(0); bulletins.splice(0); paiements.splice(0);
        const data = await Api.getAppData();
        eleves.splice(0, eleves.length, ...data.eleve.map((e) => ({ ...e, matricule: e.Matricule, postnom: e.Postnom, dateN: e.DateNaissance, adresse: e.Adresse, telParent: e.TelephoneParent, codeClasse: e.CodeClasse })));
        cours.splice(0, cours.length, ...data.cours);
        evaluations.splice(0, evaluations.length, ...data.evaluation.map((e) => ({ ...e, idEval: e.IdEvaluation, type: e.typeEvaluation, date: e.dateevaluation, matriculeEleve: e.MatriculeEleve })));
        bulletins.splice(0, bulletins.length, ...data.bulletin.map((b) => ({ ...b, matriculeEleve: b.MatriculeEleve, codePeriode: b.CodePeriode })));
        paiements.splice(0, paiements.length, ...data.paiement.map((p) => ({ num: p.NumPaiement, date: p.DatePaiement, montant: p.Montant, mode: p.modepaiement, tranche: p.tranche, matricule: p.MatriculeEleve })));
    } catch (error) { console.error('Connexion SQL Server impossible', error); }
    renderEspaceEleve();
};
