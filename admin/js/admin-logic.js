// --- Mock Data simulating the Database Tables ---

let eleves = [
    { matricule: 'MAT001', nom: 'ILUNGA', postnom: 'MBUYI', prenom: 'David', sexe: 'M', dateN: '2010-05-12', adresse: 'Q. Joli Parc, Ngaliema', telParent: '+243810000001', codeClasse: '7A' },
    { matricule: 'MAT002', nom: 'KASONGO', postnom: 'NGALULA', prenom: 'Sarah', sexe: 'F', dateN: '2011-02-20', adresse: 'C. Kasa-Vubu, Kinshasa', telParent: '+243820000002', codeClasse: '7A' },
    { matricule: 'MAT003', nom: 'KABEYA', postnom: 'MUTOMBO', prenom: 'Josué', sexe: 'M', dateN: '2009-11-05', adresse: 'Q. Righini, Lemba', telParent: '+243990000003', codeClasse: '8A' },
    { matricule: 'MAT004', nom: 'TULUKA', postnom: '', prenom: 'Bénédicte', sexe: 'F', dateN: '2010-08-30', adresse: 'Bandalungwa', telParent: '+243850000004', codeClasse: '7B' }
];

const enseignants = [
    { matProf: 'PRF-01', nom: 'KAPINGA', prenom: 'Alain', sexe: 'M', tel: '0812345678', spec: 'Mathématiques', dateEmb: '2018-09-01' },
    { matProf: 'PRF-02', nom: 'LUMUMBA', prenom: 'Patrice', sexe: 'M', tel: '0823456789', spec: 'Histoire/Géo', dateEmb: '2020-01-15' },
    { matProf: 'PRF-03', nom: 'MUSAU', prenom: 'Chantal', sexe: 'F', tel: '0994567890', spec: 'Français', dateEmb: '2015-11-02' }
];

const classes = [
    { code: '7A', libelle: '7ème A', capacite: 40 },
    { code: '7B', libelle: '7ème B', capacite: 40 },
    { code: '8A', libelle: '8ème A', capacite: 35 }
];

let paiements = [
    { num: 'REC-1001', date: '2026-09-10', montant: 150, mode: 'M-Pesa', tranche: 'Acompte', matricule: 'MAT001' },
    { num: 'REC-1002', date: '2026-09-11', montant: 300, mode: 'Espèces', tranche: 'Totalité', matricule: 'MAT002' },
    { num: 'REC-1003', date: '2026-09-15', montant: 100, mode: 'Airtel Money', tranche: 'Acompte', matricule: 'MAT004' }
];

// --- Core Functions ---

