async function refreshTeacherFromSql() {
    Object.keys(db).forEach((key) => db[key].splice(0));
    const data = await Api.getAppData();
    Object.keys(db).forEach((key) => { if (data[key]) db[key].splice(0, db[key].length, ...data[key]); });
}
window.saveBulkEvaluations = async () => {
    const notes = [...document.querySelectorAll('.grade-input')].filter((input) => input.value !== '').map((input) => ({ matricule: input.dataset.mat, note: Number(input.value) }));
    if (!notes.length) return showNotif('Aucune note saisie.', 'error');
    try { await Api.saveEvaluations({ codecours: document.getElementById('eval-cours').value, typeEvaluation: document.getElementById('eval-type').value, dateevaluation: document.getElementById('eval-date').value, notes }); await refreshTeacherFromSql(); showNotif(`${notes.length} notes enregistrées dans SQL Server.`); renderCurrentTab('dashboard'); }
    catch (error) { showNotif(error.message, 'error'); }
};
window.onload = async () => { try { await refreshTeacherFromSql(); } catch (error) { showNotif(`Connexion SQL Server impossible : ${error.message}`, 'error'); } initTeacherData(); switchTab('dashboard'); };
