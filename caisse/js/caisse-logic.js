// --- 1. BASE DE DONNÉES SIMULÉE (Focus Caisse) ---
const db = {
    eleve: [
        { Matricule: 'MAT001', nom: 'ILUNGA', Postnom: 'MBUYI', prenom: 'David', TelephoneParent: '0810000001', CodeClasse: '7A' },
        { Matricule: 'MAT002', nom: 'KABEYA', Postnom: '', prenom: 'Sarah', TelephoneParent: '0820000002', CodeClasse: '8A' },
        { Matricule: 'MAT003', nom: 'LUKUSA', Postnom: 'TSHIBANGU', prenom: 'Marc', TelephoneParent: '0990000003', CodeClasse: '7B' }
    ],
    periode: [
        { CodePeriode: 'T1-2026', libelle: 'Trimestre 1' },
        { CodePeriode: 'T2-2026', libelle: 'Trimestre 2' }
    ],
    paiement: [
        { NumPaiement: 'REC-00100', DatePaiement: '2026-07-16 08:30', Montant: 150, modepaiement: 'Espèces', tranche: 'Acompte', CodePeriode: 'T1-2026', MatriculeEleve: 'MAT001' },
        { NumPaiement: 'REC-00101', DatePaiement: '2026-07-16 10:15', Montant: 300, modepaiement: 'Banque', tranche: 'Totalité', CodePeriode: 'T1-2026', MatriculeEleve: 'MAT002' },
        { NumPaiement: 'REC-00102', DatePaiement: '2026-07-17 09:00', Montant: 100, modepaiement: 'M-Pesa', tranche: 'Acompte', CodePeriode: 'T1-2026', MatriculeEleve: 'MAT003' }
    ]
};

const ACTIVE_PERIOD = 'T1-2026';
let receiptCounter = 103;

const sections = ['dashboard', 'encaisser', 'historique', 'eleves'];
const pageTitles = {
    'dashboard': 'Tableau de bord financier',
    'encaisser': 'Enregistrer un Encaissement',
    'historique': 'Historique des Paiements',
    'eleves': 'Annuaire Élèves (Lecture Seule)'
};

function switchTab(tabId) {
    sections.forEach(sec => {
        document.getElementById(`sec-${sec}`).classList.add('hidden');
        document.getElementById(`sec-${sec}`).classList.remove('block');
        document.getElementById(`nav-${sec}`).classList.remove('active-nav');
        document.getElementById(`nav-${sec}`).classList.add('text-emerald-300');
    });

    document.getElementById(`sec-${tabId}`).classList.remove('hidden');
    document.getElementById(`sec-${tabId}`).classList.add('block');
    document.getElementById(`nav-${tabId}`).classList.add('active-nav');
    document.getElementById(`nav-${tabId}`).classList.remove('text-emerald-300');
    document.getElementById('page-title').innerText = pageTitles[tabId];

    renderData();
}

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function renderData() {
    renderDashboard();
    renderSelects();
    renderHistorique();
    renderElevesReadOnly();
}

function renderDashboard() {
    const todayStr = getTodayDateString();
    let totalToday = 0;
    let totalPeriod = 0;
    let countToday = 0;

    db.paiement.forEach(p => {
        if (p.CodePeriode === ACTIVE_PERIOD) {
            totalPeriod += parseFloat(p.Montant);
        }
        if (p.DatePaiement.startsWith(todayStr)) {
            totalToday += parseFloat(p.Montant);
            countToday++;
        }
    });

    document.getElementById('stat-today').innerText = totalToday + ' $';
    document.getElementById('stat-period').innerText = totalPeriod + ' $';
    document.getElementById('stat-transactions').innerText = countToday;

    const recent = [...db.paiement].reverse().slice(0, 5);
    document.getElementById('dash-recent-body').innerHTML = recent.map(p => `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-6 py-3 font-mono text-brand font-bold text-xs">${p.NumPaiement}</td>
            <td class="px-6 py-3 text-gray-500 text-xs">${p.DatePaiement}</td>
            <td class="px-6 py-3 font-medium">${p.MatriculeEleve}</td>
            <td class="px-6 py-3 text-right font-bold text-gray-800">${p.Montant} $</td>
        </tr>
    `).join('');
}

function renderSelects() {
    const eleveOpts = '<option value="">-- Choisir un élève --</option>' +
        db.eleve.map(e => `<option value="${e.Matricule}">${e.Matricule} - ${e.nom} ${e.prenom}</option>`).join('');
    document.getElementById('pay-eleve').innerHTML = eleveOpts;

    const perOpts = db.periode.map(p => `<option value="${p.CodePeriode}" ${p.CodePeriode === ACTIVE_PERIOD ? 'selected' : ''}>${p.libelle} (${p.CodePeriode})</option>`).join('');
    document.getElementById('pay-periode').innerHTML = perOpts;
}

