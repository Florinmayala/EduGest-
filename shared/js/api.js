// Le navigateur appelle uniquement cette API; les identifiants SQL restent sur le serveur.
const Api = (() => {
    async function request(path, options = {}) {
        const response = await fetch(`/api${path}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || 'La requête a échoué.');
        return payload;
    }
    return {
        health: () => request('/health'),
        getEleves: (classe) => request(`/eleves${classe ? `?classe=${encodeURIComponent(classe)}` : ''}`),
        getPeriodes: () => request('/periodes'),
        getPaiements: (matricule) => request(`/paiements${matricule ? `?matricule=${encodeURIComponent(matricule)}` : ''}`),
        createPaiement: (data) => request('/paiements', { method: 'POST', body: JSON.stringify(data) })
        ,getAppData: () => request('/app-data')
        ,createAdmin: (resource, data) => request(`/admin/${['eleves', 'enseignants'].includes(resource) ? resource : `structure/${resource}`}`, { method: 'POST', body: JSON.stringify(data) })
        ,saveEvaluations: (data) => request('/evaluations/bulk', { method: 'POST', body: JSON.stringify(data) })
    };
})();
