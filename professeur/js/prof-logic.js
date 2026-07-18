// --- 1. BASE DE DONNÉES SIMULÉE (Focus Enseignant) ---
const CURRENT_TEACHER = 'PRF001';
const ACTIVE_PERIOD = 'T1';

const db = {
    enseignant: [
        { MatriculeEnseignant: 'PRF001', nom: 'KAPINGA', prenom: 'Alain', specialite: 'Mathématiques' },
        { MatriculeEnseignant: 'PRF002', nom: 'MUSAU', prenom: 'Chantal', specialite: 'Français' }
    ],
    cours: [
        { codecours: 'MATH', titre: 'Mathématiques', volumeHoraire: 120 },
        { codecours: 'FR', titre: 'Français', volumeHoraire: 100 },
        { codecours: 'PHY', titre: 'Physique', volumeHoraire: 80 }
    ],
    classe: [
        { CodeClasse: '7A', libelle: '7ème A' },
        { CodeClasse: '8A', libelle: '8ème A' }
    ],
    eleve: [
        { Matricule: 'MAT001', nom: 'ILUNGA', Postnom: 'MBUYI', prenom: 'David', CodeClasse: '7A' },
        { Matricule: 'MAT002', nom: 'KABEYA', Postnom: '', prenom: 'Sarah', CodeClasse: '7A' },
        { Matricule: 'MAT003', nom: 'LUKUSA', Postnom: 'TSHIBANGU', prenom: 'Marc', CodeClasse: '8A' }
    ],
    dispenser: [
        { Codecours: 'MATH', matriculeEnseignant: 'PRF001' },
        { Codecours: 'PHY', matriculeEnseignant: 'PRF001' },
        { Codecours: 'FR', matriculeEnseignant: 'PRF002' }
    ],
    suivre: [
        { Codeclasse: '7A', codecours: 'MATH' },
        { Codeclasse: '7A', codecours: 'FR' },
        { Codeclasse: '7A', codecours: 'PHY' },
        { Codeclasse: '8A', codecours: 'MATH' }
    ],
    evaluation: [
        { IdEvaluation: 'EV001', typeEvaluation: 'Interrogation', dateevaluation: '2026-09-15', note: 14, codecours: 'MATH', MatriculeEleve: 'MAT001' },
        { IdEvaluation: 'EV002', typeEvaluation: 'Interrogation', dateevaluation: '2026-09-15', note: 16, codecours: 'MATH', MatriculeEleve: 'MAT002' }
    ]
};

let myCourses = [];
let myClasses = [];

const sections = ['dashboard', 'classes', 'notes', 'bulletins'];
const pageTitles = {
    dashboard: 'Tableau de bord',
    classes: 'Mes Classes et Cours',
    notes: 'Saisie des Notes (Évaluations)',
    bulletins: 'Moyennes & Fin de Période'
};

function switchTab(tabId) {
    sections.forEach(sec => {
        document.getElementById(`sec-${sec}`).classList.add('hidden');
        document.getElementById(`sec-${sec}`).classList.remove('block');
        document.getElementById(`nav-${sec}`).classList.remove('active-nav');
        document.getElementById(`nav-${sec}`).classList.add('text-violet-300');
    });

    document.getElementById(`sec-${tabId}`).classList.remove('hidden');
    document.getElementById(`sec-${tabId}`).classList.add('block');
    document.getElementById(`nav-${tabId}`).classList.add('active-nav');
    document.getElementById(`nav-${tabId}`).classList.remove('text-violet-300');
    document.getElementById('page-title').innerText = pageTitles[tabId];

    renderCurrentTab(tabId);
}

function showNotif(msg, type = 'success') {
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    const notif = document.createElement('div');
    notif.className = `fixed bottom-4 right-4 ${bg} text-white px-6 py-3 rounded shadow-lg z-50 fade-in flex items-center`;
    notif.innerHTML = `<i class="fas ${icon} mr-2"></i> ${msg}`;
    document.body.appendChild(notif);
    setTimeout(() => { notif.style.opacity = 0; notif.style.transition = 'opacity 0.3s'; setTimeout(() => notif.remove(), 300); }, 3000);
}

function initTeacherData() {
    const dispenserRecords = db.dispenser.filter(d => d.matriculeEnseignant === CURRENT_TEACHER);
    myCourses = dispenserRecords.map(d => db.cours.find(c => c.codecours === d.Codecours || c.codecours === d.Codecours || c.codecours === d.Codecours?.toUpperCase()));
    myCourses = myCourses.filter(Boolean);

    const classCodes = new Set();
    db.suivre.forEach(s => {
        if (myCourses.find(c => c.codecours === s.codecours)) {
            classCodes.add(s.Codeclasse);
        }
    });
    myClasses = Array.from(classCodes).map(code => db.classe.find(c => c.CodeClasse === code)).filter(Boolean);

    const teacher = db.enseignant.find(e => e.MatriculeEnseignant === CURRENT_TEACHER);
    if (teacher) {
        document.getElementById('prof-name').innerText = `${teacher.prenom} ${teacher.nom}`;
        document.getElementById('prof-mat').innerText = teacher.MatriculeEnseignant;
        document.getElementById('prof-avatar').innerText = `${teacher.prenom[0] || ''}${teacher.nom[0] || ''}`;
    }

    document.getElementById('active-period').innerText = ACTIVE_PERIOD;
    document.getElementById('eval-date').valueAsDate = new Date();
}

