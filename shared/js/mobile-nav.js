function toggleMobileNav() {
    document.body.classList.toggle('menu-open');
}

document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('menu-open')) return;
    if (event.target.closest('aside') || event.target.closest('.mobile-menu-toggle')) return;
    document.body.classList.remove('menu-open');
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.body.classList.remove('menu-open');
});

document.querySelectorAll('aside a').forEach((link) => {
    link.addEventListener('click', () => document.body.classList.remove('menu-open'));
});