function renderHistorique() {
    const searchTerm = document.getElementById('search-pay').value.toLowerCase();
    const filtered = db.paiement.filter(p =>
        p.NumPaiement.toLowerCase().includes(searchTerm) ||
        p.MatriculeEleve.toLowerCase().includes(searchTerm)
    ).reverse();

    document.getElementById('table-historique-body').innerHTML = filtered.map(p => {
        const per = db.periode.find(x => x.CodePeriode === p.CodePeriode)?.libelle || p.CodePeriode;
        return `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="px-6 py-4 font-mono font-bold text-brand">${p.NumPaiement}</td>
                <td class="px-6 py-4 text-xs text-gray-500">${p.DatePaiement}</td>
                <td class="px-6 py-4 font-medium">${p.MatriculeEleve}</td>
                <td class="px-6 py-4 text-xs">${per}</td>
                <td class="px-6 py-4">
                    <span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">${p.tranche}</span>
                    <span class="text-xs text-gray-500 block mt-1"><i class="fas fa-wallet mr-1"></i>${p.modepaiement}</span>
                </td>
                <td class="px-6 py-4 text-right font-bold text-lg text-gray-800">${p.Montant} $</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="viewReceipt('${p.NumPaiement}')" class="text-blue-500 hover:text-blue-700" title="Voir le reçu"><i class="fas fa-eye"></i></button>
                </td>
            </tr>`;
    }).join('');
}

function renderElevesReadOnly() {
    document.getElementById('table-eleves-ro-body').innerHTML = db.eleve.map(e => `
        <tr class="hover:bg-gray-50 border-b border-gray-100">
            <td class="px-6 py-3 font-mono text-gray-500 text-xs">${e.Matricule}</td>
            <td class="px-6 py-3 font-medium">${e.nom} ${e.Postnom} ${e.prenom}</td>
            <td class="px-6 py-3"><span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">${e.CodeClasse}</span></td>
            <td class="px-6 py-3 text-gray-600">${e.TelephoneParent}</td>
        </tr>
    `).join('');
}

function updateStudentInfo() {
    const mat = document.getElementById('pay-eleve').value;
    const card = document.getElementById('student-info-card');

    if (!mat) {
        card.classList.add('hidden');
        return;
    }

    const eleve = db.eleve.find(e => e.Matricule === mat);
    if (eleve) {
        document.getElementById('info-nom').innerText = `${eleve.nom} ${eleve.Postnom} ${eleve.prenom}`;
        document.getElementById('info-classe').innerText = eleve.CodeClasse;
        document.getElementById('info-parent').innerText = eleve.TelephoneParent;
        card.classList.remove('hidden');
    }
}

function processPaiement(e) {
    e.preventDefault();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0] + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const numRecu = 'REC-00' + receiptCounter++;

    const nouveauPaiement = {
        NumPaiement: numRecu,
        DatePaiement: dateStr,
        Montant: parseFloat(document.getElementById('pay-montant').value),
        modepaiement: document.getElementById('pay-mode').value,
        tranche: document.getElementById('pay-tranche').value,
        CodePeriode: document.getElementById('pay-periode').value,
        MatriculeEleve: document.getElementById('pay-eleve').value
    };

    db.paiement.push(nouveauPaiement);
    document.getElementById('form-paiement').reset();
    document.getElementById('student-info-card').classList.add('hidden');

    renderData();
    viewReceipt(numRecu);
    showNotification('Encaissement validé avec succès.');
}

function viewReceipt(numPaiement) {
    const p = db.paiement.find(x => x.NumPaiement === numPaiement);
    if (!p) return;

    const eleve = db.eleve.find(e => e.Matricule === p.MatriculeEleve);
    const periode = db.periode.find(x => x.CodePeriode === p.CodePeriode);

    document.getElementById('rec-num').innerText = p.NumPaiement;
    document.getElementById('rec-date').innerText = p.DatePaiement;
    document.getElementById('rec-mat').innerText = p.MatriculeEleve;
    document.getElementById('rec-nom').innerText = eleve ? `${eleve.nom} ${eleve.prenom}` : 'Inconnu';
    document.getElementById('rec-classe').innerText = eleve ? eleve.CodeClasse : '---';
    document.getElementById('rec-periode').innerText = periode ? periode.libelle : p.CodePeriode;
    document.getElementById('rec-tranche').innerText = p.tranche;
    document.getElementById('rec-mode').innerText = p.modepaiement;
    document.getElementById('rec-montant').innerText = p.Montant + ' $';

    document.getElementById('modal-receipt').classList.remove('hidden');
}

function closeReceipt() {
    document.getElementById('modal-receipt').classList.add('hidden');
}

function printReceipt() {
    const btn = event.currentTarget;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Impression...';

    setTimeout(() => {
        btn.innerHTML = originalHtml;
        closeReceipt();
    }, 1000);
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded shadow-lg z-50 border-l-4 border-brand fade-in flex items-center';
    notif.innerHTML = `<i class="fas fa-check-circle mr-2 text-brand"></i> ${message}`;
    document.body.appendChild(notif);
    setTimeout(() => { notif.style.opacity = 0; setTimeout(() => notif.remove(), 300); }, 3000);
}

window.onload = () => {
    renderData();
    switchTab('dashboard');
};