function renderCurrentTab(tabId) {
    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'classes') renderClasses();
    if (tabId === 'notes') initNotesForm();
    if (tabId === 'bulletins') initBulletinsForm();
}

function renderDashboard() {
    document.getElementById('stat-cours').innerText = myCourses.length;
    document.getElementById('stat-classes').innerText = myClasses.length;

    let totalEleves = 0;
    myClasses.forEach(c => {
        totalEleves += db.eleve.filter(e => e.CodeClasse === c.CodeClasse).length;
    });
    document.getElementById('stat-eleves').innerText = totalEleves;

    const myEvals = db.evaluation.filter(e => myCourses.find(c => c.codecours === e.codecours));
    const grouped = {};

    myEvals.forEach(e => {
        const key = `${e.dateevaluation}_${e.codecours}_${e.typeEvaluation}`;
        if (!grouped[key]) grouped[key] = { date: e.dateevaluation, type: e.typeEvaluation, cours: e.codecours, count: 0 };
        grouped[key].count++;
    });

    const tbody = document.getElementById('dash-evals-body');
    tbody.innerHTML = Object.values(grouped).reverse().slice(0, 5).map(g => {
        const cTitre = myCourses.find(c => c.codecours === g.cours).titre;
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-3 text-xs text-gray-500">${g.date}</td>
                <td class="px-6 py-3 font-medium">${g.type}</td>
                <td class="px-6 py-3 text-brand font-bold">${cTitre}</td>
                <td class="px-6 py-3 text-center"><span class="bg-violet-100 text-violet-800 px-2 py-1 rounded text-xs">${g.count} copies</span></td>
            </tr>`;
    }).join('');
}

function renderClasses() {
    const grid = document.getElementById('my-classes-grid');
    grid.innerHTML = myClasses.map(classe => {
        const nbEleves = db.eleve.filter(e => e.CodeClasse === classe.CodeClasse).length;
        const coursForClass = db.suivre.filter(s => s.Codeclasse === classe.CodeClasse && myCourses.find(c => c.codecours === s.codecours));
        const coursBadges = coursForClass.map(s => `<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">${s.codecours}</span>`).join(' ');

        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 class="text-xl font-bold text-dark text-brand">${classe.libelle} <span class="text-xs text-gray-400 font-mono ml-2">(${classe.CodeClasse})</span></h3>
                    <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full"><i class="fas fa-users mr-1"></i> ${nbEleves} élèves</span>
                </div>
                <div class="mb-3">
                    <p class="text-xs text-gray-500 uppercase font-bold mb-2">Cours que j'y dispense :</p>
                    <div class="flex gap-2">${coursBadges}</div>
                </div>
                <div class="mt-4 pt-3 border-t flex justify-end">
                    <button onclick="switchTab('notes'); setTimeout(()=>selectClassForEval('${coursForClass[0].codecours}','${classe.CodeClasse}'), 100);" class="text-sm text-brand hover:text-violet-800 font-medium">Saisir des notes <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>`;
    }).join('');
}

function initNotesForm() {
    const selectCours = document.getElementById('eval-cours');
    selectCours.innerHTML = '<option value="">-- Choisir un cours --</option>' + myCourses.map(c => `<option value="${c.codecours}">${c.titre} (${c.codecours})</option>`).join('');

    document.getElementById('eval-students-section').classList.add('hidden');
    document.getElementById('eval-empty-state').classList.remove('hidden');
}

function updateEvalClasses() {
    const cours = document.getElementById('eval-cours').value;
    const selectClasse = document.getElementById('eval-classe');

    if (!cours) {
        selectClasse.innerHTML = '<option value="">-- Choisir --</option>';
        return;
    }

    const classesIds = db.suivre.filter(s => s.codecours === cours).map(s => s.Codeclasse);
    const validClasses = myClasses.filter(c => classesIds.includes(c.CodeClasse));

    selectClasse.innerHTML = '<option value="">-- Sélectionner la classe --</option>' + validClasses.map(c => `<option value="${c.CodeClasse}">${c.libelle}</option>`).join('');

    document.getElementById('eval-students-section').classList.add('hidden');
    document.getElementById('eval-empty-state').classList.remove('hidden');
}

function selectClassForEval(coursId, classId) {
    document.getElementById('eval-cours').value = coursId;
    updateEvalClasses();
    document.getElementById('eval-classe').value = classId;
    loadStudentsForEval();
}

function loadStudentsForEval() {
    const classeId = document.getElementById('eval-classe').value;
    if (!classeId) return;

    const eleves = db.eleve.filter(e => e.CodeClasse === classeId);
    const tbody = document.getElementById('eval-students-list');

    tbody.innerHTML = eleves.map(e => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-2 font-mono text-xs text-gray-500">${e.Matricule}</td>
            <td class="px-6 py-2 font-medium text-dark">${e.nom} ${e.Postnom} ${e.prenom}</td>
            <td class="px-6 py-2 text-right">
                <input type="number" min="0" max="20" step="0.5" class="grade-input border-b-2 border-gray-300 focus:border-brand focus:outline-none w-20 text-center font-bold text-lg p-1 bg-transparent" data-mat="${e.Matricule}">
            </td>
        </tr>`).join('');

    document.getElementById('eval-empty-state').classList.add('hidden');
    document.getElementById('eval-students-section').classList.remove('hidden');
}

function saveBulkEvaluations() {
    const cours = document.getElementById('eval-cours').value;
    const type = document.getElementById('eval-type').value;
    const dateStr = document.getElementById('eval-date').value;

    if (!cours || !dateStr) {
        showNotif("Veuillez remplir les informations de l'évaluation", "error");
        return;
    }

    const inputs = document.querySelectorAll('.grade-input');
    let count = 0;

    inputs.forEach(input => {
        if (input.value !== '') {
            const note = parseFloat(input.value);
            const mat = input.getAttribute('data-mat');

            db.evaluation.push({
                IdEvaluation: 'EV' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 100),
                typeEvaluation: type,
                dateevaluation: dateStr,
                note: note,
                codecours: cours,
                MatriculeEleve: mat
            });
            count++;
            input.value = '';
        }
    });

    if (count > 0) {
        showNotif(`${count} notes enregistrées avec succès dans la table Evaluation.`);
        document.getElementById('eval-classe').value = '';
        document.getElementById('eval-students-section').classList.add('hidden');
        document.getElementById('eval-empty-state').classList.remove('hidden');
    } else {
        showNotif("Aucune note n'a été saisie.", "error");
    }
}

