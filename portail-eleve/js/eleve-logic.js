// --- Mock Data (Tables de la Base de Données) ---
// L'étudiant qui se connecte au portail
const currentStudentMatricule = 'MAT001';

const eleves = [
    { matricule: 'MAT001', nom: 'ILUNGA', postnom: 'MBUYI', prenom: 'David', sexe: 'M', dateN: '2010-05-12', adresse: 'Q. Joli Parc', telParent: '+243810000001', codeClasse: '7A' },
    { matricule: 'MAT002', nom: 'KASONGO', postnom: 'NGALULA', prenom: 'Sarah', sexe: 'F', dateN: '2011-02-20', adresse: 'C. Kasa-Vubu', telParent: '+243820000002', codeClasse: '7A' }
];

const cours = [
    { codecours: 'MATH-7', titre: 'Mathématiques', volumeHoraire: 120 },
    { codecours: 'FR-7', titre: 'Français', volumeHoraire: 100 },
    { codecours: 'INFO-7', titre: 'Informatique', volumeHoraire: 60 },
    { codecours: 'PHYS-7', titre: 'Physique', volumeHoraire: 80 }
];

const evaluations = [
    { idEval: 'EV-001', type: 'Interrogation', date: '2026-10-12', note: 16, codecours: 'MATH-7', matriculeEleve: 'MAT001' },
    { idEval: 'EV-002', type: 'Devoir', date: '2026-10-15', note: 14.5, codecours: 'FR-7', matriculeEleve: 'MAT001' },
    { idEval: 'EV-003', type: 'Examen', date: '2026-12-10', note: 18, codecours: 'INFO-7', matriculeEleve: 'MAT001' },
    { idEval: 'EV-005', type: 'Interrogation', date: '2026-11-20', note: 15, codecours: 'PHYS-7', matriculeEleve: 'MAT001' },
    { idEval: 'EV-004', type: 'Interrogation', date: '2026-10-12', note: 12, codecours: 'MATH-7', matriculeEleve: 'MAT002' }
];

const bulletins = [
    { numBulletin: 'BUL-T1-MAT001', moyenne: 15.8, resultat: 'Admis', matriculeEleve: 'MAT001', codePeriode: 'Trimestre 1' }
];

const paiements = [
    { num: 'REC-1001', date: '2026-09-10', montant: 150, mode: 'M-Pesa', tranche: 'Acompte', matricule: 'MAT001' },
    { num: 'REC-1089', date: '2026-11-05', montant: 100, mode: 'Banque', tranche: 'Solde T1', matricule: 'MAT001' },
    { num: 'REC-1002', date: '2026-09-11', montant: 300, mode: 'Espèces', tranche: 'Totalité', matricule: 'MAT002' }
];

function renderEspaceEleve() {
    const student = eleves.find(e => e.matricule === currentStudentMatricule);
    if (!student) return;

    const fullName = `${student.prenom} ${student.nom} ${student.postnom}`;
    const initials = `${student.prenom.charAt(0)}${student.nom.charAt(0)}`;

    document.getElementById('student-name').innerText = fullName;
    document.getElementById('student-matricule').innerText = student.matricule;
    document.getElementById('student-class').innerText = student.codeClasse;
    document.getElementById('student-avatar').innerText = initials;
    document.getElementById('sidebar-name').innerText = fullName;
    document.getElementById('sidebar-mat').innerText = student.matricule;
    document.getElementById('sidebar-avatar').innerText = initials;

    const tbodyEval = document.getElementById('student-evaluations-body');
    tbodyEval.innerHTML = '';

    const myEvals = evaluations.filter(e => e.matriculeEleve === currentStudentMatricule);
    myEvals.sort((a, b) => new Date(a.date) - new Date(b.date));

    myEvals.forEach(ev => {
        const monCours = cours.find(c => c.codecours === ev.codecours);
        const dateObj = new Date(ev.date);
        const dateFr = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        const noteColorClass = ev.note >= 10 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50/50 transition-colors group';
        tr.innerHTML = `
            <td class="px-5 py-4 whitespace-nowrap text-gray-500"><i class="far fa-calendar-alt mr-2 text-gray-400"></i>${dateFr}</td>
            <td class="px-5 py-4">
                <p class="font-semibold text-gray-800">${monCours ? monCours.titre : ev.codecours}</p>
                <p class="text-[11px] text-gray-400 font-mono mt-0.5">${ev.codecours}</p>
            </td>
            <td class="px-5 py-4 text-gray-600">
                <span class="px-2 py-1 bg-gray-100 rounded text-xs font-medium">${ev.type}</span>
            </td>
            <td class="px-5 py-4 text-right">
                <span class="inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-base ${noteColorClass} border border-transparent group-hover:border-current transition-colors">
                    ${ev.note}
                </span>
            </td>
        `;
        tbodyEval.appendChild(tr);
    });

    const containerBull = document.getElementById('student-bulletins-container');
    containerBull.innerHTML = '';
    const myBulls = bulletins.filter(b => b.matriculeEleve === currentStudentMatricule);

    myBulls.forEach(b => {
        containerBull.innerHTML += `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white rounded-xl border border-gray-200 hover:border-accent hover:shadow-md transition-all">
                <div class="mb-3 sm:mb-0">
                    <h4 class="font-bold text-gray-900 text-lg">${b.codePeriode}</h4>
                    <p class="text-xs text-gray-500 font-mono mt-1"><i class="fas fa-barcode mr-1"></i> Réf: ${b.numBulletin}</p>
                </div>
                <div class="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <div class="text-right">
                        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Moyenne</p>
                        <p class="font-bold text-xl text-primary leading-tight">${b.moyenne} <span class="text-sm text-gray-400 font-normal">/20</span></p>
                    </div>
                    <div class="h-8 w-px bg-gray-300"></div>
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-md font-bold text-sm flex items-center shadow-sm">
                        <i class="fas fa-check-circle mr-1.5"></i> ${b.resultat}
                    </span>
                </div>
            </div>
        `;
    });

    const tbodyPay = document.getElementById('student-payments-body');
    tbodyPay.innerHTML = '';
    const myPays = paiements.filter(p => p.matricule === currentStudentMatricule);

    myPays.forEach(p => {
        const dateObj = new Date(p.date);
        const dateFr = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="px-4 py-3">
                <p class="font-mono text-xs font-bold text-gray-700">${p.num}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">${dateFr}</p>
            </td>
            <td class="px-4 py-3">
                <span class="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-1 rounded font-medium">${p.tranche}</span>
                <p class="text-[10px] text-gray-500 mt-1"><i class="fas fa-wallet mr-1"></i>${p.mode}</p>
            </td>
            <td class="px-4 py-3 text-right">
                <span class="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded block w-max ml-auto">
                    ${p.montant} $
                </span>
            </td>
        `;
        tbodyPay.appendChild(tr);
    });
}

window.onload = function() {
    renderEspaceEleve();
};