function renderDashboard() {
    document.getElementById('stat-eleves').innerText = eleves.length;
    document.getElementById('stat-profs').innerText = enseignants.length;
    document.getElementById('stat-classes').innerText = classes.length;

    const totalRecettes = paiements.reduce((sum, p) => sum + p.montant, 0);
    document.getElementById('stat-finances').innerText = totalRecettes + ' $';

    const tbody = document.getElementById('dash-payments-body');
    tbody.innerHTML = '';
    const recent = [...paiements].reverse().slice(0, 3);
    recent.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        tr.innerHTML = `
            <td class="px-4 py-3 font-medium text-gray-900">${p.matricule}</td>
            <td class="px-4 py-3 text-accent font-bold">${p.montant} $</td>
            <td class="px-4 py-3">${p.date}</td>
            <td class="px-4 py-3"><span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Validé</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderEleves() {
    const tbody = document.getElementById('table-eleves-body');
    tbody.innerHTML = '';
    eleves.forEach(e => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50 transition-colors';
        const avatarColor = e.sexe === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600';
        tr.innerHTML = `
            <td class="px-6 py-4 font-semibold text-primary">${e.matricule}</td>
            <td class="px-6 py-4 flex items-center">
                <div class="w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center mr-3 font-bold text-xs">
                    ${e.nom.charAt(0)}${e.prenom.charAt(0)}
                </div>
                <div>
                    <p class="font-medium text-gray-800">${e.nom} ${e.postnom} ${e.prenom}</p>
                </div>
            </td>
            <td class="px-6 py-4">${e.sexe}</td>
            <td class="px-6 py-4"><span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">${e.codeClasse}</span></td>
            <td class="px-6 py-4">${e.telParent}</td>
            <td class="px-6 py-4 text-center">
                <button class="text-blue-500 hover:text-blue-700 mx-1" title="Voir profil"><i class="fas fa-eye"></i></button>
                <button class="text-accent hover:text-amber-700 mx-1" title="Modifier"><i class="fas fa-edit"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderEnseignants() {
    const grid = document.getElementById('grid-enseignants');
    grid.innerHTML = '';
    enseignants.forEach(p => {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500 flex flex-col items-center text-center';
        div.innerHTML = `
            <div class="w-20 h-20 rounded-full bg-gray-200 mb-4 overflow-hidden">
                <img src="https://placehold.co/100x100/e2e8f0/475569?text=${p.nom.charAt(0)}${p.prenom.charAt(0)}" alt="Prof">
            </div>
            <h3 class="text-lg font-bold text-gray-800">${p.nom} ${p.prenom}</h3>
            <p class="text-sm text-green-600 font-medium mb-3">${p.spec}</p>
            <div class="w-full text-left text-sm text-gray-600 space-y-2 border-t pt-3 mt-auto">
                <p><i class="fas fa-id-badge w-5 text-gray-400"></i> ${p.matProf}</p>
                <p><i class="fas fa-phone w-5 text-gray-400"></i> ${p.tel}</p>
                <p><i class="fas fa-calendar-alt w-5 text-gray-400"></i> Embauche: ${p.dateEmb}</p>
            </div>
        `;
        grid.appendChild(div);
    });
}

function renderPaiements() {
    const tbody = document.getElementById('table-paiements-body');
    tbody.innerHTML = '';
    paiements.forEach(p => {
        const eleve = eleves.find(e => e.matricule === p.matricule) || {nom: 'Inconnu', prenom: ''};
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        tr.innerHTML = `
            <td class="px-6 py-4 font-mono text-sm text-gray-600">${p.num}</td>
            <td class="px-6 py-4">${p.date}</td>
            <td class="px-6 py-4 font-medium text-gray-800">${eleve.nom} ${eleve.prenom} <span class="text-xs text-gray-400 block">${p.matricule}</span></td>
            <td class="px-6 py-4 font-bold text-accent">${p.montant} $</td>
            <td class="px-6 py-4">${p.mode}</td>
            <td class="px-6 py-4"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${p.tranche}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

const sections = ['dashboard', 'modelisation', 'eleves', 'enseignants', 'finances'];
const pageTitles = {
    'dashboard': 'Tableau de bord',
    'modelisation': 'Modélisation du Système',
    'eleves': 'Gestion des Élèves',
    'enseignants': 'Corps Professoral',
    'finances': 'Gestion Financière'
};

function switchTab(tabId) {
    sections.forEach(sec => {
        document.getElementById(`sec-${sec}`).classList.add('hidden');
        document.getElementById(`sec-${sec}`).classList.remove('block');
        document.getElementById(`nav-${sec}`).classList.remove('active-nav');
    });
    document.getElementById(`sec-${tabId}`).classList.remove('hidden');
    document.getElementById(`sec-${tabId}`).classList.add('block');
    document.getElementById(`nav-${tabId}`).classList.add('active-nav');
    document.getElementById('page-title').innerText = pageTitles[tabId];
    if (tabId === 'dashboard') renderDashboard();
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function handleAddEleve(e) {
    e.preventDefault();

    const newMat = 'MAT' + String(eleves.length + 1).padStart(3, '0');
    const newEleve = {
        matricule: newMat,
        nom: document.getElementById('el-nom').value.toUpperCase(),
        postnom: document.getElementById('el-postnom').value.toUpperCase(),
        prenom: document.getElementById('el-prenom').value,
        sexe: document.getElementById('el-sexe').value,
        dateN: document.getElementById('el-daten').value,
        codeClasse: document.getElementById('el-classe').value,
        adresse: document.getElementById('el-adresse').value,
        telParent: document.getElementById('el-tel').value
    };

    eleves.push(newEleve);
    renderEleves();
    renderDashboard();
    document.getElementById('form-add-eleve').reset();
    toggleModal('modal-add-eleve');
    showNotification(`Élève ${newEleve.nom} ajouté avec succès. Matricule: ${newMat}`);
}

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg fade-in z-50 flex items-center';
    notif.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${msg}`;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notif.remove(), 500);
    }, 3000);
}

window.onload = function() {
    renderDashboard();
    renderEleves();
    renderEnseignants();
    renderPaiements();
};