function initBulletinsForm() {
    const selectCours = document.getElementById('bull-cours');
    selectCours.innerHTML = '<option value="">-- Choisir un cours --</option>' + myCourses.map(c => `<option value="${c.codecours}">${c.titre}</option>`).join('');
    document.getElementById('averages-results').classList.add('hidden');
}

function updateBullClasses() {
    const cours = document.getElementById('bull-cours').value;
    const selectClasse = document.getElementById('bull-classe');

    if (!cours) return;

    const classesIds = db.suivre.filter(s => s.codecours === cours).map(s => s.Codeclasse);
    selectClasse.innerHTML = myClasses.filter(c => classesIds.includes(c.CodeClasse)).map(c => `<option value="${c.CodeClasse}">${c.libelle}</option>`).join('');
    document.getElementById('averages-results').classList.add('hidden');
}

function calculateAverages() {
    const cours = document.getElementById('bull-cours').value;
    const classeId = document.getElementById('bull-classe').value;

    if (!cours || !classeId) {
        showNotif("Sélectionnez un cours et une classe.", "error");
        return;
    }

    const eleves = db.eleve.filter(e => e.CodeClasse === classeId);
    const evals = db.evaluation.filter(e => e.codecours === cours);
    const tbody = document.getElementById('averages-body');
    tbody.innerHTML = '';

    eleves.forEach(el => {
        const notesEleve = evals.filter(e => e.MatriculeEleve === el.Matricule);
        let moyenne = '-';
        if (notesEleve.length > 0) {
            const somme = notesEleve.reduce((acc, curr) => acc + curr.note, 0);
            moyenne = (somme / notesEleve.length).toFixed(1);
        }
        const colorClass = moyenne !== '-' ? (moyenne >= 10 ? 'text-emerald-600' : 'text-red-600') : 'text-gray-400';

        tbody.innerHTML += `
            <tr>
                <td class="px-4 py-3 font-mono text-xs">${el.Matricule}</td>
                <td class="px-4 py-3 font-medium">${el.nom} ${el.prenom}</td>
                <td class="px-4 py-3 text-center">${notesEleve.length}</td>
                <td class="px-4 py-3 text-right font-bold text-lg ${colorClass}">${moyenne}</td>
            </tr>`;
    });

    document.getElementById('averages-results').classList.remove('hidden');
}

function submitAveragesToAdmin() {
    showNotif("Moyennes transmises au secrétariat avec succès.");
    document.getElementById('averages-results').classList.add('hidden');
}

window.onload = () => {
    initTeacherData();
    switchTab('dashboard');
};
