const routes = {
    'admin': '../admin/index.html',
    'caisse': '../caisse/index.html',
    'prof': '../professeur/index.html',
    'eleve': '../portail-eleve/index.html'
};

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const role = document.getElementById('role').value;

    if (!role) {
        alert('Veuillez sélectionner un profil valide.');
        return;
    }

    const targetFile = routes[role];
    if (!targetFile) {
        alert('Profil introuvable.');
        return;
    }

    window.location.href = targetFile;
});
