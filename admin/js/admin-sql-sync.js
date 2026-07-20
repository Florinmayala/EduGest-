async function refreshAdminFromSql() {
    Object.keys(db).forEach((key) => db[key].splice(0));
    const data = await Api.getAppData();
    Object.keys(db).forEach((key) => { if (data[key]) db[key].splice(0, db[key].length, ...data[key]); });
}
async function adminSave(resource, data, message) {
    try { await Api.createAdmin(resource, data); await refreshAdminFromSql(); renderData(); showNotif(message); }
    catch (error) { showNotif(error.message); }
}
window.addAnnee = () => adminSave('annee', { CodeAnnee: 'A' + Date.now().toString().slice(-6), libelle: document.getElementById('input-annee-lib').value }, 'Année enregistrée');
window.addNiveau = () => adminSave('niveau', { codeNiveau: 'N' + Date.now().toString().slice(-6), libelle: document.getElementById('input-niveau-lib').value }, 'Niveau enregistré');
window.addPeriode = () => adminSave('periode', { CodePeriode: 'P' + Date.now().toString().slice(-6), libelle: document.getElementById('input-periode-lib').value, codeAnnee: ACTIVE_YEAR }, 'Période enregistrée');
window.submitClasse = () => adminSave('classe', { CodeClasse: document.getElementById('cl-code').value.toUpperCase(), libelle: document.getElementById('cl-lib').value, capaciteMax: Number(document.getElementById('cl-cap').value), codeniveau: document.getElementById('cl-niveau').value }, 'Classe enregistrée');
window.submitCours = () => adminSave('cours', { codecours: document.getElementById('cr-code').value.toUpperCase(), titre: document.getElementById('cr-titre').value, volumeHoraire: Number(document.getElementById('cr-vol').value) }, 'Cours enregistré');
window.addRelationSuivre = () => adminSave('suivre', { Codeclasse: document.getElementById('select-suivre-classe').value, codecours: document.getElementById('select-suivre-cours').value }, 'Affectation enregistrée');
window.addRelationDispenser = () => adminSave('dispenser', { matriculeEnseignant: document.getElementById('select-disp-prof').value, Codecours: document.getElementById('select-disp-cours').value }, 'Affectation enregistrée');
window.submitEleve = async (event) => { event.preventDefault(); await adminSave('eleves', { nom: document.getElementById('el-nom').value.toUpperCase(), Postnom: document.getElementById('el-postnom').value.toUpperCase(), prenom: document.getElementById('el-prenom').value, sexe: document.getElementById('el-sexe').value, DateNaissance: document.getElementById('el-date').value, TelephoneParent: document.getElementById('el-tel').value, Adresse: document.getElementById('el-adresse').value, CodeClasse: document.getElementById('el-classe').value, codeAnnee: document.getElementById('el-annee').value }, 'Élève enregistré'); };
window.submitProf = async (event) => { event.preventDefault(); await adminSave('enseignants', { nom: document.getElementById('pr-nom').value.toUpperCase(), prenom: document.getElementById('pr-prenom').value, sexe: document.getElementById('pr-sexe').value, specialite: document.getElementById('pr-spec').value, telephone: document.getElementById('pr-tel').value, dateembauche: document.getElementById('pr-date').value, adresse: document.getElementById('pr-adresse').value }, 'Enseignant enregistré'); };
window.onload = async () => {
    try { await refreshAdminFromSql(); renderData(); switchTab('dashboard'); }
    catch (error) { showNotif(`Connexion SQL Server impossible : ${error.message}`); }
};
